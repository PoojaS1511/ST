from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, date
import uuid
import json
import os
import hashlib
from werkzeug.utils import secure_filename
from models.hr_onboarding import (
    EmployeeRegistration, DocumentUpload, RoleAssignment, WorkPolicy, SalarySetup, SystemAccess,
    OnboardingRecord, DashboardStats,
    OnboardingStatus, DocumentStatus
)
from models.supabase_hr_onboarding import SupabaseHROnboarding
from utils.validators import validate_email, validate_phone
from utils.file_handler import FileHandler

# Create Blueprint
hr_onboarding_bp = Blueprint('hr_onboarding', __name__, url_prefix='/api/hr-onboarding')

# Initialize Supabase HR Onboarding
hr_onboarding = SupabaseHROnboarding()
file_handler = FileHandler()

def generate_employee_id():
    """Generate unique employee ID"""
    year = datetime.now().year
    random_num = str(uuid.uuid4().int)[:4]
    return f"EMP{year}{random_num}"

def log_activity(employee_id: str, action: str, description: str, status: str, created_by: str = None):
    """Log onboarding activity"""
    try:
        hr_onboarding.log_activity(employee_id, action, description, status, created_by)
    except Exception as e:
        current_app.logger.error(f"Error logging activity: {str(e)}")

# ==================== DASHBOARD ENDPOINTS ====================

@hr_onboarding_bp.route('/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        result = hr_onboarding.get_dashboard_stats()
        
        if result['success']:
            return jsonify({
                'success': True,
                'data': result['data']
            })
        else:
            return jsonify({
                'success': False,
                'message': result['message']
            }), 500
        
    except Exception as e:
        current_app.logger.error(f"Error getting dashboard stats: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to fetch dashboard statistics'
        }), 500

# ==================== REGISTRATION ENDPOINTS ====================

