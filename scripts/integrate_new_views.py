import sys

with open('apps/web/src/pages/demo/InteractiveDemoPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Imports
import_statement = '''import { LaboratoryManagementView } from './views/LaboratoryManagementView';
import { CommunicationHubView } from './views/CommunicationHubView';
import { PlatformSuperAdminView } from './views/PlatformSuperAdminView';
'''

if "import { LaboratoryManagementView }" not in text:
    text = import_statement + text
    print("Added view imports")

# 2. Lucide imports check
# Check if FlaskConical, MessageSquare, ShieldAlert are in lucide-react import
lucide_anchor = "import {\n  GraduationCap,"
lucide_replacement = '''import {
  FlaskConical,
  MessageSquare,
  ShieldAlert,
  GraduationCap,'''

if lucide_anchor in text:
    text = text.replace(lucide_anchor, lucide_replacement, 1)
    print("Added lucide icons")

# 3. Add to allNavItems
nav_target = "{ id: 'progress-cards', label: 'Student Progress Cards', icon: FileCheck, isSuperAdminOnly: false },"
nav_additions = nav_target + '''
    { id: 'laboratory', label: 'Laboratory & QR Inventory', icon: FlaskConical, isSuperAdminOnly: false },
    { id: 'communication', label: 'Communication Hub (WhatsApp/Telegram)', icon: MessageSquare, isSuperAdminOnly: false },
    { id: 'platform-superadmin', label: 'Platform SaaS Command (1,000+ Tenancies)', icon: ShieldAlert, isSuperAdminOnly: true },'''

if nav_target in text and "{ id: 'laboratory'" not in text:
    text = text.replace(nav_target, nav_additions, 1)
    print("Added laboratory, communication, and platform-superadmin to allNavItems")

# 4. Render views in main content area
# Insert before </main>
main_close = "</main>"
views_to_render = '''
          {/* ================================================================= */}
          {/* TAB 9: LABORATORY MANAGEMENT & QR INVENTORY */}
          {/* ================================================================= */}
          {activeTab === 'laboratory' && (
            <LaboratoryManagementView />
          )}

          {/* ================================================================= */}
          {/* TAB 10: MULTI-CHANNEL COMMUNICATION HUB (WHATSAPP & TELEGRAM) */}
          {/* ================================================================= */}
          {activeTab === 'communication' && (
            <CommunicationHubView />
          )}

          {/* ================================================================= */}
          {/* TAB 11: CENTRAL PLATFORM SUPER ADMIN (1,000+ TENANCIES) */}
          {/* ================================================================= */}
          {activeTab === 'platform-superadmin' && (
            <PlatformSuperAdminView />
          )}

        '''

if main_close in text and "{activeTab === 'laboratory'" not in text:
    text = text.replace(main_close, views_to_render + main_close, 1)
    print("Rendered new views before </main>")

with open('apps/web/src/pages/demo/InteractiveDemoPage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Integration complete.")

