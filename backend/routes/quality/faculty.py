from flask import Blueprint, jsonify, request
from functools import wraps
from supabase_client import get_supabase

# Create blueprint
quality_faculty_bp = Blueprint('quality_faculty', __name__)

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

@quality_faculty_bp.route('/faculty', methods=['GET', 'OPTIONS'])
@cors_enabled
def get_faculty():
    """Get faculty list with pagination from Supabase"""
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        search = request.args.get('search', '')
        department = request.args.get('department', '')

        supabase = get_supabase()

        # Build query
        query = supabase.table('quality_facultyperformance').select('*', count='exact')

        # Apply filters
        if search:
            # Search in faculty_name (case insensitive)
            query = query.ilike('faculty_name', f'%{search}%')
        if department:
            query = query.eq('department', department)

        # Get total count first
        count_result = query.execute()
        total_items = count_result.count

        # Apply pagination
        offset = (page - 1) * limit
        query = query.range(offset, offset + limit - 1)

        # Execute query
        result = query.execute()

        # Transform data to match frontend expectations
        faculty = []
        for record in result.data:
            faculty.append({
                'id': record['faculty_id'],
                'employee_id': f'EMP{record["faculty_id"]:03d}',
                'name': record['faculty_name'],
                'email': f'{record["faculty_name"].lower().replace(" ", ".")}@college.edu',
                'department': record['department'],
                'designation': 'Professor',  # Default designation
                'performance_rating': record['performance_rating'],
                'research_output': record['research_papers'],
                'student_feedback_score': record['feedback_score'],
                'teaching_hours': 20,  # Default value
                'publications': record['research_papers'],  # Use research_papers as publications
                'projects': 5,  # Default value
                'experience': 10,  # Default value
                'qualifications': 'Ph.D.',  # Default qualification
                'status': 'active'
            })

        total_pages = (total_items + limit - 1) // limit

        return jsonify({
            'success': True,
            'data': faculty,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total_items,
                'totalPages': total_pages
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@quality_faculty_bp.route('/faculty/analytics', methods=['GET', 'OPTIONS'])
@cors_enabled
def get_faculty_analytics():
    """Get faculty analytics"""
    try:
        analytics = {
            'total_faculty': 85,
            'active_faculty': 78,
            'faculty_by_department': {
                'Computer Science': 25,
                'Electronics': 20,
                'Mechanical': 18,
                'Civil': 12,
                'Electrical': 10
            },
            'faculty_by_designation': {
                'Professor': 15,
                'Associate Professor': 30,
                'Assistant Professor': 35,
                'Lecturer': 5
            },
            'performance_distribution': {
                'excellent': 20,
                'good': 45,
                'average': 15,
                'needs_improvement': 5
            },
            'average_experience': 12.5,
            'faculty_with_phd': 65,
            'faculty_retention_rate': 92.5,
            'performance_trends': [
                {'month': 'Jan', 'score': 85},
                {'month': 'Feb', 'score': 87},
                {'month': 'Mar', 'score': 88},
                {'month': 'Apr', 'score': 86},
                {'month': 'May', 'score': 90},
                {'month': 'Jun', 'score': 92}
            ],
            'research_output': [
                {'month': 'Jan', 'count': 8},
                {'month': 'Feb', 'count': 12},
                {'month': 'Mar', 'count': 15},
                {'month': 'Apr', 'count': 10},
                {'month': 'May', 'count': 18},
                {'month': 'Jun', 'count': 14}
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

@quality_faculty_bp.route('/faculty', methods=['POST', 'OPTIONS'])
@cors_enabled
def create_faculty():
    """Create a new faculty member and save to Supabase"""
    try:
        data = request.get_json()
        supabase = get_supabase()

        # Map frontend fields to DB columns
        insert_data = {
            'faculty_name': data.get('name'),
            'department': data.get('department'),
            'performance_rating': int(data.get('performance_rating', 0)),
            'research_papers': int(data.get('research_output', data.get('publications', 0))),
            'feedback_score': int(data.get('student_feedback_score', 0))
        }

        result = supabase.table('quality_facultyperformance').insert(insert_data).execute()

        if hasattr(result, 'error') and result.error:
            # Supabase client may return error object
            err_msg = getattr(result.error, 'message', str(result.error))
            return jsonify({'success': False, 'error': err_msg}), 400

        created = result.data[0] if result.data else insert_data

        return jsonify({
            'success': True,
            'data': created,
            'message': 'Faculty member created successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@quality_faculty_bp.route('/faculty/<int:faculty_id>', methods=['PUT', 'OPTIONS'])
@cors_enabled
def update_faculty(faculty_id):
    """Update a faculty member in Supabase"""
    try:
        data = request.get_json()
        supabase = get_supabase()

        update_data = {}
        if 'name' in data:
            update_data['faculty_name'] = data.get('name')
        if 'department' in data:
            update_data['department'] = data.get('department')
        if 'performance_rating' in data:
            update_data['performance_rating'] = int(data.get('performance_rating', 0))
        if 'research_output' in data or 'publications' in data:
            update_data['research_papers'] = int(data.get('research_output', data.get('publications', 0)))
        if 'student_feedback_score' in data:
            update_data['feedback_score'] = int(data.get('student_feedback_score', 0))

        if not update_data:
            return jsonify({'success': False, 'error': 'No valid fields to update'}), 400

        result = supabase.table('quality_facultyperformance').update(update_data).eq('faculty_id', faculty_id).execute()

        if hasattr(result, 'error') and result.error:
            err_msg = getattr(result.error, 'message', str(result.error))
            return jsonify({'success': False, 'error': err_msg}), 400

        updated = result.data[0] if result.data else {'id': faculty_id, **update_data}

        return jsonify({
            'success': True,
            'data': updated,
            'message': 'Faculty member updated successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@quality_faculty_bp.route('/faculty/<int:faculty_id>', methods=['DELETE', 'OPTIONS'])
@cors_enabled
def delete_faculty(faculty_id):
    """Delete a faculty member from Supabase"""
    try:
        supabase = get_supabase()

        result = supabase.table('quality_facultyperformance').delete().eq('faculty_id', faculty_id).execute()

        if hasattr(result, 'error') and result.error:
            err_msg = getattr(result.error, 'message', str(result.error))
            return jsonify({'success': False, 'error': err_msg}), 400

        return jsonify({
            'success': True,
            'message': 'Faculty member deleted successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
