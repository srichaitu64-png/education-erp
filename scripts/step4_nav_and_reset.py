import sys

with open('apps/web/src/store/demoStore.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update resetDemoData
reset_anchor = "designerStatus: 'PUBLISHED'"
reset_additions = ''',
      laboratories: initialLaboratories,
      labInventory: initialLabInventory,
      labMovements: initialLabMovements,
      labExperiments: initialLabExperiments,
      activeLabFilter: 'ALL',
      commChannels: initialCommChannels,
      commTemplates: initialCommTemplates,
      commDeliveryLogs: initialCommDeliveryLogs,
      commAutoTriggers: {
        'EXAM_TIMETABLE': true,
        'EXAM_RESULT': true,
        'FEE_RECEIPT': true,
        'FEE_DUE': true,
        'ATTENDANCE_ABSENT': true,
        'PRACTICAL_SCHEDULE': true
      },
      platformTenants: initialPlatformTenants,
      supportTickets: initialSupportTickets,
      procurementItems: initialProcurementItems,
      activeSubscriptionPlan: 'ENTERPRISE'
'''

if reset_anchor in text:
    text = text.replace(reset_anchor, reset_anchor + reset_additions)
    print("Updated resetDemoData")
else:
    print("Could not find reset_anchor")
    sys.exit(1)

# 2. Add navigation items into initialNavConfigs
# In SUPER_ADMIN:
super_admin_target = "{ id: 'transport', label: 'Transport & Fleet GPS', iconName: 'Bus', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'configure'] },"
super_admin_add = super_admin_target + '''
    { id: 'platform-superadmin', label: 'Platform SaaS Command (1,000+ Tenancies)', iconName: 'ShieldAlert', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'manage', 'provision', 'support'] },
    { id: 'laboratory', label: 'Laboratory & QR Inventory', iconName: 'FlaskConical', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'manage'] },
    { id: 'communication', label: 'Communication Hub (WhatsApp/Telegram)', iconName: 'MessageSquare', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'broadcast', 'configure'] },'''

if super_admin_target in text:
    text = text.replace(super_admin_target, super_admin_add, 1)
    print("Updated SUPER_ADMIN nav config")

# In CHAIRMAN_DIRECTOR:
chair_target = "{ id: 'progress-cards', label: 'Student Progress Cards', iconName: 'FileCheck', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'export', 'print'] },"
chair_add = chair_target + '''
    { id: 'laboratory', label: 'Laboratory & QR Inventory', iconName: 'FlaskConical', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'manage', 'audit'] },
    { id: 'communication', label: 'Communication Hub (WhatsApp/Telegram)', iconName: 'MessageSquare', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'broadcast', 'configure'] },'''

if chair_target in text:
    text = text.replace(chair_target, chair_add, 1)
    print("Updated CHAIRMAN_DIRECTOR nav config")

# In PRINCIPAL:
princ_target = "{ id: 'timetable', label: 'Weekly Timetable', iconName: 'Clock', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] }"
princ_add = princ_target + ''',
    { id: 'laboratory', label: 'Laboratory & QR Inventory', iconName: 'FlaskConical', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'audit'] },
    { id: 'communication', label: 'Communication Hub (WhatsApp/Telegram)', iconName: 'MessageSquare', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'broadcast'] }'''

if princ_target in text:
    text = text.replace(princ_target, princ_add, 1)
    print("Updated PRINCIPAL nav config")

with open('apps/web/src/store/demoStore.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Step 4 complete.")

