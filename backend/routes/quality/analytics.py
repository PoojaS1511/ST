from flask import Blueprint, jsonify, request
from functools import wraps

# Create blueprint
quality_analytics_bp = Blueprint('quality_analytics', __name__)

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

@quality_analytics_bp.route('/analytics/comprehensive', methods=['GET', 'OPTIONS'])
@cors_enabled
def get_comprehensive_analytics():
    """Get comprehensive quality analytics"""
    try:
        analytics = {
            'institutional_metrics': {
                'total_students': 2500,
                'total_faculty': 85,
                'student_faculty_ratio': 29.4,
                'accreditation_score': 'A+',
                'quality_index': 92.5
            },
            'academic_performance': {
                'average_cgpa': 8.2,
                'pass_percentage': 94.5,
                'placement_rate': 87.3,
                'higher_studies_rate': 12.8
            },
            'research_metrics': {
                'total_publications': 156,
                'cited_papers': 89,
                'research_grants': 12,
                'patents_filed': 8
            },
            'infrastructure': {
                'classrooms': 45,
                'labs': 28,
                'library_seating': 200,
                'smart_classrooms': 30
            }
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

@quality_analytics_bp.route('/analytics/insights', methods=['GET', 'OPTIONS'])
@cors_enabled
def get_ai_insights():
    """Get AI-powered insights"""
    try:
        insights = {
            'performance_trends': {
                'student_performance': 'improving',
                'faculty_productivity': 'stable',
                'research_output': 'increasing'
            },
            'recommendations': [
                'Focus on improving first-year student engagement',
                'Increase industry collaboration for better placements',
                'Enhance research infrastructure for higher output'
            ],
            'risk_areas': [
                'Declining enrollment in certain programs',
                'Need for faculty development in emerging technologies',
                'Infrastructure upgrade required for smart classrooms'
            ],
            'strengths': [
                'Strong faculty qualifications',
                'Good industry connections',
                'Excellent research culture'
            ]
        }
        
        return jsonify({
            'success': True,
            'data': insights
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
