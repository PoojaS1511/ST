from flask import Blueprint, jsonify, request
from functools import wraps
from supabase_client import get_supabase

# Create blueprint
quality_accreditation_bp = Blueprint('quality_accreditation', __name__)

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

@quality_accreditation_bp.route('/accreditation/readiness', methods=['GET', 'OPTIONS'])
@cors_enabled
def get_readiness_score():
    """Get accreditation readiness score from quality_accreditation table"""
    try:
        supabase = get_supabase()

        # Get all records
        result = supabase.table('quality_accreditation').select('*').execute()

        if not result.data:
            return jsonify({
                'success': True,
                'data': {
                    'overall_score': 0,
                    'readiness_level': 'poor',
                    'criteria_scores': {},
                    'department_scores': {}
                }
            })

        # Calculate overall score
        all_scores = [float(record['score']) for record in result.data if record['score']]
        overall_score = sum(all_scores) / len(all_scores) if all_scores else 0

        # Calculate department scores
        department_scores = {}
        for record in result.data:
            dept = record['department']
            score = float(record['score']) if record['score'] else 0

            if dept not in department_scores:
                department_scores[dept] = []
            department_scores[dept].append(score)

        # Average scores per department
        dept_avg_scores = {}
        for dept, scores in department_scores.items():
            dept_avg_scores[dept] = round(sum(scores) / len(scores), 1) if scores else 0

        # Determine readiness level
        if overall_score >= 90:
            readiness_level = 'excellent'
        elif overall_score >= 80:
            readiness_level = 'good'
        elif overall_score >= 70:
            readiness_level = 'average'
        else:
            readiness_level = 'poor'

        # Mock criteria scores (could be enhanced with more specific data)
        criteria_scores = {
            'Curriculum': 88,
            'Faculty': 82,
            'Infrastructure': 90,
            'Research': 78,
            'Student Support': 85,
            'Governance': 87
        }

        readiness_score = {
            'overall_score': round(overall_score, 1),
            'readiness_level': readiness_level,
            'criteria_scores': criteria_scores,
            'department_scores': dept_avg_scores
        }

        return jsonify({
            'success': True,
            'data': readiness_score
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@quality_accreditation_bp.route('/accreditation/analytics', methods=['GET', 'OPTIONS'])
@cors_enabled
def get_accreditation_analytics():
    """Get accreditation analytics"""
    try:
        analytics = {
            'score_trends': [
                {'date': '2024-01', 'score': 78},
                {'date': '2024-02', 'score': 80},
                {'date': '2024-03', 'score': 82},
                {'date': '2024-04', 'score': 81},
                {'date': '2024-05', 'score': 83},
                {'date': '2024-06', 'score': 85}
            ],
            'department_readiness': [
                {'department': 'Computer Science', 'readiness_score': 90},
                {'department': 'Electronics', 'readiness_score': 85},
                {'department': 'Mechanical', 'readiness_score': 82},
                {'department': 'Civil', 'readiness_score': 88}
            ],
            'readiness_distribution': [
                {'level': 'excellent', 'count': 1},
                {'level': 'good', 'count': 2},
                {'level': 'average', 'count': 1},
                {'level': 'poor', 'count': 0}
            ]
        }
        
        return jsonify({
            'success': True,
            'data': analytics
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@quality_accreditation_bp.route('/accreditation', methods=['GET', 'OPTIONS'])
@cors_enabled
def get_accreditation():
    """Get accreditation information from Supabase"""
    try:
        supabase = get_supabase()

        # Get pagination parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        offset = (page - 1) * limit

        # Get filter parameters
        search = request.args.get('search', '')
        status_filter = request.args.get('status', '')

        # Build query
        query = supabase.table('quality_accreditation').select('*', count='exact')

        # Apply filters
        if search:
            query = query.or_(f"report_type.ilike.%{search}%,department.ilike.%{search}%")
        if status_filter:
            query = query.eq('status', status_filter)

        # Get total count for pagination
        total_result = supabase.table('quality_accreditation').select('*', count='exact').execute()
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
        accreditation = []
        for record in result.data:
            mapped_record = {
                'id': record.get('report_id'),
                'body': record.get('report_type', 'NBA'),
                'program': record.get('department', 'General'),
                'status': record.get('status', 'pending'),
                'valid_until': record.get('valid_until', ''),
                'grade': 'A+' if record.get('score') and float(record.get('score', 0)) >= 90 else
                        'A' if record.get('score') and float(record.get('score', 0)) >= 80 else
                        'B+' if record.get('score') and float(record.get('score', 0)) >= 70 else 'B'
            }
            accreditation.append(mapped_record)

        total_pages = (total_count + limit - 1) // limit if total_count > 0 else 1

        return jsonify({
            'success': True,
            'data': accreditation,
            'pagination': {
                'currentPage': page,
                'totalPages': total_pages,
                'totalItems': total_count,
                'limit': limit
            }
        })

    except Exception as e:
        print(f"Error fetching accreditation: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@quality_accreditation_bp.route('/accreditation/reports', methods=['GET', 'OPTIONS'])
@cors_enabled
def get_accreditation_reports():
    """Get accreditation reports with pagination from quality_accreditation table"""
    try:
        supabase = get_supabase()
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))

        # Calculate offset for pagination
        offset = (page - 1) * limit

        # Query the quality_accreditation table with pagination
        query = supabase.table('quality_accreditation').select('*', count='exact')

        # Apply pagination
        result = query.range(offset, offset + limit - 1).execute()

        # Get total count
        total_count = result.count if hasattr(result, 'count') else 0

        # Transform data to match expected format
        reports = []
        for record in result.data:
            reports.append({
                'id': record['report_id'],
                'accreditation_body': record['report_type'],
                'academic_year': record['report_date'][:4] if record['report_date'] else '2024',  # Extract year from date
                'overall_score': float(record['score']) if record['score'] else 0,
                'readiness_level': 'excellent' if record['score'] and float(record['score']) >= 90 else
                                'good' if record['score'] and float(record['score']) >= 80 else
                                'average' if record['score'] and float(record['score']) >= 70 else 'poor',
                'generated_date': record['report_date'],
                'status': 'approved',  # Default status
                'department': record['department'],
                'recommendations': record['recommendations']
            })

        total_pages = (total_count + limit - 1) // limit

        return jsonify({
            'success': True,
            'data': reports,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total_count,
                'totalPages': total_pages
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@quality_accreditation_bp.route('/accreditation/reports', methods=['POST', 'OPTIONS'])
@cors_enabled
def generate_accreditation_report():
    """Generate accreditation report"""
    try:
        data = request.get_json()
        
        # Mock report generation
        new_report = {
            'id': 999,
            'accreditation_body': data.get('accreditation_body', 'NAAC'),
            'academic_year': data.get('academic_year', '2024'),
            'overall_score': 85,
            'readiness_level': 'good',
            'generated_date': '2024-01-07',
            'status': 'draft'
        }
        
        return jsonify({
            'success': True,
            'data': new_report,
            'message': 'Accreditation report generated successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
