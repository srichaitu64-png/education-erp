import sys

path = 'apps/web/src/store/demoStore.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update TEACHER allowedTabs
old_teacher_tabs = """  TEACHER: {
    role: 'TEACHER',
    title: 'Faculty / Subject Teacher (Physics - I PUC)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    allowedTabs: ['dashboard', 'attendance', 'examinations', 'timetable'],"""

new_teacher_tabs = """  TEACHER: {
    role: 'TEACHER',
    title: 'Faculty / Subject Teacher (Physics - I PUC)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    allowedTabs: ['dashboard', 'attendance', 'examinations', 'progress-cards', 'timetable'],"""

content = content.replace(old_teacher_tabs, new_teacher_tabs)

# Update EXAM_CONTROLLER allowedTabs
old_ec_tabs = """  EXAM_CONTROLLER: {
    role: 'EXAM_CONTROLLER',
    title: 'Controller of Examinations',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    allowedTabs: ['dashboard', 'examinations'],"""

new_ec_tabs = """  EXAM_CONTROLLER: {
    role: 'EXAM_CONTROLLER',
    title: 'Controller of Examinations',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    allowedTabs: ['dashboard', 'examinations', 'progress-cards'],"""

content = content.replace(old_ec_tabs, new_ec_tabs)

# Update PARENT allowedTabs
old_parent_tabs = """  PARENT: {
    role: 'PARENT',
    title: 'Parent / Guardian (Aarav Sharma - Class 10)',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    allowedTabs: ['dashboard', 'students', 'fees', 'attendance', 'examinations', 'transport', 'timetable'],"""

new_parent_tabs = """  PARENT: {
    role: 'PARENT',
    title: 'Parent / Guardian (Aarav Sharma - Class 10)',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    allowedTabs: ['dashboard', 'students', 'fees', 'attendance', 'examinations', 'progress-cards', 'transport', 'timetable'],"""

content = content.replace(old_parent_tabs, new_parent_tabs)

# Update STUDENT allowedTabs
old_student_tabs = """  STUDENT: {
    role: 'STUDENT',
    title: 'Student Portal (Ananya Hegde - I PUC PCMB)',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    allowedTabs: ['dashboard', 'examinations', 'attendance', 'timetable'],"""

new_student_tabs = """  STUDENT: {
    role: 'STUDENT',
    title: 'Student Portal (Ananya Hegde - I PUC PCMB)',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    allowedTabs: ['dashboard', 'examinations', 'progress-cards', 'attendance', 'timetable'],"""

content = content.replace(old_student_tabs, new_student_tabs)

# Update initialNavConfigs[PRINCIPAL]
old_nav_principal = """  PRINCIPAL: [
    { id: 'dashboard', label: 'Overview', iconName: 'GraduationCap', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'examinations', label: 'Examinations Module', iconName: 'Award', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'verify', 'approve', 'publish'] },
    { id: 'fees', label: 'Fee Overview & Refunds', iconName: 'CreditCard', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'approve'] },
    { id: 'attendance', label: 'Daily Attendance', iconName: 'CalendarCheck', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'verify'] },
  ],"""

new_nav_principal = """  PRINCIPAL: [
    { id: 'dashboard', label: 'Overview', iconName: 'GraduationCap', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'examinations', label: 'Examinations Module', iconName: 'Award', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'verify', 'approve', 'publish'] },
    { id: 'progress-cards', label: 'Student Progress Cards', iconName: 'FileCheck', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'export', 'print'] },
    { id: 'fees', label: 'Fee Overview & Refunds', iconName: 'CreditCard', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'approve'] },
    { id: 'attendance', label: 'Daily Attendance', iconName: 'CalendarCheck', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'verify'] },
    { id: 'students', label: 'Students (SIS)', iconName: 'Users', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'staff', label: 'Faculty & HR', iconName: 'Users', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'timetable', label: 'Weekly Timetable', iconName: 'Clock', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
  ],"""

content = content.replace(old_nav_principal, new_nav_principal)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Allowed tabs and nav configs updated.")