@hr_onboarding_bp.route('/registration', methods=['POST'])
def create_registration():
    """Create employee registration"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'phone', 'type', 'department', 'designation', 'joiningDate', 'role']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'{field} is required'
                }), 400
        
        # Validate email and phone
        if not validate_email(data['email']):
            return jsonify({
                'success': False,
                'message': 'Invalid email format'
            }), 400
        
        if not validate_phone(data['phone']):
            return jsonify({
                'success': False,
                'message': 'Invalid phone number format'
            }), 400
        
        # Generate employee ID
        employee_id = generate_employee_id()
        
        # Create registration data
        registration_data = {
            'employeeId': employee_id,
            'name': data['name'],
            'email': data['email'],
            'phone': data['phone'],
            'type': data['type'],
            'department': data['department'],
            'designation': data['designation'],
            'joiningDate': data['joiningDate'],
            'role': data['role']
        }
        
        # Save registration
        result = hr_onboarding.create_employee_registration(registration_data)
        
        if not result['success']:
            return jsonify({
                'success': False,
                'message': result['message']
            }), 500
        
        # Create onboarding record
        onboarding_data = {
            'employeeId': employee_id,
            'status': 'in_progress',
            'currentStep': 1,
            'completedSteps': [0, 1]
        }
        onboarding_result = hr_onboarding.create_onboarding_record(onboarding_data)
        
        # Log activity
        log_activity(employee_id, 'Completed Registration', 'Employee registration completed successfully', 'completed')
        
        return jsonify({
            'success': True,
            'message': 'Registration created successfully',
            'data': {
                'employeeId': employee_id,
                'registrationId': result['data']['id'],
                'onboardingId': onboarding_result.get('data', {}).get('id') if onboarding_result['success'] else None
            }
        })
        
    except Exception as e:
        current_app.logger.error(f"Error creating registration: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to create registration'
        }), 500

@hr_onboarding_bp.route('/registration/<employee_id>', methods=['GET'])
def get_registration(employee_id):
    """Get employee registration by ID"""
    try:
        result = hr_onboarding.get_employee_registration(employee_id)
        
        if result['success']:
            return jsonify({
                'success': True,
                'data': result['data']
            })
        else:
            return jsonify({
                'success': False,
                'message': result['message']
            }), 404
        
    except Exception as e:
        current_app.logger.error(f"Error getting registration: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to fetch registration'
        }), 500

# ==================== DOCUMENT ENDPOINTS ====================

@hr_onboarding_bp.route('/documents/upload', methods=['POST'])
def upload_document():
    """Upload document for employee"""
    try:
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'message': 'No file provided'
            }), 400
        
        file = request.files['file']
        employee_id = request.form.get('employeeId')
        document_type = request.form.get('documentType')
        
        if not employee_id or not document_type:
            return jsonify({
                'success': False,
                'message': 'Employee ID and document type are required'
            }), 400
        
        if file.filename == '':
            return jsonify({
                'success': False,
                'message': 'No file selected'
            }), 400
        
        # Validate file
        if not file_handler.allowed_file(file.filename):
            return jsonify({
                'success': False,
                'message': 'File type not allowed'
            }), 400
        
        # Save file
        filename = secure_filename(file.filename)
        unique_filename = f"{employee_id}_{document_type}_{filename}"
        file_path = file_handler.save_file(file, unique_filename)
        
        # Get file info
        file_size = os.path.getsize(file_path) / (1024 * 1024)  # Convert to MB
        file_type = filename.split('.')[-1].upper()
        
        # Create document record
        document_data = {
            'employeeId': employee_id,
            'documentType': document_type,
            'fileName': filename,
            'fileSize': round(file_size, 2),
            'fileType': file_type,
            'filePath': file_path
        }
        
        document_id = document_model.create(document_data)
        
        # Log activity
        log_activity(employee_id, 'Document Uploaded', f'{document_type} document uploaded', 'pending')
        
        return jsonify({
            'success': True,
            'message': 'Document uploaded successfully',
            'data': {
                'documentId': document_id,
                'fileName': filename,
                'fileSize': round(file_size, 2),
                'fileType': file_type,
                'status': 'pending'
            }
        })
        
    except Exception as e:
        current_app.logger.error(f"Error uploading document: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to upload document'
        }), 500

@hr_onboarding_bp.route('/documents/<document_id>/verify', methods=['POST'])
def verify_document(document_id):
    """Verify document"""
    try:
        data = request.get_json()
        verified_by = data.get('verifiedBy', 'admin')
        status = data.get('status', 'verified')
        
        if status not in ['verified', 'rejected']:
            return jsonify({
                'success': False,
                'message': 'Invalid status'
            }), 400
        
        # Update document status
        query = """
        UPDATE document_uploads 
        SET status = %s, verified_at = CURRENT_TIMESTAMP, verified_by = %s
        WHERE id = %s
        """
        db.execute_query(query, (status, verified_by, document_id))
        
        # Get document info for logging
        doc_query = """
        SELECT employee_id, document_type FROM document_uploads WHERE id = %s
        """
        doc_result = db.execute_query(doc_query, (document_id,), fetch_one=True)
        
        if doc_result:
            log_activity(doc_result['employee_id'], 'Document Verified', 
                        f'{doc_result["document_type"]} document {status}', status)
        
        return jsonify({
            'success': True,
            'message': f'Document {status} successfully'
        })
        
    except Exception as e:
        current_app.logger.error(f"Error verifying document: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to verify document'
        }), 500

@hr_onboarding_bp.route('/documents/<employee_id>', methods=['GET'])
def get_employee_documents(employee_id):
    """Get all documents for an employee"""
    try:
        query = """
        SELECT id, document_type, file_name, file_size, file_type, status, uploaded_at, verified_at
        FROM document_uploads
        WHERE employee_id = %s
        ORDER BY uploaded_at DESC
        """
        results = db.execute_query(query, (employee_id,))
        
        documents = []
        for result in results or []:
            documents.append({
                'id': result['id'],
                'documentType': result['document_type'],
                'fileName': result['file_name'],
                'fileSize': result['file_size'],
                'fileType': result['file_type'],
                'status': result['status'],
                'uploadedAt': result['uploaded_at'].isoformat() if result['uploaded_at'] else None,
                'verifiedAt': result['verified_at'].isoformat() if result['verified_at'] else None
            })
        
        return jsonify({
            'success': True,
            'data': documents
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting documents: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to fetch documents'
        }), 500

# ==================== ROLE ASSIGNMENT ENDPOINTS ====================

@hr_onboarding_bp.route('/role-assignment', methods=['POST'])
def create_role_assignment():
    """Create role assignment"""
    try:
        data = request.get_json()
        
        required_fields = ['employeeId', 'academicRole', 'reportingManager', 'departmentMapping', 'permissions']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'{field} is required'
                }), 400
        
        # Create role assignment record
        role_id = str(uuid.uuid4())
        query = """
        INSERT INTO role_assignments 
        (id, employee_id, academic_role, reporting_manager, department_mapping, permissions, assigned_by)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        
        db.execute_query(query, (
            role_id,
            data['employeeId'],
            data['academicRole'],
            data['reportingManager'],
            data['departmentMapping'],
            json.dumps(data['permissions']),
            data.get('assignedBy', 'admin')
        ))
        
        # Update onboarding record
        onboarding_model.update_status(data['employeeId'], 'in_progress', 3)
        
        # Log activity
        log_activity(data['employeeId'], 'Role Assignment Completed', 
                    'Academic role and permissions assigned', 'completed')
        
        return jsonify({
            'success': True,
            'message': 'Role assignment created successfully',
            'data': {'roleAssignmentId': role_id}
        })
        
    except Exception as e:
        current_app.logger.error(f"Error creating role assignment: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to create role assignment'
        }), 500

