# HR Onboarding Module Implementation

## Completed
- Backend controllers and endpoints are fully implemented
- Basic HR routing structure exists

## In Progress
- Create main HR Onboarding page component
- Implement all 7 submodules with proper UI

## Submodules to Implement

### 1. Dashboard (/)
- Stats Cards: Total Employees, Active Onboarding, Pending Documents, Fully Onboarded
- Recent Onboarding List: Shows employees in progress with status
- Quick Actions: New Employee, Verify Documents, Configure Policy, View Reports

### 2. Employee Registration (/registration)
- Full name, email, phone number
- Employee type (Faculty/Staff)
- Department selection (9 departments)
- Designation input
- Date of joining
- Auto-generated Employee ID (EMP2024XXXX)

### 3. Document Upload & Verification (/documents)
- Upload Aadhaar Card (Required)
- Upload PAN Card (Required)
- Upload Academic Certificates (Required)
- Upload Appointment Order (Optional)
- Document status: Pending → Approved/Rejected
- Verify/Reject actions for each document

### 4. Role & Academic Assignment (/roles)
- For Faculty: Subject selection (12 subjects available), Semester allocation (1-8), Class type (Theory/Lab/Both)
- For Staff: Administrative duties assignment
- Admin Duties (Both): Examination Coordinator, Placement Coordinator, Library In-charge, Lab In-charge, Department Secretary, Time Table Coordinator, Student Counselor, Research Coordinator

### 5. Work Policy & Leave Configuration (/work-policy)
- Working hours configuration
- Shift selection (Morning/Afternoon/Flexible)
- Weekly off days selection
- Probation period (3/6/12 months)
- Leave policy: Casual Leave (CL), Sick Leave (SL), Earned Leave (EL)

### 6. Salary & Payroll Setup (/salary)
- Earnings: Basic Salary, House Rent Allowance (HRA), Dearness Allowance (DA), Travel Allowance (TA), Other Allowances
- Deductions: Provident Fund (PF), Income Tax (Auto-calculated), Other Deductions
- Bank Details: Bank Name, Account Number, IFSC Code
- Auto-Calculations: Gross Salary, Net Salary (Take Home), Annual CTC

### 7. System Access & Activation (/activation)
- Generate username (from email)
- Generate temporary password
- ERP role assignment: View Own Profile, Mark Attendance, Apply Leave, View Salary Slips, Manage Students (Faculty), Enter Marks (Faculty), View Reports, Admin Panel Access
- Send welcome email option

## UI Requirements
- Card-based layouts with subtle shadows
- Status badges (Pending/Approved/Rejected/Active)
- Step progress indicators
- Gradient buttons and icons
- Smooth animations (fade-in, slide-up)

## Technical Requirements
- Proper API integration with existing backend
- Form validation and error handling
- Responsive design
- State management for onboarding flow
