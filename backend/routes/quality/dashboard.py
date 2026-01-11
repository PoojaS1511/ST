from flask import Blueprint, jsonify, request
from functools import wraps

# Create blueprint
quality_dashboard_bp = Blueprint('quality_dashboard', __name__)

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

@quality_dashboard_bp.route('/dashboard/kpis', methods=['GET', 'OPTIONS'])
@cors_enabled
def get_kpis():
    """Get dashboard KPIs for quality management"""
    try:
        kpis = {
            'total_faculty': 85,
            'pending_audits': 3,
            'open_grievances': 8,  # Changed from grievances_pending to match frontend
            'overall_policy_compliance_rate': 92.5,  # Added missing field
            'accreditation_readiness_score': 88,  # Added missing field
            'completed_audits': 27,
            'grievances_resolved': 42,
            'active_programs': 12,
            'accreditation_status': 'A+',
            'quality_score': 92.5,
            'monthly_trends': {
                'faculty_performance': [4.2, 4.3, 4.5, 4.4, 4.6, 4.5],
                'audit_completion_rate': [85, 88, 92, 90, 94, 95],
                'grievance_resolution_rate': [78, 82, 85, 88, 90, 92],
                'policy_compliance': [90, 91, 92, 93, 92, 94]
            }
        }
        
        return jsonify({
            'success': True,
            'data': kpis
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@quality_dashboard_bp.route('/dashboard/recent-activity', methods=['GET', 'OPTIONS'])
@cors_enabled
def get_recent_activity():
    """Get recent activity for quality management dashboard"""
    try:
        activities = [
            {
                'id': 1,
                'type': 'audit',
                'title': 'Department audit completed',
                'description': 'Computer Science department audit completed successfully',
                'status': 'completed',
                'updated_at': '2026-01-06T10:30:00Z'
            },
            {
                'id': 2,
                'type': 'grievance',
                'title': 'Student grievance resolved',
                'description': 'Grievance regarding course content resolved',
                'status': 'resolved',
                'updated_at': '2026-01-06T09:15:00Z'
            },
            {
                'id': 3,
                'type': 'policy',
                'title': 'NBA accreditation renewal submitted',
                'description': 'NBA accreditation renewal documentation submitted',
                'status': 'pending',
                'updated_at': '2026-01-05T16:45:00Z'
            },
            {
                'id': 4,
                'type': 'audit',
                'title': 'Internal quality audit scheduled',
                'description': 'Internal quality assurance audit scheduled for next week',
                'status': 'in_progress',
                'updated_at': '2026-01-05T14:20:00Z'
            },
            {
                'id': 5,
                'type': 'grievance',
                'title': 'Faculty grievance filed',
                'description': 'Grievance regarding workload distribution',
                'status': 'pending',
                'updated_at': '2026-01-04T11:30:00Z'
            }
        ]
        
        return jsonify({
            'success': True,
            'data': activities
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
