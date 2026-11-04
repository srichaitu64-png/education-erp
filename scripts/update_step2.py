import sys

path = 'apps/web/src/store/demoStore.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update ROLE_PRIVILEGES
old_role_privileges = """export const ROLE_PRIVILEGES: Record<UserRoleType, RolePrivilegeInfo> = {
  SUPER_ADMIN: {
    role: 'SUPER_ADMIN',
    title: 'Platform Super Administrator',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    allowedTabs: [
      'dashboard', 'permissions-centre', 'dashboard-designer', 'tenants', 'plans', 'entitlements', 'audit'
    ],
    canEdit: ['All platform privileges', 'Role matrix', 'Dashboard Designer layouts', 'Tenant plans', 'Scopes & Temporary permissions'],
    canApprove: ['Institution tenant provisioning', 'Permission change requests', 'Emergency license overrides'],
    restrictedActions: ['Protected by Lockout Guard: Cannot remove last Platform Super Admin access'],
    scopes: [{ scopeType: 'tenant', scopeValue: 'ALL_TENANTS', description: 'Platform-wide authority' }]
  },"""

new_role_privileges = """export const ROLE_PRIVILEGES: Record<UserRoleType, RolePrivilegeInfo> = {
  SUPER_ADMIN: {
    role: 'SUPER_ADMIN',
    title: 'Platform Super Administrator (SaaS Root)',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-400 font-extrabold',
    allowedTabs: [
      'dashboard', 'permissions-centre', 'dashboard-designer', 'tenants', 'plans', 'entitlements', 'audit'
    ],
    canEdit: ['All platform-level policies', 'Multi-tenant database quotas', 'Global RBAC catalog', 'SaaS subscription billing'],
    canApprove: ['Institution tenant onboarding', 'Platform break-glass override', 'Global license keys'],
    restrictedActions: ['Protected by Platform Lockout Guard: Cannot remove last Platform Super Admin access'],
    scopes: [{ scopeType: 'tenant', scopeValue: 'ALL_TENANTS', description: 'Platform Infrastructure Authority' }]
  },
  CHAIRMAN_DIRECTOR: {
    role: 'CHAIRMAN_DIRECTOR',
    title: 'Chairman / Director (Institution Super Admin)',
    badgeColor: 'bg-purple-100 text-purple-950 border-purple-500 font-black',
    allowedTabs: [
      'dashboard', 'institution-control-centre', 'permissions-centre', 'dashboard-designer',
      'examinations', 'progress-cards', 'fees', 'attendance', 'transport', 'students', 'staff', 'timetable', 'data-migration'
    ],
    canEdit: ['All campus policies & settings', 'Create institution users & assign custom roles', 'Central Permission Matrix for campus', 'Dashboard Designer layout & menu visibility', 'Configure custom fee heads', 'Strategic budget allocation'],
    canApprove: ['Exceptional fee concessions & waivers', 'Staff recruitments & promotions', 'High-value refunds & write-offs', 'Annual academic results publication'],
    restrictedActions: ['Isolated to institutional tenant; cannot alter SaaS platform tenancy licenses or cloud billing'],
    scopes: [{ scopeType: 'tenant', scopeValue: 'akshara', description: 'Akshara Global Educational Group' }]
  },
  DIRECTOR: {
    role: 'DIRECTOR',
    title: 'Executive Director (Institution Management)',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-400 font-bold',
    allowedTabs: ['dashboard', 'institution-control-centre', 'permissions-centre', 'dashboard-designer', 'examinations', 'fees', 'staff'],
    canEdit: ['Staff directory', 'Campus operations', 'Institution fee heads'],
    canApprove: ['Budget disbursements', 'Policy implementations'],
    restrictedActions: ['Cannot alter multi-tenant SaaS policies'],
    scopes: [{ scopeType: 'tenant', scopeValue: 'akshara', description: 'Campus Operational Management' }]
  },
  MANAGING_DIRECTOR: {
    role: 'MANAGING_DIRECTOR',
    title: 'Managing Director (Governance & Operations)',
    badgeColor: 'bg-indigo-100 text-indigo-950 border-indigo-500 font-black',
    allowedTabs: ['dashboard', 'institution-control-centre', 'permissions-centre', 'dashboard-designer', 'fees', 'staff'],
    canEdit: ['Institution governance', 'Executive reporting'],
    canApprove: ['Major capital contracts', 'Strategic fee frameworks'],
    restrictedActions: ['Cannot modify platform database engine'],
    scopes: [{ scopeType: 'tenant', scopeValue: 'akshara', description: 'Executive Board Governance' }]
  },
  TRUSTEE: {
    role: 'TRUSTEE',
    title: 'Board of Trustees / Management Committee',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-400 font-bold',
    allowedTabs: ['dashboard', 'institution-control-centre', 'fees', 'staff'],
    canEdit: ['Trust compliance declarations', 'Audit reviews'],
    canApprove: ['Annual institutional balance sheet & trust reports'],
    restrictedActions: ['Read-only operational access; cannot enter daily marks or attendance'],
    scopes: [{ scopeType: 'tenant', scopeValue: 'akshara', description: 'Board of Trustees Oversight' }]
  },"""

content = content.replace(old_role_privileges, new_role_privileges)

