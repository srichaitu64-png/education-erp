import sys

path = 'apps/web/src/store/demoStore.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update DemoState interface with new methods and state
old_demo_state_tail = """  resetDemoData: () => void;
}"""

new_demo_state_tail = """  // Consolidated Student Fee Statement & Acceptance Test State
  acceptanceTestState: AcceptanceTestState;
  runAcceptanceTestPayment1: () => DemoFeeReceipt;
  runAcceptanceTestPayment2: () => DemoFeeReceipt;
  resetAcceptanceTest: () => void;
  getStudentConsolidatedStatement: (studentId: string) => StudentConsolidatedFeeStatement;

  // Progress Cards & Academic Analytics
  individualProgressCards: IndividualProgressCard[];
  consolidatedProgressCards: ConsolidatedAcademicProgressCard[];
  competitiveReports: CompetitiveFoundationReport[];

  // Data Migration Centre
  migrationBatches: MigrationBatch[];
  resolveMigrationCandidate: (batchId: string, candidateId: string, resolution: 'SKIP' | 'MERGE' | 'OVERWRITE') => void;
  executeMigrationBatch: (batchId: string) => { success: boolean; message: string; importedCount: number };

  resetDemoData: () => void;
}"""

content = content.replace(old_demo_state_tail, new_demo_state_tail)

# 2. Update initialNavConfigs with CHAIRMAN_DIRECTOR and all roles
old_nav_super = """const initialNavConfigs: Record<UserRoleType, DashboardDesignerNavItem[]> = {
  SUPER_ADMIN: ["""

new_nav_super = """const initialNavConfigs: Record<UserRoleType, DashboardDesignerNavItem[]> = {
  SUPER_ADMIN: [
    { id: 'dashboard', label: 'Platform Overview', iconName: 'Shield', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'export'] },
    { id: 'permissions-centre', label: 'Central Permission Matrix', iconName: 'Key', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'edit', 'assign', 'manage_permissions'] },
    { id: 'dashboard-designer', label: 'Dashboard & Access Designer', iconName: 'Layout', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'edit', 'configure'] },
    { id: 'examinations', label: 'Examinations Lifecycle', iconName: 'Award', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'approve', 'publish'] },
    { id: 'fees', label: 'Multi-Category Fee Engine', iconName: 'CreditCard', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'reconcile'] },
    { id: 'transport', label: 'Transport & Fleet GPS', iconName: 'Bus', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'configure'] },
  ],
  CHAIRMAN_DIRECTOR: [
    { id: 'dashboard', label: 'Chairman Overview', iconName: 'Building2', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'export'] },
    { id: 'institution-control-centre', label: 'Institution Control Centre', iconName: 'Shield', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'manage_users', 'configure'] },
    { id: 'permissions-centre', label: 'Central Permission Matrix', iconName: 'Key', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'edit', 'assign', 'manage_permissions'] },
    { id: 'dashboard-designer', label: 'Dashboard & Access Designer', iconName: 'Layout', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'edit', 'configure'] },
    { id: 'examinations', label: 'Examinations Lifecycle', iconName: 'Award', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'approve', 'publish'] },
    { id: 'fees', label: 'Fee Management & Collections', iconName: 'CreditCard', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'collect', 'reconcile', 'refund'] },
    { id: 'progress-cards', label: 'Student Progress Cards', iconName: 'FileCheck', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'export', 'print'] },
    { id: 'data-migration', label: 'Data Migration Centre', iconName: 'Upload', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'create', 'configure'] },
    { id: 'attendance', label: 'Campus Attendance', iconName: 'CalendarCheck', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'transport', label: 'Transport Fleet & GPS', iconName: 'Bus', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'students', label: 'Students (SIS)', iconName: 'Users', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'create', 'edit'] },
    { id: 'staff', label: 'Faculty & HR', iconName: 'Users', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'create', 'edit'] },
    { id: 'timetable', label: 'Weekly Timetable', iconName: 'Clock', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
  ],
  DIRECTOR: [
    { id: 'dashboard', label: 'Director Overview', iconName: 'Building2', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'export'] },
    { id: 'institution-control-centre', label: 'Institution Control Centre', iconName: 'Shield', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'manage_users'] },
    { id: 'examinations', label: 'Examinations Lifecycle', iconName: 'Award', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'approve'] },
    { id: 'fees', label: 'Fee Management', iconName: 'CreditCard', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
  ],
  MANAGING_DIRECTOR: [
    { id: 'dashboard', label: 'MD Overview', iconName: 'Building2', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'institution-control-centre', label: 'Institution Control Centre', iconName: 'Shield', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'fees', label: 'Fee Management', iconName: 'CreditCard', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
  ],
  TRUSTEE: [
    { id: 'dashboard', label: 'Trustee Overview', iconName: 'Building2', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'fees', label: 'Trust Financial Reports', iconName: 'CreditCard', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
  ],"""

