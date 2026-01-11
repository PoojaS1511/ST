from flask import Blueprint, jsonify, request
from functools import wraps
from supabase_client import get_supabase

# Create blueprint
quality_audits_bp = Blueprint('quality_audits', __name__)

# Simple CORS decorator
def cors_enabled(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Handle OPTIONS requests
        if request.method == 'OPTIONS':
            response = jsonify({'status': 'preflight'})
            origin = request.headers.get('Origin', 'http://localhost:3001')
            allowed_origins = ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001']
            if origin in allowed_origins:
                response.headers.add('Access-Control-Allow-Origin', origin)
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
            response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
            return response
        
        # Handle actual requests
        response = f(*args, **kwargs)
        if hasattr(response, 'headers'):
            origin = request.headers.get('Origin', 'http://localhost:3001')
            allowed_origins = ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001']
            if origin in allowed_origins:
                response.headers.add('Access-Control-Allow-Origin', origin)
            response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    return decorated_function

@quality_audits_bp.route('/audits', methods=['GET', 'OPTIONS'])
@cors_enabled
def get_audits():
    """Get quality audits from Supabase"""
    try:
        supabase = get_supabase()

        # Get pagination parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        offset = (page - 1) * limit

        # Get filter parameters
        search = request.args.get('search', '')
        department_filter = request.args.get('department', '')
        status_filter = request.args.get('status', '')
        audit_type_filter = request.args.get('audit_type', '')

        # Build query
        query = supabase.table('quality_audits').select('*', count='exact')

        # Apply filters
        if search:
            query = query.or_(f"department.ilike.%{search}%,auditor_name.ilike.%{search}%,remarks.ilike.%{search}%")
        if department_filter:
            query = query.eq('department', department_filter)
        if status_filter:
            query = query.eq('status', status_filter)

        # Get total count for pagination
        total_query = query
        total_result = supabase.table('quality_audits').select('*', count='exact').execute()
        total_count = total_result.count if hasattr(total_result, 'count') else 0

        # Apply pagination
        query = query.range(offset, offset + limit - 1)

        # Execute query
        result = query.execute()

        if not hasattr(result, 'data'):
            return jsonify({
                'success': False,
                'error': 'Failed to fetch data from Supabase'
            }), 500

        # Map database fields to frontend expected fields
        audits = []
        for audit in result.data:
            mapped_audit = {
                'id': audit.get('audit_id'),
                'title': f"Audit - {audit.get('department', 'Unknown')}",
                'department': audit.get('department', ''),
                'audit_type': 'internal',  # Default since not in schema
                'scheduled_date': audit.get('audit_date', ''),
                'auditor': audit.get('auditor_name', ''),
                'findings': audit.get('remarks', ''),
                'recommendations': '',  # Not in schema
                'status': audit.get('status', 'pending'),
                'compliance_score': audit.get('compliance_score')
            }
            audits.append(mapped_audit)

        total_pages = (total_count + limit - 1) // limit if total_count > 0 else 1

        return jsonify({
            'success': True,
            'data': audits,
            'pagination': {
                'currentPage': page,
                'totalPages': total_pages,
                'totalRecords': total_count,
                'limit': limit
            }
        })

    except Exception as e:
        print(f"Error fetching audits: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@quality_audits_bp.route('/audits/analytics', methods=['GET', 'OPTIONS'])
@cors_enabled
def get_audit_analytics():
    """Get audit analytics data"""
    try:
        supabase = get_supabase()

        # Get all audits for analytics
        result = supabase.table('quality_audits').select('*').execute()

        if not hasattr(result, 'data'):
            return jsonify({
                'success': False,
                'error': 'Failed to fetch analytics data'
            }), 500

        audits = result.data

        # Calculate analytics
        total_audits = len(audits)
        completed_audits = len([a for a in audits if a.get('status') == 'completed'])
        pending_audits = len([a for a in audits if a.get('status') == 'pending'])
        in_progress_audits = len([a for a in audits if a.get('status') == 'in_progress'])

        # Department compliance scores
        department_scores = {}
        for audit in audits:
            dept = audit.get('department', 'Unknown')
            score = audit.get('compliance_score')
            if score is not None:
                if dept not in department_scores:
                    department_scores[dept] = []
                department_scores[dept].append(score)

        compliance_scores = [
            {
                'department': dept,
                'score': sum(scores) / len(scores) if scores else 0
            }
            for dept, scores in department_scores.items()
        ]

        # Status distribution
        status_distribution = [
            {'status': 'completed', 'count': completed_audits},
            {'status': 'pending', 'count': pending_audits},
            {'status': 'in_progress', 'count': in_progress_audits}
        ]

        # Mock completion trends (since we don't have historical data)
        completion_trends = [
            {'month': 'Jan', 'rate': 85},
            {'month': 'Feb', 'rate': 88},
            {'month': 'Mar', 'rate': 92},
            {'month': 'Apr', 'rate': 87},
            {'month': 'May', 'rate': 90},
            {'month': 'Jun', 'rate': 93}
        ]

        return jsonify({
            'success': True,
            'data': {
                'total_audits': total_audits,
                'completed_audits': completed_audits,
                'pending_audits': pending_audits,
                'in_progress_audits': in_progress_audits,
                'compliance_scores': compliance_scores,
                'status_distribution': status_distribution,
                'completion_trends': completion_trends
            }
        })

    except Exception as e:
        print(f"Error fetching audit analytics: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