@hr_onboarding_bp.route('/role-assignment/<employee_id>', methods=['GET'])
def get_role_assignment(employee_id):
    """Get role assignment for employee"""
    try:
        query = """
        SELECT academic_role, reporting_manager, department_mapping, permissions, assigned_at
        FROM role_assignments
        WHERE employee_id = %s
        """
        result = db.execute_query(query, (employee_id,), fetch_one=True)
        
        if not result:
            return jsonify({
                'success': False,
                'message': 'Role assignment not found'
            }), 404
        
        # Parse JSON fields
        result['permissions'] = json.loads(result['permissions']) if result['permissions'] else {}
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting role assignment: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to fetch role assignment'
        }), 500

# ==================== WORK POLICY ENDPOINTS ====================

@hr_onboarding_bp.route('/work-policy', methods=['POST'])
def create_work_policy():
    """Create work policy"""
    try:
        data = request.get_json()
        
        required_fields = ['employeeId', 'workingHours', 'shift', 'weeklyOffDays', 'probationPeriod', 'leavePolicy', 'effectiveFrom']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'{field} is required'
                }), 400
        
        # Create work policy record
        policy_id = str(uuid.uuid4())
        query = """
        INSERT INTO work_policies 
        (id, employee_id, working_hours, shift, weekly_off_days, probation_period, leave_policy, effective_from)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        db.execute_query(query, (
            policy_id,
            data['employeeId'],
            json.dumps(data['workingHours']),
            data['shift'],
            json.dumps(data['weeklyOffDays']),
            data['probationPeriod'],
            json.dumps(data['leavePolicy']),
            data['effectiveFrom']
        ))
        
        # Update onboarding record
        onboarding_model.update_status(data['employeeId'], 'in_progress', 4)
        
        # Log activity
        log_activity(data['employeeId'], 'Work Policy Set', 
                    'Working hours and leave policy configured', 'completed')
        
        return jsonify({
            'success': True,
            'message': 'Work policy created successfully',
            'data': {'workPolicyId': policy_id}
        })
        
    except Exception as e:
        current_app.logger.error(f"Error creating work policy: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to create work policy'
        }), 500

@hr_onboarding_bp.route('/work-policy/<employee_id>', methods=['GET'])
def get_work_policy(employee_id):
    """Get work policy for employee"""
    try:
        query = """
        SELECT working_hours, shift, weekly_off_days, probation_period, leave_policy, effective_from
        FROM work_policies
        WHERE employee_id = %s
        """
        result = db.execute_query(query, (employee_id,), fetch_one=True)
        
        if not result:
            return jsonify({
                'success': False,
                'message': 'Work policy not found'
            }), 404
        
        # Parse JSON fields
        result['workingHours'] = json.loads(result['working_hours']) if result['working_hours'] else {}
        result['weeklyOffDays'] = json.loads(result['weekly_off_days']) if result['weekly_off_days'] else []
        result['leavePolicy'] = json.loads(result['leave_policy']) if result['leave_policy'] else {}
        
        # Remove the original JSON fields
        del result['weekly_off_days']
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting work policy: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to fetch work policy'
        }), 500

# ==================== SALARY SETUP ENDPOINTS ====================

@hr_onboarding_bp.route('/salary-setup', methods=['POST'])
def create_salary_setup():
    """Create salary setup"""
    try:
        data = request.get_json()
        
        required_fields = ['employeeId', 'earnings', 'deductions', 'basic_salary', 'hra', 'total_earnings', 'total_deductions', 'net_salary', 'effectiveFrom']
        for field in required_fields:
            if data.get(field) is None:
                return jsonify({
                    'success': False,
                    'message': f'{field} is required'
                }), 400
        
        # Validate net salary calculation
        expected_net = data['total_earnings'] - data['total_deductions']
        if abs(data['net_salary'] - expected_net) > 0.01:
            return jsonify({
                'success': False,
                'message': 'Net salary calculation mismatch'
            }), 400
        
        # Create salary setup record
        salary_id = str(uuid.uuid4())
        query = """
        INSERT INTO salary_setups 
        (id, employee_id, earnings, deductions, basic_salary, hra, total_earnings, total_deductions, net_salary, effective_from)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        db.execute_query(query, (
            salary_id,
            data['employeeId'],
            json.dumps(data['earnings']),
            json.dumps(data['deductions']),
            data['basic_salary'],
            data['hra'],
            data['total_earnings'],
            data['total_deductions'],
            data['net_salary'],
            data['effectiveFrom']
        ))
        
        # Update onboarding record
        onboarding_model.update_status(data['employeeId'], 'in_progress', 5)
        
        # Log activity
        log_activity(data['employeeId'], 'Salary Setup Completed', 
                    'Salary structure configured', 'completed')
        
        return jsonify({
            'success': True,
            'message': 'Salary setup created successfully',
            'data': {'salarySetupId': salary_id}
        })
        
    except Exception as e:
        current_app.logger.error(f"Error creating salary setup: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to create salary setup'
        }), 500

