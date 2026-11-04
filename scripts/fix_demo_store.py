import sys

with open('apps/web/src/store/demoStore.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's inspect line 3900-3920 in implementation:
# We just need to remove the duplicate property declarations in implementation:
duplicate_decl = '''  // Laboratory Management Implementation
  laboratories: initialLaboratories,
  labInventory: initialLabInventory,
  labMovements: initialLabMovements,
  labExperiments: initialLabExperiments,
  activeLabFilter: 'ALL','''

replacement_decl = '''  // Laboratory Management Implementation'''

text = text.replace(duplicate_decl, replacement_decl)

duplicate_comm = '''  // Multi-Channel Communication Hub Implementation
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
  },'''

replacement_comm = '''  // Multi-Channel Communication Hub Implementation'''

text = text.replace(duplicate_comm, replacement_comm)

duplicate_platform = '''  // Central Platform Super Admin Implementation
  platformTenants: initialPlatformTenants,
  supportTickets: initialSupportTickets,
  procurementItems: initialProcurementItems,
  activeSubscriptionPlan: 'ENTERPRISE','''

replacement_platform = '''  // Central Platform Super Admin Implementation'''

text = text.replace(duplicate_platform, replacement_platform)

# Now check if resetDemoData also has the resets
# In resetDemoData:
reset_needle = "designerVersion: 2,\n      designerStatus: 'PUBLISHED'\n    });"
reset_replacement = """designerVersion: 2,
      designerStatus: 'PUBLISHED',
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
    });"""

if reset_needle in text:
    text = text.replace(reset_needle, reset_replacement)

with open('apps/web/src/store/demoStore.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Applied deduplication to demoStore.ts")
