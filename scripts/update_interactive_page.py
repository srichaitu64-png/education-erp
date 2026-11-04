import sys

path = 'apps/web/src/pages/demo/InteractiveDemoPage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update lucide-react imports to include TrendingUp
old_lucide = """  AlertCircle,
  Plus
} from 'lucide-react';"""

new_lucide = """  AlertCircle,
  Plus,
  TrendingUp
} from 'lucide-react';"""

content = content.replace(old_lucide, new_lucide)

# 2. Update allNavItems
old_nav_items = """  // Nav items definition
  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: Layers, isSuperAdminOnly: false },
    { id: 'permissions-centre', label: 'Central Permission Matrix', icon: Key, isSuperAdminOnly: true },
    { id: 'dashboard-designer', label: 'Dashboard & Access Designer', icon: Layout, isSuperAdminOnly: true },
    { id: 'examinations', label: 'Examinations Lifecycle', icon: Award, isSuperAdminOnly: false },
    { id: 'institution-login', label: 'Institution Login & Autocomplete', icon: UserCheck, isSuperAdminOnly: false },
    { id: 'academics', label: 'Academic & Subjects', icon: BookOpen, isSuperAdminOnly: false },
    { id: 'fees', label: 'Fee Management', icon: CreditCard, isSuperAdminOnly: false },
    { id: 'attendance', label: 'Daily Attendance', icon: CalendarCheck, isSuperAdminOnly: false },
    { id: 'transport', label: 'Transport Fleet & GPS', icon: Bus, isSuperAdminOnly: false },
    { id: 'admissions', label: 'Admissions Pipeline', icon: GraduationCap, isSuperAdminOnly: false },
    { id: 'students', label: 'Students (SIS)', icon: Users, isSuperAdminOnly: false },
    { id: 'staff', label: 'Faculty & HR', icon: Users, isSuperAdminOnly: false },
    { id: 'timetable', label: 'Weekly Timetable', icon: Clock, isSuperAdminOnly: false },
  ];"""

new_nav_items = """  // Nav items definition
  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: Layers, isSuperAdminOnly: false },
    { id: 'institution-control-centre', label: 'Institution Control Centre', icon: Building2, isSuperAdminOnly: false },
    { id: 'permissions-centre', label: 'Central Permission Matrix', icon: Key, isSuperAdminOnly: true },
    { id: 'dashboard-designer', label: 'Dashboard & Access Designer', icon: Layout, isSuperAdminOnly: true },
    { id: 'examinations', label: 'Examinations Lifecycle', icon: Award, isSuperAdminOnly: false },
    { id: 'progress-cards', label: 'Student Progress Cards', icon: FileCheck, isSuperAdminOnly: false },
    { id: 'fees', label: 'Fee Management & Statements', icon: CreditCard, isSuperAdminOnly: false },
    { id: 'data-migration', label: 'Data Migration Centre', icon: Upload, isSuperAdminOnly: false },
    { id: 'attendance', label: 'Daily Attendance', icon: CalendarCheck, isSuperAdminOnly: false },
    { id: 'transport', label: 'Transport Fleet & GPS', icon: Bus, isSuperAdminOnly: false },
    { id: 'academics', label: 'Academic & Subjects', icon: BookOpen, isSuperAdminOnly: false },
    { id: 'students', label: 'Students (SIS)', icon: Users, isSuperAdminOnly: false },
    { id: 'staff', label: 'Faculty & HR', icon: Users, isSuperAdminOnly: false },
    { id: 'timetable', label: 'Weekly Timetable', icon: Clock, isSuperAdminOnly: false },
    { id: 'institution-login', label: 'Institution Login & Autocomplete', icon: UserCheck, isSuperAdminOnly: false },
    { id: 'admissions', label: 'Admissions Pipeline', icon: GraduationCap, isSuperAdminOnly: false },
  ];"""

content = content.replace(old_nav_items, new_nav_items)

