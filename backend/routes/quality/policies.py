from flask import Blueprint, jsonify, request
from functools import wraps
import random
from supabase_client import get_supabase

# Create blueprint
quality_policies_bp = Blueprint('quality_policies', __name__)

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

@quality_policies_bp.route('/policies', methods=['GET', 'OPTIONS'])
@cors_enabled
def get_policies():
    """Get quality policies from Supabase"""
    try:
        supabase = get_supabase()

        # Get pagination parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        offset = (page - 1) * limit

        # Get filter parameters
        search = request.args.get('search', '')
        category_filter = request.args.get('category', '')
        status_filter = request.args.get('status', '')

        # Build query
        query = supabase.table('quality_policy').select('*', count='exact')

        # Apply filters
        if search:
            query = query.or_(f"policy_name.ilike.%{search}%,department.ilike.%{search}%,responsible_person.ilike.%{search}%")
        if category_filter:
            query = query.eq('category', category_filter)
        if status_filter:
            query = query.eq('compliance_status', status_filter)

        # Get total count for pagination
        total_query = query
        total_result = supabase.table('quality_policy').select('*', count='exact').execute()
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
        policies = []
        for policy in result.data:
            mapped_policy = {
                'id': policy.get('policy_id'),
                'title': policy.get('policy_name', ''),
                'description': policy.get('description', ''),
                'category': policy.get('category', 'General'),
                'department': policy.get('department', ''),
                'compliance_status': policy.get('compliance_status', 'pending'),
                'compliance_score': policy.get('compliance_score', 0),
                'next_review_date': policy.get('next_due_date', ''),
                'responsible_person': policy.get('responsible_person', '')
            }
            policies.append(mapped_policy)

        total_pages = (total_count + limit - 1) // limit if total_count > 0 else 1

        return jsonify({
            'success': True,
            'data': policies,
            'pagination': {
                'currentPage': page,
                'totalPages': total_pages,
                'totalItems': total_count,
                'limit': limit
            }
        })

    except Exception as e:
        print(f"Error fetching policies: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@quality_policies_bp.route('/policies/analytics', methods=['GET', 'OPTIONS'])
@cors_enabled
def get_policies_analytics():
    """Get policy analytics"""
    try:
        supabase = get_supabase()

        # Get all policies for analytics
        result = supabase.table('quality_policy').select('*').execute()

        if not result.data:
            # Return mock analytics if no data
            analytics = {
                'compliance_trends': [
                    {'month': 'Jan', 'rate': 80},
                    {'month': 'Feb', 'rate': 82},
                    {'month': 'Mar', 'rate': 85},
                    {'month': 'Apr', 'rate': 87},
                    {'month': 'May', 'rate': 90},
                    {'month': 'Jun', 'rate': 92}
                ],
                'upcoming_deadlines': [],
                'policy_compliance': []
            }
        else:
            # Calculate real analytics from data
            from datetime import datetime, timedelta
            import random

            # Compliance trends (mock for now, could be calculated from historical data)
            compliance_trends = [
                {'month': 'Jan', 'rate': 80},
                {'month': 'Feb', 'rate': 82},
                {'month': 'Mar', 'rate': 85},
                {'month': 'Apr', 'rate': 87},
                {'month': 'May', 'rate': 90},
                {'month': 'Jun', 'rate': 92}
            ]

            # Upcoming deadlines - get policies with next_due_date within 60 days
            upcoming_deadlines = []
            today = datetime.now().date()

            for policy in result.data[:10]:  # Limit to first 10 for display
                try:
                    due_date = datetime.strptime(policy['next_due_date'], '%Y-%m-%d').date()
                    days_left = (due_date - today).days
                    if 0 <= days_left <= 60:  # Only show upcoming or slightly overdue
                        upcoming_deadlines.append({
                            'policy': policy['policy_name'],
                            'days_left': max(0, days_left)
                        })
                except (ValueError, KeyError):
                    continue

            # Sort by days left
            upcoming_deadlines.sort(key=lambda x: x['days_left'])

            # Policy compliance status
            policy_compliance = []
            for policy in result.data[:10]:  # Limit to first 10
                policy_compliance.append({
                    'policy': policy['policy_name'],
                    'status': policy['compliance_status']
                })

            analytics = {
                'compliance_trends': compliance_trends,
                'upcoming_deadlines': upcoming_deadlines,
                'policy_compliance': policy_compliance
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
