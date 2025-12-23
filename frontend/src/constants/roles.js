export const ROLES = {
  ADMIN: 'admin',
  FACULTY: 'faculty',
  STUDENT: 'student',
  PARENT: 'parent',
  DRIVER: 'driver',
  STAFF: 'staff',
  ACCOUNTS: 'accounts',
  LIBRARIAN: 'librarian'
};

// Role hierarchy for permission checking
export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: [
    ROLES.ADMIN,
    ROLES.FACULTY,
    ROLES.STAFF,
    ROLES.ACCOUNTS,
    ROLES.LIBRARIAN,
    ROLES.STUDENT,
    ROLES.PARENT,
    ROLES.DRIVER
  ],
  [ROLES.FACULTY]: [
    ROLES.FACULTY,
    ROLES.STUDENT,
    ROLES.PARENT
  ],
  [ROLES.STAFF]: [
    ROLES.STAFF,
    ROLES.STUDENT,
    ROLES.PARENT
  ],
  [ROLES.ACCOUNTS]: [
    ROLES.ACCOUNTS,
    ROLES.STUDENT,
    ROLES.PARENT
  ],
  [ROLES.LIBRARIAN]: [
    ROLES.LIBRARIAN,
    ROLES.STUDENT
  ],
  [ROLES.STUDENT]: [ROLES.STUDENT],
  [ROLES.PARENT]: [ROLES.PARENT],
  [ROLES.DRIVER]: [ROLES.DRIVER]
};

// Default permissions for each role
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    canViewDashboard: true,
    canManageUsers: true,
    canManageStudents: true,
    canManageFaculty: true,
    canManageStaff: true,
    canManageAttendance: true,
    canManageExams: true,
    canManageResults: true,
    canManageFees: true,
    canManageLibrary: true,
    canManageTransport: true,
    canManageSettings: true,
    canViewReports: true,
    canExportData: true,
  },
  [ROLES.FACULTY]: {
    canViewDashboard: true,
    canManageAttendance: true,
    canManageExams: true,
    canManageResults: true,
    canViewStudents: true,
    canViewReports: true,
  },
  [ROLES.STAFF]: {
    canViewDashboard: true,
    canManageStudents: true,
    canViewAttendance: true,
    canViewResults: true,
  },
  [ROLES.ACCOUNTS]: {
    canViewDashboard: true,
    canManageFees: true,
    canViewFeeReports: true,
  },
  [ROLES.LIBRARIAN]: {
    canViewDashboard: true,
    canManageLibrary: true,
  },
  [ROLES.STUDENT]: {
    canViewDashboard: true,
    canViewAttendance: true,
    canViewResults: true,
    canViewFees: true,
  },
  [ROLES.PARENT]: {
    canViewDashboard: true,
    canViewChildAttendance: true,
    canViewChildResults: true,
    canViewFeePayments: true,
  },
  [ROLES.DRIVER]: {
    canViewDashboard: true,
    canViewTransportRoutes: true,
    canUpdateTransportStatus: true,
  },
};

// Function to check if a user has a specific permission
export const hasPermission = (user, permission) => {
  if (!user || !user.role) return false;
  return ROLE_PERMISSIONS[user.role]?.[permission] || false;
};

// Function to check if a user has any of the specified permissions
export const hasAnyPermission = (user, permissions) => {
  if (!user || !user.role) return false;
  return permissions.some(permission => 
    ROLE_PERMISSIONS[user.role]?.[permission]
  );
};

// Function to check if a user has all of the specified permissions
export const hasAllPermissions = (user, permissions) => {
  if (!user || !user.role) return false;
  return permissions.every(permission => 
    ROLE_PERMISSIONS[user.role]?.[permission]
  );
};
