import sys

with open('apps/web/src/store/demoStore.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add fields and actions to DemoState interface
state_fields_to_add = '''
  // ============================================================================
  // LABORATORY MANAGEMENT
  // ============================================================================
  laboratories: LaboratoryModel[];
  labInventory: LabInventoryItem[];
  labMovements: LabStockMovement[];
  labExperiments: LabExperiment[];
  activeLabFilter: string;
  setActiveLabFilter: (labId: string) => void;
  addLabItem: (item: LabInventoryItem) => void;
  issueLabItem: (itemId: string, quantity: number, requestedBy: string, purpose: string) => { success: boolean; message: string };
  returnLabItem: (itemId: string, returnedQuantity: number, consumedQuantity: number) => { success: boolean; message: string };
  recordMaintenance: (itemId: string, nextCalibration: string, condition: 'OPERATIONAL' | 'CALIBRATION_DUE' | 'UNDER_MAINTENANCE') => void;
  verifyPhysicalStock: (itemId: string, countedQty: number) => { discrepancy: number; status: string };

  // ============================================================================
  // MULTI-CHANNEL COMMUNICATION HUB
  // ============================================================================
  commChannels: CommunicationChannelConfig[];
  commTemplates: CommunicationTemplate[];
  commDeliveryLogs: CommunicationDeliveryLog[];
  commAutoTriggers: Record<string, boolean>;
  updateChannelConfig: (channelId: 'whatsapp' | 'telegram' | 'sms' | 'email', partial: Partial<CommunicationChannelConfig>) => void;
  testChannelConnection: (channelId: 'whatsapp' | 'telegram' | 'sms' | 'email') => { success: boolean; latencyMs: number; message: string };
  toggleAutoTrigger: (triggerKey: string) => void;
  dispatchCommunicationMessage: (payload: { recipientName: string; recipientContact: string; recipientRole: 'PARENT' | 'STUDENT' | 'TEACHER'; channel: 'whatsapp' | 'telegram' | 'sms' | 'email'; eventTrigger: string; messageText: string }) => CommunicationDeliveryLog;

  // ============================================================================
  // CENTRAL PLATFORM SUPER ADMIN (1,000+ TENANTS & CONSENT SUPPORT)
  // ============================================================================
  platformTenants: PlatformTenant[];
  supportTickets: TechnicalSupportTicket[];
  procurementItems: PlatformProcurementItem[];
  activeSubscriptionPlan: 'STARTER' | 'STANDARD' | 'PRO' | 'ENTERPRISE';
  setActiveSubscriptionPlan: (plan: 'STARTER' | 'STANDARD' | 'PRO' | 'ENTERPRISE') => void;
  provisionNewTenant: (payload: { name: string; type: 'SCHOOL' | 'PU_COLLEGE' | 'DEGREE_COLLEGE' | 'COMPOSITE_GROUP'; state: string; city: string; plan: 'STARTER' | 'STANDARD' | 'PRO' | 'ENTERPRISE'; capacity: number }) => { tenant: PlatformTenant; activationLink: string };
  approveSupportAccess: (ticketId: string, approvedBy: string) => { success: boolean; message: string };
  revokeSupportAccess: (ticketId: string) => void;

  // ============================================================================
  // EXAM WIZARD & MARKS WORKFLOW
  // ============================================================================
  createExamViaWizard: (payload: ExamWizardPayload) => { success: boolean; exam: DemoExam };
  updateStudentExamMarks: (examId: string, studentId: string, marksObtained: number, status: 'PRESENT' | 'ABSENT' | 'EXEMPTED' | 'WITHHELD') => void;
  advanceExamApprovalStage: (examId: string) => { currentStage: string; published: boolean };
'''

anchor1 = "executeMigrationBatch: (batchId: string) => { success: boolean; message: string; importedCount: number };"
if anchor1 in text:
    text = text.replace(anchor1, anchor1 + "\n" + state_fields_to_add)
    print("Added fields to DemoState interface")
else:
    print("Could not find anchor1 in DemoState")
    sys.exit(1)

# 2. Add implementation to useDemoStore create block
impl_to_add = '''
  // Laboratory Management Implementation
  laboratories: initialLaboratories,
  labInventory: initialLabInventory,
  labMovements: initialLabMovements,
  labExperiments: initialLabExperiments,
  activeLabFilter: 'ALL',

  setActiveLabFilter: (labId) => set({ activeLabFilter: labId }),

  addLabItem: (item) => {
    set((state) => ({
      labInventory: [item, ...state.labInventory],
      laboratories: state.laboratories.map(lab => 
        lab.id === item.labId 
          ? { ...lab, totalItems: lab.totalItems + 1, inventoryValue: lab.inventoryValue + item.totalValue }
          : lab
      )
    }));
  },

  issueLabItem: (itemId, quantity, requestedBy, purpose) => {
    const item = get().labInventory.find(i => i.id === itemId);
    if (!item) return { success: false, message: 'Item not found in laboratory inventory.' };
    if (item.currentStock < quantity) {
      return { success: false, message: `Insufficient stock! Requested ${quantity} ${item.unit}, but only ${item.currentStock} are available.` };
    }

    const newStock = item.currentStock - quantity;
    const movement: LabStockMovement = {
      id: `MOV-2026-${String(Math.floor(1000 + Math.random() * 9000))}`,
      itemId: item.id,
      itemName: item.name,
      type: 'ISSUE',
      quantity,
      unit: item.unit,
      performedBy: 'K. Suresh (Senior Lab Tech)',
      requestedBy,
      purpose,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      balanceAfter: newStock
    };

    set((state) => ({
      labInventory: state.labInventory.map(i => 
        i.id === itemId ? { ...i, currentStock: newStock, totalValue: newStock * i.unitPrice } : i
      ),
      labMovements: [movement, ...state.labMovements]
    }));

    return {
      success: true,
      message: `Successfully issued ${quantity} ${item.unit} of '${item.name}' to ${requestedBy}. Remaining balance: ${newStock} ${item.unit}.`
    };
  },

  returnLabItem: (itemId, returnedQuantity, consumedQuantity) => {
    const item = get().labInventory.find(i => i.id === itemId);
    if (!item) return { success: false, message: 'Item not found in laboratory inventory.' };

    const newStock = item.currentStock + returnedQuantity;
    const movement: LabStockMovement = {
      id: `MOV-2026-${String(Math.floor(1000 + Math.random() * 9000))}`,
      itemId: item.id,
      itemName: item.name,
      type: consumedQuantity > 0 ? 'CONSUMPTION' : 'RETURN',
      quantity: returnedQuantity > 0 ? returnedQuantity : consumedQuantity,
      unit: item.unit,
      performedBy: 'K. Suresh (Senior Lab Tech)',
      requestedBy: 'Faculty Return Custody',
      purpose: consumedQuantity > 0 ? `Practical session usage (${consumedQuantity} consumed, ${returnedQuantity} returned)` : 'Post-practical return to cabinet',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      balanceAfter: newStock
    };

    set((state) => ({
      labInventory: state.labInventory.map(i => 
        i.id === itemId ? { ...i, currentStock: newStock, totalValue: newStock * i.unitPrice } : i
      ),
      labMovements: [movement, ...state.labMovements]
    }));

    return {
      success: true,
      message: `Return recorded for '${item.name}'. Restocked: ${returnedQuantity} ${item.unit}. Current available: ${newStock} ${item.unit}.`
    };
  },

  recordMaintenance: (itemId, nextCalibration, condition) => {
    set((state) => ({
      labInventory: state.labInventory.map(i => 
        i.id === itemId ? { ...i, condition, lastVerifiedDate: new Date().toISOString().split('T')[0] } : i
      )
    }));
  },

  verifyPhysicalStock: (itemId, countedQty) => {
    const item = get().labInventory.find(i => i.id === itemId);
    if (!item) return { discrepancy: 0, status: 'NOT_FOUND' };
    const discrepancy = countedQty - item.currentStock;
    set((state) => ({
      labInventory: state.labInventory.map(i => 
        i.id === itemId ? { ...i, currentStock: countedQty, totalValue: countedQty * i.unitPrice, lastVerifiedDate: new Date().toISOString().split('T')[0] } : i
      )
    }));
    return {
      discrepancy,
      status: discrepancy === 0 ? 'VERIFIED_MATCH' : discrepancy < 0 ? 'SHORTAGE_FLAGGED' : 'SURPLUS_FLAGGED'
    };
  },

  // Multi-Channel Communication Hub Implementation
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

  updateChannelConfig: (channelId, partial) => {
    set((state) => ({
      commChannels: state.commChannels.map(c => 
        c.id === channelId ? { ...c, ...partial } : c
      )
    }));
  },

  testChannelConnection: (channelId) => {
    const channel = get().commChannels.find(c => c.id === channelId);
    if (!channel) return { success: false, latencyMs: 0, message: 'Channel not configured.' };

    const latency = Math.floor(80 + Math.random() * 80);
    set((state) => ({
      commChannels: state.commChannels.map(c => 
        c.id === channelId 
          ? { ...c, status: 'CONNECTED', lastPingTime: `Just now (Latency: ${latency}ms)` } 
          : c
      )
    }));

    const details = channelId === 'whatsapp' 
      ? 'Meta Graph API v19.0 Authenticated • Verified Phone Number ID: ' + (channel.credentials.phoneNumberId || '109283746152840')
      : channelId === 'telegram'
      ? 'Telegram Bot API 7.0 Authenticated • @AksharaGlobal_Bot Webhook OK'
      : 'Provider Gateway Connected Successfully';

    return {
      success: true,
      latencyMs: latency,
      message: `[200 OK] ${details}`
    };
  },

  toggleAutoTrigger: (triggerKey) => {
    set((state) => ({
      commAutoTriggers: {
        ...state.commAutoTriggers,
        [triggerKey]: !state.commAutoTriggers[triggerKey]
      }
    }));
  },

  dispatchCommunicationMessage: (payload) => {
    const newLog: CommunicationDeliveryLog = {
      id: `LOG-MSG-${String(Math.floor(1000 + Math.random() * 9000))}`,
      recipientName: payload.recipientName,
      recipientContact: payload.recipientContact,
      recipientRole: payload.recipientRole,
      channel: payload.channel,
      eventTrigger: payload.eventTrigger,
      messageText: payload.messageText,
      status: 'SENT',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      providerRefId: `live_ref_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    };

    set((state) => ({
      commDeliveryLogs: [newLog, ...state.commDeliveryLogs]
    }));

    // Simulate instant delivery acknowledgement
    setTimeout(() => {
      set((state) => ({
        commDeliveryLogs: state.commDeliveryLogs.map(l => 
          l.id === newLog.id ? { ...l, status: 'DELIVERED' } : l
        )
      }));
    }, 1200);

    return newLog;
  },

  // Central Platform Super Admin Implementation
  platformTenants: initialPlatformTenants,
  supportTickets: initialSupportTickets,
  procurementItems: initialProcurementItems,
  activeSubscriptionPlan: 'ENTERPRISE',

  setActiveSubscriptionPlan: (plan) => set({ activeSubscriptionPlan: plan }),

  provisionNewTenant: (payload) => {
    const newId = `TEN-2026-${String(Math.floor(10 + Math.random() * 90)).padStart(3, '0')}`;
    const newTenant: PlatformTenant = {
      id: newId,
      name: payload.name,
      type: payload.type,
      state: payload.state,
      city: payload.city,
      plan: payload.plan,
      status: 'ACTIVE',
      studentCount: 0,
      staffCount: 0,
      mrrAmount: payload.plan === 'ENTERPRISE' ? 120000 : payload.plan === 'PRO' ? 70000 : 35000,
      renewalDate: '2027-11-04',
      chairmanEmail: `admin@${payload.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.edu.in`,
      activeCampuses: 1,
      consentSupportActive: false
    };

    const activationLink = `https://education-erp-nine.vercel.app/claim-institution?token=act_${Math.random().toString(36).substring(2, 15)}&tenant=${newId}`;

    set((state) => ({
      platformTenants: [newTenant, ...state.platformTenants]
    }));

    return {
      tenant: newTenant,
      activationLink
    };
  },

  approveSupportAccess: (ticketId, approvedBy) => {
    const ticket = get().supportTickets.find(t => t.id === ticketId);
    if (!ticket) return { success: false, message: 'Ticket not found.' };

    const expiresAt = new Date(Date.now() + ticket.requestedDurationHours * 3600 * 1000).toLocaleTimeString();

    set((state) => ({
      supportTickets: state.supportTickets.map(t => 
        t.id === ticketId 
          ? { ...t, status: 'APPROVED_ACTIVE', approvedByChairman: approvedBy, expiresAt } 
          : t
      ),
      platformTenants: state.platformTenants.map(tn => 
        tn.id === ticket.tenantId ? { ...tn, consentSupportActive: true } : tn
      )
    }));

    return {
      success: true,
      message: `Consent granted by ${approvedBy}. Scoped support access is active for ${ticket.requestedDurationHours} hours (Expires: ${expiresAt}).`
    };
  },

  revokeSupportAccess: (ticketId) => {
    const ticket = get().supportTickets.find(t => t.id === ticketId);
    set((state) => ({
      supportTickets: state.supportTickets.map(t => 
        t.id === ticketId ? { ...t, status: 'EXPIRED' } : t
      ),
      platformTenants: state.platformTenants.map(tn => 
        ticket && tn.id === ticket.tenantId ? { ...tn, consentSupportActive: false } : tn
      )
    }));
  },

  // Exam Wizard & Marks Workflow Implementation
  createExamViaWizard: (payload) => {
    const newExamId = `exam-${String(Math.floor(100 + Math.random() * 900))}`;
    const newExam: DemoExam = {
      id: newExamId,
      title: payload.name,
      code: `EXAM-${new Date().getFullYear()}-${payload.name.substring(0, 4).toUpperCase()}`,
      academic_year: payload.academicYear,
      target_level: payload.programmeOrClass.includes('PU') ? 'PU College' : 'School',
      class_name: payload.programmeOrClass,
      category: payload.category,
      exam_mode: payload.deliveryMode,
      question_paper_attached: true,
      status: 'CONTROLLER_VERIFIED',
      instructions: payload.instructions,
      schedules: payload.subjects.map((s, idx) => ({
        id: `sch-${newExamId}-${idx + 1}`,
        subject: s.subjectName,
        exam_date: s.examDate,
        start_time: '09:30 AM',
        end_time: '12:30 PM',
        room: s.room,
        invigilator: s.invigilator,
        theory_max: s.theoryMarks,
        practical_max: s.practicalMarks,
        passing_marks: s.passMarks
      }))
    };

    set((state) => ({
      exams: [newExam, ...state.exams]
    }));

    return {
      success: true,
      exam: newExam
    };
  },

  updateStudentExamMarks: (examId, studentId, marksObtained, status) => {
    set((state) => ({
      marks: state.marks.map(m => 
        m.exam_id === examId && m.student_id === studentId 
          ? { ...m, marks_obtained: marksObtained, is_absent: status === 'ABSENT' } 
          : m
      )
    }));
  },

  advanceExamApprovalStage: (examId) => {
    const exam = get().exams.find(e => e.id === examId);
    if (!exam) return { currentStage: 'NOT_FOUND', published: false };

    let nextStatus: DemoExam['status'] = exam.status;
    let published = false;

    if (exam.status === 'TEACHER_DRAFT') {
      nextStatus = 'CONTROLLER_VERIFIED';
    } else if (exam.status === 'CONTROLLER_VERIFIED') {
      nextStatus = 'PRINCIPAL_APPROVED';
    } else if (exam.status === 'PRINCIPAL_APPROVED') {
      nextStatus = 'RESULT_PUBLISHED';
      published = true;
    }

    set((state) => ({
      exams: state.exams.map(e => e.id === examId ? { ...e, status: nextStatus } : e)
    }));

    return {
      currentStage: nextStatus,
      published
    };
  },
'''

anchor2 = "executeMigrationBatch: (batchId) => {"
if anchor2 in text:
    # insert before the executeMigrationBatch function
    text = text.replace(anchor2, impl_to_add + "\n  " + anchor2)
    print("Added implementation to useDemoStore")
else:
    print("Could not find anchor2 in useDemoStore")
    sys.exit(1)

with open('apps/web/src/store/demoStore.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Step 3 complete.")
