import jwt
import requests
from functools import wraps
from flask import request, g, jsonify, current_app
from werkzeug.exceptions import Unauthorized
from jwt.algorithms import RSAAlgorithm
import json
from datetime import datetime, timedelta

# Supabase configuration
SUPABASE_URL = 'https://qkaaoeismqnhjyikgkme.supabase.co'
SUPABASE_JWKS_URL = f'{SUPABASE_URL}/auth/v1/jwks'
SUPABASE_AUDIENCE = 'authenticated'
SUPABASE_ISSUER = f'{SUPABASE_URL}/auth/v1'

def get_supabase_public_key():
    """Fetch the public key from Supabase JWKS endpoint"""
    try:
        response = requests.get(SUPABASE_JWKS_URL, timeout=5)
        response.raise_for_status()
        jwks = response.json()
        if not jwks or 'keys' not in jwks or not jwks['keys']:
            current_app.logger.error('No keys found in JWKS response')
            return None
            
        # Use the first key (should be RS256)
        public_key = jwks['keys'][0]
        return RSAAlgorithm.from_jwk(json.dumps(public_key))
    except Exception as e:
        current_app.logger.error(f'Error fetching Supabase public key: {str(e)}')
        return None

def verify_supabase_token(token):
    """
    Verify a Supabase JWT token and return the payload if valid.
    Returns (payload, error) tuple where error is None if verification succeeds.
    """
    if not token:
        return None, 'No token provided'

    try:
        # First, get the public key from Supabase
        public_key = get_supabase_public_key()
        if not public_key:
            return None, 'Failed to fetch Supabase public key'

        # Decode and verify the token
        payload = jwt.decode(
            token,
            public_key,
            algorithms=['RS256'],
            audience=SUPABASE_AUDIENCE,
            issuer=SUPABASE_ISSUER,
            options={
                'verify_exp': True,
                'verify_aud': True,
                'verify_iss': True,
                'verify_signature': True
            }
        )

        # Ensure required claims are present
        required_claims = ['sub', 'email', 'role']
        for claim in required_claims:
            if claim not in payload:
                return None, f'Missing required claim: {claim}'

        # Extract user metadata from Supabase token
        user_metadata = payload.get('user_metadata', {})
        app_metadata = payload.get('app_metadata', {})
        
        # Create a standardized user object
        user = {
            'id': payload['sub'],
            'email': payload['email'],
            'role': user_metadata.get('role', app_metadata.get('role', 'student')),
            'email_verified': payload.get('email_verified', False),
            'user_metadata': user_metadata,
            'app_metadata': app_metadata
        }

        return user, None

    except jwt.ExpiredSignatureError:
        return None, 'Token has expired. Please log in again.'
    except jwt.InvalidTokenError as e:
        current_app.logger.error(f'Invalid token: {str(e)}')
        return None, f'Invalid token: {str(e)}'
    except Exception as e:
        current_app.logger.error(f'Error verifying token: {str(e)}')
        return None, 'Failed to verify token'

def should_bypass_auth():
    """
    Check if the current request should bypass authentication.
    Returns True if the request should bypass authentication, False otherwise.
    """
    # List of paths that don't require authentication
    public_paths = [
        '/health',
        '/api/test',
        '/api/student_dashboard/test',
        '/api/student_dashboard/test/'
    ]
    
    # Check if the current path is in the public paths list
    return request.path in public_paths