# Update PRINCIPAL in ROLE_PRIVILEGES
old_principal = """  PRINCIPAL: {
    role: 'PRINCIPAL',
    title: 'Principal / Director',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    allowedTabs: [
      'dashboard', 'students', 'attendance', 'examinations',
      'fees', 'transport', 'staff', 'timetable', 'analytics'
    ],
    canEdit: ['Academic calendar', 'Staff evaluations', 'Performance reviews'],
    canApprove: ['Final exam results publication (Stage 3)', 'Fee concessions & refunds', 'Student transfer certificates'],
    restrictedActions: ['Cannot silently overwrite marks entered by teachers without audit trail; cannot edit permissions'],
    scopes: [{ scopeType: 'campus', scopeValue: 'MAIN_CAMPUS', description: 'Main Campus & All Academic Streams' }]
  },"""

new_principal = """  PRINCIPAL: {
    role: 'PRINCIPAL',
    title: 'Principal (Academic Operations & Approvals)',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-400 font-bold',
    allowedTabs: [
      'dashboard', 'examinations', 'progress-cards', 'attendance', 'students', 'staff', 'timetable', 'fees', 'transport'
    ],
    canEdit: ['Academic calendar & curriculum', 'Staff classroom evaluations', 'Invigilation duty roster', 'Official student conduct remarks'],
    canApprove: ['Final exam results publication seal (Stage 3)', 'Student leave & transfer certificates', 'Class promotions'],
    restrictedActions: [
      'STRICTLY PROHIBITED from modifying role permissions, editing the Central Permission Matrix, altering dashboard layouts, or modifying fee heads (Reserved for Chairman / Director & Super Admin)'
    ],
    scopes: [{ scopeType: 'campus', scopeValue: 'MAIN_CAMPUS', description: 'Main Campus & All Academic Streams' }]
  },
  ADMISSION_OFFICER: {
    role: 'ADMISSION_OFFICER',
    title: 'Chief Admissions Officer',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-400 font-bold',
    allowedTabs: ['dashboard', 'admissions', 'students'],
    canEdit: ['Prospective student enquiries', 'Entrance test verification', 'Application dossiers'],
    canApprove: ['Provisional admission clearance (Stage 1)'],
    restrictedActions: ['LOCKED from financial ledger modification and examination marks entry'],
    scopes: [{ scopeType: 'tenant', scopeValue: 'akshara', description: 'Campus Admissions Department' }]
  },
  HR_MANAGER: {
    role: 'HR_MANAGER',
    title: 'Human Resources & Staff Officer',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold',
    allowedTabs: ['dashboard', 'staff'],
    canEdit: ['Faculty biodata, qualifications, biometric leaves, service registers', 'Payroll roster'],
    canApprove: ['Staff leave applications'],
    restrictedActions: ['LOCKED from student grades, fee transactions, and platform permissions'],
    scopes: [{ scopeType: 'tenant', scopeValue: 'akshara', description: 'Faculty & Non-Teaching Staff Cadre' }]
  },
  LECTURER: {
    role: 'LECTURER',
    title: 'Senior Lecturer (PU College - Science / Commerce)',
    badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-400 font-bold',
    allowedTabs: ['dashboard', 'attendance', 'examinations', 'timetable', 'progress-cards'],
    canEdit: ['Lecture period attendance', 'Draft theory & practical marks entry for assigned PU batches'],
    canApprove: ['Submit internal marks to Exam Controller (Stage 1)'],
    restrictedActions: ['LOCKED from fee collections, financial ledgers, and other lecturers\' batches'],
    scopes: [{ scopeType: 'programme', scopeValue: 'PU_SCIENCE', description: 'I & II PUC Science Batches' }]
  },
  LIBRARIAN: {
    role: 'LIBRARIAN',
    title: 'Chief Librarian & Information Officer',
    badgeColor: 'bg-yellow-100 text-yellow-900 border-yellow-400 font-bold',
    allowedTabs: ['dashboard', 'students'],
    canEdit: ['Book accession catalog, issue/return registry, fine collection'],
    canApprove: ['Library No-Dues clearance for TC & hall tickets'],
    restrictedActions: ['LOCKED from exam marks, core fee structures, and staff records'],
    scopes: [{ scopeType: 'department', scopeValue: 'LIBRARY', description: 'Campus Central Library' }]
  },
  HOSTEL_WARDEN: {
    role: 'HOSTEL_WARDEN',
    title: 'Chief Hostel Warden & Residential Superintendent',
    badgeColor: 'bg-violet-100 text-violet-900 border-violet-400 font-bold',
    allowedTabs: ['dashboard', 'students', 'attendance'],
    canEdit: ['Hostel room allocations, night roll-call attendance, gate passes, dining feedback'],
    canApprove: ['Hostel night-out leaves & visitor clearances'],
    restrictedActions: ['LOCKED from academic marks entry and fee rate configurations'],
    scopes: [{ scopeType: 'department', scopeValue: 'HOSTEL', description: 'Boys & Girls Residential Hostels' }]
  },
  DRIVER: {
    role: 'DRIVER',
    title: 'Campus Transport Driver (Route Fleet)',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-400 font-bold',
    allowedTabs: ['dashboard', 'transport'],
    canEdit: ['Trip start/stop status, passenger boarding check'],
    canApprove: ['None'],
    restrictedActions: ['LOCKED from all academic, administrative, and financial modules'],
    scopes: [{ scopeType: 'assigned_route', scopeValue: 'ROUTE_104', description: 'Assigned Bus Route 104' }]
  },"""

content = content.replace(old_principal, new_principal)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Step 2 done.")