old_nav_block_start = """const initialNavConfigs: Record<UserRoleType, DashboardDesignerNavItem[]> = {
  SUPER_ADMIN: [
    { id: 'dashboard', label: 'Platform Overview', iconName: 'Shield', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'export'] },
    { id: 'permissions-centre', label: 'Central Permission Matrix', iconName: 'Key', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'edit', 'assign', 'manage_permissions'] },
    { id: 'dashboard-designer', label: 'Dashboard & Access Designer', iconName: 'Layout', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'edit', 'configure'] },
    { id: 'examinations', label: 'Examinations Lifecycle', iconName: 'Award', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'approve', 'publish'] },
    { id: 'fees', label: 'Multi-Category Fee Engine', iconName: 'CreditCard', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'reconcile'] },
    { id: 'transport', label: 'Transport & Fleet GPS', iconName: 'Bus', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'configure'] },
  ],"""

content = content.replace(old_nav_block_start, new_nav_super)

# Update the end of initialNavConfigs
old_nav_end = """  TRANSPORT_MANAGER: [
    { id: 'dashboard', label: 'Fleet Overview', iconName: 'GraduationCap', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'transport', label: 'Transport Routes & GPS', iconName: 'Bus', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'create', 'edit', 'assign'] },
  ],
};"""

new_nav_end = """  TRANSPORT_MANAGER: [
    { id: 'dashboard', label: 'Fleet Overview', iconName: 'GraduationCap', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'transport', label: 'Transport Routes & GPS', iconName: 'Bus', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'create', 'edit', 'assign'] },
  ],
  ADMISSION_OFFICER: [
    { id: 'dashboard', label: 'Admissions Overview', iconName: 'GraduationCap', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'admissions', label: 'Admissions Pipeline', iconName: 'GraduationCap', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'create', 'approve'] },
    { id: 'students', label: 'Registered Students', iconName: 'Users', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
  ],
  HR_MANAGER: [
    { id: 'dashboard', label: 'HR Overview', iconName: 'GraduationCap', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'staff', label: 'Staff Directory & Leaves', iconName: 'Users', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'create', 'edit', 'approve'] },
  ],
  LECTURER: [
    { id: 'dashboard', label: 'Faculty Overview', iconName: 'GraduationCap', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'examinations', label: 'Marks Entry & Lab Practicals', iconName: 'Award', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'edit', 'submit'] },
    { id: 'attendance', label: 'Class Attendance', iconName: 'CalendarCheck', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'edit'] },
    { id: 'timetable', label: 'Lecture Timetable', iconName: 'Clock', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
  ],
  LIBRARIAN: [
    { id: 'dashboard', label: 'Library Overview', iconName: 'BookOpen', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'students', label: 'Student Book Circulation', iconName: 'Users', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
  ],
  HOSTEL_WARDEN: [
    { id: 'dashboard', label: 'Hostel Overview', iconName: 'Building2', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'students', label: 'Boarder Directory', iconName: 'Users', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'attendance', label: 'Night Roll-Call', iconName: 'CalendarCheck', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'edit'] },
  ],
  DRIVER: [
    { id: 'dashboard', label: 'Trip Console', iconName: 'Bus', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'transport', label: 'Live Bus Route 104', iconName: 'Bus', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'edit'] },
  ],
};"""

content = content.replace(old_nav_end, new_nav_end)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Step 5 nav configs done.")