@hr_onboarding_bp.route('/salary-setup/<employee_id>', methods=['GET'])
def get_salary_setup(employee_id):
    """Get salary setup for employee"""
    try:
        query = """
        SELECT earnings, deductions, basic_salary, hra, total_earnings, total_deductions, net_salary, effective_from
        FROM salary_setups
        WHERE employee_id = %s
        """
        result = db.execute_query(query, (employee_id,), fetch_one=True)
        
        if not result:
            return jsonify({
                'success': False,
                'message': 'Salary setup not found'
            }), 404
        
        # Parse JSON fields and format response
        result['earnings'] = json.loads(result['earnings']) if result['earnings'] else {}
        result['deductions'] = json.loads(result['deductions']) if result['deductions'] else {}
        result['basicSalary'] = result['basic_salary']
        result['hra'] = result['hra']
        result['totalEarnings'] = result['total_earnings']
        result['totalDeductions'] = result['total_deductions']
        result['netSalary'] = result['net_salary']
        result['effectiveFrom'] = result['effective_from']
        
        # Remove the original fields
        del result['basic_salary']
        del result['total_earnings']
        del result['total_deductions']
        del result['net_salary']
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting salary setup: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to fetch salary setup'
        }), 500

# ==================== SYSTEM ACCESS ENDPOINTS ====================