# 3. Update role select dropdown
old_role_select = """              <option value="PRINCIPAL">👑 Principal / Director</option>
              <option value="SUPER_ADMIN">🌐 Platform Super Admin (Full Control)</option>
              <option value="BACKUP_SUPER_ADMIN">🛡️ Backup Super Admin (Secondary Authority)</option>
              <option value="DEVELOPER">💻 Developer / Tech Support</option>
              <option value="INSTITUTION_ADMIN">🏛️ Institution Admin</option>
              <option value="VICE_PRINCIPAL">🎓 Vice Principal</option>
              <option value="ACCOUNTANT">💰 Accountant / Finance</option>
              <option value="EXAM_CONTROLLER">📝 Examination Controller</option>
              <option value="TEACHER">👩‍🏫 Teacher (I PUC Physics)</option>
              <option value="PARENT">👨‍👩‍👧 Parent (Aarav's Guardian)</option>
              <option value="STUDENT">🎒 Student (Ananya - I PUC)</option>
              <option value="TRANSPORT_MANAGER">🚌 Transport Manager</option>"""

new_role_select = """              <option value="CHAIRMAN_DIRECTOR">🏛️ Chairman / Director (Institution Super Admin)</option>
              <option value="PRINCIPAL">👑 Principal (Academics & Approvals)</option>
              <option value="ACCOUNTANT">💰 Accountant / Finance Officer</option>
              <option value="EXAM_CONTROLLER">📝 Examination Controller</option>
              <option value="INSTITUTION_ADMIN">⚙️ Institution Admin</option>
              <option value="VICE_PRINCIPAL">🎓 Vice Principal</option>
              <option value="ADMISSION_OFFICER">📋 Admission Officer</option>
              <option value="HR_MANAGER">👥 HR & Staff Manager</option>
              <option value="TEACHER">👩‍🏫 Teacher (I PUC Physics)</option>
              <option value="LECTURER">🔬 Senior PU Lecturer</option>
              <option value="LIBRARIAN">📚 Librarian</option>
              <option value="HOSTEL_WARDEN">🏠 Hostel Warden</option>
              <option value="TRANSPORT_MANAGER">🚌 Transport Manager</option>
              <option value="DRIVER">🚍 Bus Driver</option>
              <option value="PARENT">👨‍👩‍👧 Parent (Ramesh Kumar - Rahul's Parent)</option>
              <option value="STUDENT">🎒 Student (Rahul Kumar - I PUC PCMB)</option>
              <option value="SUPER_ADMIN">🌐 Platform Super Admin (SaaS Root)</option>
              <option value="BACKUP_SUPER_ADMIN">🛡️ Backup Super Admin</option>
              <option value="DEVELOPER">💻 Developer / Tech Support</option>"""

content = content.replace(old_role_select, new_role_select)

# 4. Update the sidebar filter so permissions-centre and dashboard-designer are visible to CHAIRMAN_DIRECTOR as well
old_super_check = """              if (item.isSuperAdminOnly && currentRole !== 'SUPER_ADMIN' && currentRole !== 'BACKUP_SUPER_ADMIN') {
                return null; // Omitted completely from DOM & navigation for ordinary users
              }"""

new_super_check = """              // Institution Control Centre is only visible for leadership
              if (item.id === 'institution-control-centre' && currentRole !== 'CHAIRMAN_DIRECTOR' && currentRole !== 'DIRECTOR' && currentRole !== 'MANAGING_DIRECTOR' && currentRole !== 'SUPER_ADMIN') {
                return null;
              }

              // Super Admin permission matrix & dashboard designer are restricted to Super Admin & Chairman
              if (item.isSuperAdminOnly && currentRole !== 'SUPER_ADMIN' && currentRole !== 'BACKUP_SUPER_ADMIN' && currentRole !== 'CHAIRMAN_DIRECTOR') {
                return null; // Omitted completely from DOM & navigation for Principal and other staff
              }"""

content = content.replace(old_super_check, new_super_check)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("InteractiveDemoPage navigation updated.")