def auth_required(roles=None):
    """
    Decorator to require authentication and optionally specific roles for a route.
    Verifies the Supabase JWT token and sets the current user in the application context.
    
    Args:
        roles (str|list, optional): Required role(s) to access the route.
                                   If None, any authenticated user can access.
                                   If a string, the user must have that exact role.
                                   If a list, the user must have at least one of the roles.
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Check if this route should bypass authentication
            if should_bypass_auth():
                # Set a mock user for testing (optional)
                g.user = {
                    'id': 'test_user',
                    'email': 'test@example.com',
                    'role': 'test'
                }
                return f(*args, **kwargs)
                
            # Check for token in Authorization header
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({
                    'success': False,
                    'error': 'Authorization header is missing',
                    'message': 'No token provided',
                    'method': request.method,
                    'path': request.path
                }), 401

            # Extract token
            token = auth_header.split(' ')[1] if len(auth_header.split(' ')) > 1 else None
            if not token:
                return jsonify({
                    'success': False,
                    'error': 'Invalid token format',
                    'details': 'Token must be in format: Bearer <token>'
                }), 401

            # Verify token and get user
            user, error = verify_supabase_token(token)
            if error or not user:
                return jsonify({
                    'success': False,
                    'error': 'Authentication failed',
                    'details': error or 'Invalid token'
                }), 401

            # Check if user has required role(s)
            if roles:
                required_roles = [roles] if isinstance(roles, str) else list(roles)
                required_roles = [r.lower() for r in required_roles]
                user_role = user.get('role', '').lower()
                
                if user_role not in required_roles:
                    return jsonify({
                        'success': False,
                        'error': 'Insufficient permissions',
                        'details': f'Requires one of these roles: {", ".join(required_roles)}',
                        'user_role': user_role
                    }), 403

            # Store user in application context
            # Check if email is verified if required
            if current_app.config.get('REQUIRE_VERIFIED_EMAIL', True) and not user.get('email_verified'):
                return jsonify({
                    'success': False,
                    'message': 'Email not verified',
                    'error': 'auth/email-not-verified'
                }), 403
            
            # Set the current user in the application context
            g.user = user
            current_app.logger.info(f'Authenticated user: {user["email"]} (role: {user["role"]})')
            
            return f(*args, **kwargs)
        
        # Ensure the wrapper function has a unique name to avoid endpoint conflicts
        wrapper.__name__ = f"{f.__name__}_wrapped"
        return wrapper
    
    return decorator

def get_current_user():
    """
    Get the current authenticated user from the application context.
    
    Returns:
        dict: The current user or None if not authenticated
    """
    return getattr(g, 'user', None)

def get_current_user_id():
    """
    Get the ID of the current authenticated user.
    
    Returns:
        str: The user ID or None if not authenticated
    """
    user = get_current_user()
    return user.get('id') if user else None

def get_current_user_role():
    """
    Get the role of the current authenticated user.
    
    Returns:
        str: The user role or 'guest' if not authenticated
    """
    user = get_current_user()
    return user.get('role', 'guest') if user else 'guest'


def try_authenticate():
    """
    Try to authenticate from the Authorization header but do not enforce it.
    Returns:
        - dict: the user object set on success (also sets g.user)
        - None: if no Authorization header was present
        - flask response: a Response object (e.g. jsonify(...), status) to be returned by the caller on error
    """
    from flask import request, current_app, jsonify

    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None

    parts = auth_header.split()
    if parts[0].lower() != 'bearer' or len(parts) != 2:
        return (jsonify({'error': 'Invalid Authorization header format. Use: Bearer <token>'}), 401)

    token = parts[1]
    try:
        payload = jwt.decode(
            token,
            current_app.config.get('JWT_SECRET_KEY'),
            algorithms=['HS256'],
            options={
                'verify_exp': True,
                'verify_aud': False,
                'verify_iss': False
            }
        )

        # Set the current user in the application context
        g.user = {
            'id': payload.get('sub'),
            'email': payload.get('email'),
            'role': payload.get('role', 'student'),
            'permissions': payload.get('permissions', {})
        }

        return g.user

    except jwt.ExpiredSignatureError:
        return (jsonify({'error': 'Token has expired'}), 401)
    except jwt.InvalidTokenError as e:
        return (jsonify({'error': f'Invalid token: {str(e)}'}), 401)
    except Exception as e:
        current_app.logger.error(f'Error verifying token: {str(e)}')
        return (jsonify({'error': 'Error verifying token'}), 500)