@hr_onboarding_bp.route('/system-access', methods=['POST'])
def create_system_access():
    """Create system access"""
    try:
        data = request.get_json()
        
        required_fields = ['employeeId', 'username', 'password', 'modules']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'{field} is required'
                }), 400
        
        # Check if username already exists
        username_check_query = "SELECT COUNT(*) as count FROM system_access WHERE username = %s"
        username_result = db.execute_query(username_check_query, (data['username'],), fetch_one=True)
        if username_result and username_result['count'] > 0:
            return jsonify({
                'success': False,
                'message': 'Username already exists'
            }), 400
        
        # Hash password
        hashed_password = hashlib.sha256(data['password'].encode()).hexdigest()
        
        # Create system access record
        access_id = str(uuid.uuid4())
        query = """
        INSERT INTO system_access 
        (id, employee_id, username, password, temporary_password, modules, send_welcome_email)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        
        db.execute_query(query, (
            access_id,
            data['employeeId'],
            data['username'],
            hashed_password,
            data.get('temporaryPassword', True),
            json.dumps(data['modules']),
            data.get('sendWelcomeEmail', True)
        ))
        
        # Log activity
        log_activity(data['employeeId'], 'System Access Created', 
                    'Login credentials generated', 'pending')
        
        return jsonify({
            'success': True,
            'message': 'System access created successfully',
            'data': {'systemAccessId': access_id}
        })
        
    except Exception as e:
        current_app.logger.error(f"Error creating system access: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to create system access'
        }), 500

@hr_onboarding_bp.route('/system-access/activate', methods=['POST'])
def activate_employee():
    """Activate employee system access"""
    try:
        data = request.get_json()
        
        employee_id = data.get('employeeId')
        activated_by = data.get('activatedBy', 'admin')
        
        if not employee_id:
            return jsonify({
                'success': False,
                'message': 'Employee ID is required'
            }), 400
        
        # Activate system access
        query = """
        UPDATE system_access 
        SET is_active = TRUE, activated_at = CURRENT_TIMESTAMP, activated_by = %s
        WHERE employee_id = %s
        """
        db.execute_query(query, (activated_by, employee_id))
        
        # Update onboarding record to completed/active
        onboarding_model.update_status(employee_id, 'active', 6)
        
        # Update completed steps
        update_steps_query = """
        UPDATE onboarding_records 
        SET completed_steps = %s, completed_at = CURRENT_TIMESTAMP
        WHERE employee_id = %s
        """
        completed_steps = json.dumps([0, 1, 2, 3, 4, 5, 6])
        db.execute_query(update_steps_query, (completed_steps, employee_id))
        
        # Log activity
        log_activity(employee_id, 'Employee Activated', 
                    'Employee system access activated and onboarding completed', 'completed', activated_by)
        
        # Send welcome email if requested
        if data.get('sendWelcomeEmail', True):
            # TODO: Implement email sending logic
            pass
        
        return jsonify({
            'success': True,
            'message': 'Employee activated successfully'
        })
        
    except Exception as e:
        current_app.logger.error(f"Error activating employee: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to activate employee'
        }), 500

@hr_onboarding_bp.route('/system-access/<employee_id>', methods=['GET'])
def get_system_access(employee_id):
    """Get system access for employee"""
    try:
        query = """
        SELECT username, temporary_password, modules, send_welcome_email, is_active, activated_at, activated_by
        FROM system_access
        WHERE employee_id = %s
        """
        result = db.execute_query(query, (employee_id,), fetch_one=True)
        
        if not result:
            return jsonify({
                'success': False,
                'message': 'System access not found'
            }), 404
        
        # Parse JSON fields
        result['modules'] = json.loads(result['modules']) if result['modules'] else {}
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting system access: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to fetch system access'
        }), 500

# ==================== ONBOARDING RECORD ENDPOINTS ====================

@hr_onboarding_bp.route('/record/<employee_id>', methods=['GET'])
def get_onboarding_record(employee_id):
    """Get complete onboarding record for employee"""
    try:
        # Get basic onboarding info
        query = """
        SELECT status, current_step, completed_steps, created_at, updated_at, completed_at
        FROM onboarding_records
        WHERE employee_id = %s
        """
        result = db.execute_query(query, (employee_id,), fetch_one=True)
        
        if not result:
            return jsonify({
                'success': False,
                'message': 'Onboarding record not found'
            }), 404
        
        # Parse completed steps
        result['completedSteps'] = json.loads(result['completed_steps']) if result['completed_steps'] else []
        
        # Get registration data
        reg_query = """
        SELECT employee_id, name, email, phone, type, department, designation, joining_date, role
        FROM employee_registrations
        WHERE employee_id = %s
        """
        registration = db.execute_query(reg_query, (employee_id,), fetch_one=True)
        
        # Get documents
        doc_query = """
        SELECT document_type, file_name, file_size, status, uploaded_at, verified_at
        FROM document_uploads
        WHERE employee_id = %s
        """
        documents = db.execute_query(doc_query, (employee_id,))
        
        # Get role assignment
        role_query = """
        SELECT academic_role, reporting_manager, department_mapping, permissions
        FROM role_assignments
        WHERE employee_id = %s
        """
        role_assignment = db.execute_query(role_query, (employee_id,), fetch_one=True)
        
        # Get work policy
        policy_query = """
        SELECT working_hours, shift, weekly_off_days, probation_period, leave_policy
        FROM work_policies
        WHERE employee_id = %s
        """
        work_policy = db.execute_query(policy_query, (employee_id,), fetch_one=True)
        
        # Get salary setup
        salary_query = """
        SELECT earnings, deductions, basic_salary, hra, total_earnings, total_deductions, net_salary
        FROM salary_setups
        WHERE employee_id = %s
        """
        salary_setup = db.execute_query(salary_query, (employee_id,), fetch_one=True)
        
        # Get system access
        access_query = """
        SELECT username, modules, is_active, activated_at
        FROM system_access
        WHERE employee_id = %s
        """
        system_access = db.execute_query(access_query, (employee_id,), fetch_one=True)
        
        # Parse JSON fields
        if role_assignment:
            role_assignment['permissions'] = json.loads(role_assignment['permissions']) if role_assignment['permissions'] else {}
        
        if work_policy:
            work_policy['workingHours'] = json.loads(work_policy['working_hours']) if work_policy['working_hours'] else {}
            work_policy['weeklyOffDays'] = json.loads(work_policy['weekly_off_days']) if work_policy['weekly_off_days'] else []
            work_policy['leavePolicy'] = json.loads(work_policy['leave_policy']) if work_policy['leave_policy'] else {}
            del work_policy['working_hours']
            del work_policy['weekly_off_days']
        
        if salary_setup:
            salary_setup['earnings'] = json.loads(salary_setup['earnings']) if salary_setup['earnings'] else {}
            salary_setup['deductions'] = json.loads(salary_setup['deductions']) if salary_setup['deductions'] else {}
            salary_setup['basicSalary'] = salary_setup['basic_salary']
            salary_setup['hra'] = salary_setup['hra']
            salary_setup['totalEarnings'] = salary_setup['total_earnings']
            salary_setup['totalDeductions'] = salary_setup['total_deductions']
            salary_setup['netSalary'] = salary_setup['net_salary']
            del salary_setup['basic_salary']
            del salary_setup['total_earnings']
            del salary_setup['total_deductions']
            del salary_setup['net_salary']
        
        if system_access:
            system_access['modules'] = json.loads(system_access['modules']) if system_access['modules'] else {}
        
        return jsonify({
            'success': True,
            'data': {
                'onboarding': result,
                'registration': registration,
                'documents': documents,
                'roleAssignment': role_assignment,
                'workPolicy': work_policy,
                'salarySetup': salary_setup,
                'systemAccess': system_access
            }
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting onboarding record: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to fetch onboarding record'
        }), 500
