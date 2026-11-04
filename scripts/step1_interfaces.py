import sys

with open('apps/web/src/store/demoStore.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. New Interfaces to insert after MigrationBatch interface
interfaces_to_add = '''
// ============================================================================
// LABORATORY MANAGEMENT & QR INVENTORY DOMAIN
// ============================================================================

export type LaboratoryType = 
  | 'PHYSICS' 
  | 'CHEMISTRY' 
  | 'BIOLOGY' 
  | 'COMPUTER' 
  | 'MATHEMATICS' 
  | 'ELECTRONICS' 
  | 'BIOTECH' 
  | 'CUSTOM';

export interface LaboratoryModel {
  id: string;
  name: string;
  type: LaboratoryType;
  campus: string;
  building: string;
  floor: string;
  roomNumber: string;
  inChargeName: string;
  assignedTeachers: string[];
  labAssistants: string[];
  capacity: number;
  totalItems: number;
  inventoryValue: number;
  lowStockCount: number;
  maintenanceCount: number;
  safetyTier: string;
}

export type LabItemCategory = 
  | 'REUSABLE_EQUIPMENT' 
  | 'CONSUMABLE_CHEMICAL' 
  | 'HAZARDOUS_MATERIAL' 
  | 'GLASSWARE'
  | 'COMPUTING_HARDWARE';

export interface LabInventoryItem {
  id: string; // e.g. "LAB-PHY-001"
  name: string;
  labId: string;
  category: LabItemCategory;
  storageLocation: string; // "Cupboard 2, Shelf B"
  unit: string; // "Units", "Bottles (500ml)", "Grams", "Sets"
  currentStock: number;
  minStockLevel: number;
  unitPrice: number;
  totalValue: number;
  manufacturer: string;
  supplier: string;
  batchNumber: string;
  purchaseDate: string;
  expiryDate?: string;
  condition: 'OPERATIONAL' | 'CALIBRATION_DUE' | 'UNDER_MAINTENANCE' | 'DAMAGED';
  qrCodeValue: string;
  safetyClassification: string;
  lastVerifiedDate: string;
}

export interface LabStockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'ISSUE' | 'RETURN' | 'CONSUMPTION' | 'PURCHASE_RECEIPT' | 'DAMAGE_WRITE_OFF';
  quantity: number;
  unit: string;
  performedBy: string;
  requestedBy: string;
  purpose: string;
  timestamp: string;
  balanceAfter: number;
}

export interface LabExperiment {
  id: string;
  subject: string;
  title: string;
  classGroup: string;
  requiredMaterials: string[];
  scheduleDate: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
  teacherName: string;
}

// ============================================================================
// MULTI-CHANNEL COMMUNICATION HUB (WHATSAPP & TELEGRAM) DOMAIN
// ============================================================================

export interface CommunicationChannelConfig {
  id: 'whatsapp' | 'telegram' | 'sms' | 'email';
  name: string;
  isEnabled: boolean;
  status: 'CONNECTED' | 'DISCONNECTED' | 'TEST_FAILED';
  lastPingTime?: string;
  credentials: {
    phoneNumberId?: string;
    wabaId?: string;
    accessToken?: string;
    webhookVerifyToken?: string;
    botToken?: string;
    botUsername?: string;
    targetChannelOrChatId?: string;
    senderId?: string;
    apiKey?: string;
    smtpHost?: string;
    smtpUser?: string;
  };
}

export interface CommunicationTemplate {
  id: string;
  eventTrigger: 'EXAM_TIMETABLE' | 'EXAM_RESULT' | 'FEE_RECEIPT' | 'FEE_DUE' | 'ATTENDANCE_ABSENT' | 'PRACTICAL_SCHEDULE';
  title: string;
  language: 'EN' | 'KN' | 'HI' | 'TE';
  channel: 'whatsapp' | 'telegram' | 'sms';
  content: string;
  placeholders: string[];
  providerApproved: boolean;
}

export interface CommunicationDeliveryLog {
  id: string;
  recipientName: string;
  recipientContact: string;
  recipientRole: 'PARENT' | 'STUDENT' | 'TEACHER';
  channel: 'whatsapp' | 'telegram' | 'sms' | 'email';
  eventTrigger: string;
  messageText: string;
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  timestamp: string;
  providerRefId: string;
}

// ============================================================================
// CENTRAL PLATFORM SUPER ADMIN (1,000+ TENANTS & CONSENT SUPPORT)
// ============================================================================

export interface PlatformTenant {
  id: string;
  name: string;
  type: 'SCHOOL' | 'PU_COLLEGE' | 'DEGREE_COLLEGE' | 'COMPOSITE_GROUP';
  state: string;
  city: string;
  plan: 'STARTER' | 'STANDARD' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED';
  studentCount: number;
  staffCount: number;
  mrrAmount: number;
  renewalDate: string;
  chairmanEmail: string;
  activeCampuses: number;
  customDomain?: string;
  consentSupportActive: boolean;
}

export interface TechnicalSupportTicket {
  id: string;
  tenantId: string;
  tenantName: string;
  category: 'DATABASE_MIGRATION' | 'WHATSAPP_INTEGRATION' | 'EXAM_APPROVAL_STUCK' | 'FEE_GATEWAY';
  requestedScope: 'DIAGNOSTICS_ONLY' | 'CONFIG_INSPECTION' | 'TEMP_RECORD_AUDIT';
  requestedDurationHours: number;
  status: 'PENDING_INSTITUTION_APPROVAL' | 'APPROVED_ACTIVE' | 'REJECTED' | 'EXPIRED';
  requestedAt: string;
  approvedByChairman?: string;
  expiresAt?: string;
}

export interface PlatformProcurementItem {
  id: string;
  serviceCategory: string;
  vendor: string;
  monthlyCost: number;
  status: 'PRODUCTION_ACTIVE' | 'EVALUATION' | 'CONFIGURED';
  renewalDate: string;
}

export interface ExamWizardPayload {
  name: string;
  category: InstitutionalExamCategory;
  academicYear: string;
  programmeOrClass: string;
  stream: string;
  subjects: {
    subjectName: string;
    maxMarks: number;
    passMarks: number;
    theoryMarks: number;
    practicalMarks: number;
    examDate: string;
    room: string;
    invigilator: string;
  }[];
  deliveryMode: ExamDeliveryMode;
  instructions: string;
}
'''

# Find a good anchor to insert interfaces
anchor = "export interface MigrationBatch {"
if anchor in text:
    # insert before the anchor
    text = text.replace(anchor, interfaces_to_add + "\n" + anchor)
    print("Inserted interfaces before MigrationBatch")
else:
    print("Could not find MigrationBatch anchor")
    sys.exit(1)

with open('apps/web/src/store/demoStore.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Step 1 complete.")
