from flask import Blueprint, jsonify, request
from functools import wraps
import random

# Create blueprint
quality_grievances_bp = Blueprint('quality_grievances', __name__)

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

@quality_grievances_bp.route('/grievances', methods=['GET', 'OPTIONS'])
@cors_enabled
def get_grievances():
    """Get quality grievances"""
    try:
        grievances = [
            {
                'id': 1,
                'title': 'Course Content Issue',
                'description': 'Outdated course materials in Computer Science',
                'category': 'Academic',
                'priority': 'high',
                'status': 'pending',
                'user_type': 'student',
                'submitted_date': '2026-01-05',
                'ai_classification': 'Curriculum Update Needed'
            },
            {
                'id': 2,
                'title': 'Lab Equipment Problem',
                'description': 'Malfunctioning equipment in Physics lab',
                'category': 'Infrastructure',
                'priority': 'medium',
                'status': 'in_progress',
                'user_type': 'faculty',
                'submitted_date': '2026-01-04',
                'ai_classification': 'Maintenance Required'
            },
            {
                'id': 3,
                'title': 'Library Access Issue',
                'description': 'Limited access to digital resources during weekends',
                'category': 'Administrative',
                'priority': 'low',
                'status': 'resolved',
                'user_type': 'student',
                'submitted_date': '2026-01-03',
                'ai_classification': 'Policy Adjustment'
            }
        ]
        
        return jsonify({
            'success': True,
            'data': grievances,
            'pagination': {
                'currentPage': 1,
                'totalPages': 1,
                'totalItems': len(grievances)
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@quality_grievances_bp.route('/grievances/analytics', methods=['GET', 'OPTIONS'])
@cors_enabled
def get_grievances_analytics():
    """Get grievance analytics"""
    try:
        analytics = {
            'resolution_times': [
                {'category': 'Academic', 'avg_hours': 48},
                {'category': 'Administrative', 'avg_hours': 72},
                {'category': 'Infrastructure', 'avg_hours': 96}
            ],
            'category_distribution': [
                {'category': 'Academic', 'count': 35},
                {'category': 'Administrative', 'count': 25},
                {'category': 'Infrastructure', 'count': 15}
            ],
            'status_breakdown': [
                {'status': 'resolved', 'count': 55},
                {'status': 'in_progress', 'count': 15},
                {'status': 'pending', 'count': 5}
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
