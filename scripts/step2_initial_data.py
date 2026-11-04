import sys

with open('apps/web/src/store/demoStore.ts', 'r', encoding='utf-8') as f:
    text = f.read()

initial_data_to_add = '''
// ============================================================================
// INITIAL SEED DATA FOR LABS, COMMUNICATIONS & PLATFORM SUPER ADMIN
// ============================================================================

export const initialLaboratories: LaboratoryModel[] = [
  {
    id: 'LAB-PHY-01',
    name: 'Sir C.V. Raman Advanced Physics Laboratory',
    type: 'PHYSICS',
    campus: 'Main Bengaluru Campus',
    building: 'Science & Technology Block',
    floor: '2nd Floor',
    roomNumber: 'ST-204',
    inChargeName: 'Dr. V. Murthy (PhD, Optics)',
    assignedTeachers: ['Dr. V. Murthy', 'Prof. Arvind K.'],
    labAssistants: ['K. Suresh (Senior Lab Tech)'],
    capacity: 40,
    totalItems: 28,
    inventoryValue: 485000,
    lowStockCount: 2,
    maintenanceCount: 1,
    safetyTier: 'Tier 2 (High Voltage & Laser Guarded)'
  },
  {
    id: 'LAB-CHEM-01',
    name: 'P.C. Ray Chemistry & Chemical Research Lab',
    type: 'CHEMISTRY',
    campus: 'Main Bengaluru Campus',
    building: 'Science & Technology Block',
    floor: '1st Floor',
    roomNumber: 'ST-108',
    inChargeName: 'Prof. S. Joshi (MSc Organic Chem)',
    assignedTeachers: ['Prof. S. Joshi', 'Dr. Meera N.'],
    labAssistants: ['R. Manjunath', 'L. Venkatesh'],
    capacity: 40,
    totalItems: 46,
    inventoryValue: 395000,
    lowStockCount: 3,
    maintenanceCount: 1,
    safetyTier: 'Tier 3 (Fume Hoods, Acid Neutralizers, Eye Wash)'
  },
  {
    id: 'LAB-BIO-01',
    name: 'Jagadish Chandra Bose Biology & Biotech Lab',
    type: 'BIOLOGY',
    campus: 'Main Bengaluru Campus',
    building: 'Life Sciences Wing',
    floor: '3rd Floor',
    roomNumber: 'LS-301',
    inChargeName: 'Dr. Anita Deshmukh (PhD Cytology)',
    assignedTeachers: ['Dr. Anita Deshmukh', 'Prof. Kavitha S.'],
    labAssistants: ['B. Ramesh'],
    capacity: 35,
    totalItems: 34,
    inventoryValue: 420000,
    lowStockCount: 0,
    maintenanceCount: 1,
    safetyTier: 'Tier 1 (Autoclaved & Bio-hazard Specimen Safe)'
  },
  {
    id: 'LAB-CS-01',
    name: 'Alan Turing Computer Science & AI Lab',
    type: 'COMPUTER',
    campus: 'Main Bengaluru Campus',
    building: 'Computing Centre',
    floor: 'Ground Floor',
    roomNumber: 'CC-02',
    inChargeName: 'Prof. Rajeshwari Patil (M.Tech CSE)',
    assignedTeachers: ['Prof. Rajeshwari Patil', 'Srikanth R.'],
    labAssistants: ['Girish Gowda (Network Admin)'],
    capacity: 60,
    totalItems: 65,
    inventoryValue: 1250000,
    lowStockCount: 0,
    maintenanceCount: 0,
    safetyTier: 'Tier 1 (Air-Conditioned & Dual UPS Protected)'
  },
  {
    id: 'LAB-ELEC-01',
    name: 'Nikola Tesla Electronics & IoT Workbench',
    type: 'ELECTRONICS',
    campus: 'Main Bengaluru Campus',
    building: 'Science & Technology Block',
    floor: '2nd Floor',
    roomNumber: 'ST-210',
    inChargeName: 'Er. Sandeep Hegde (M.Tech VLSI)',
    assignedTeachers: ['Er. Sandeep Hegde'],
    labAssistants: ['Mahesh K.'],
    capacity: 30,
    totalItems: 22,
    inventoryValue: 340000,
    lowStockCount: 1,
    maintenanceCount: 0,
    safetyTier: 'Tier 2 (ESD Safe Benches, Circuit Breakers)'
  }
];

export const initialLabInventory: LabInventoryItem[] = [
  {
    id: 'ITEM-PHY-101',
    name: 'Compound Binocular Optical Microscope 1000x',
    labId: 'LAB-PHY-01',
    category: 'REUSABLE_EQUIPMENT',
    storageLocation: 'Cabinet A, Shelf 1',
    unit: 'Units',
    currentStock: 18,
    minStockLevel: 5,
    unitPrice: 16500,
    totalValue: 297000,
    manufacturer: 'Olympus Scientific India',
    supplier: 'Karnataka Scientific Suppliers, Bengaluru',
    batchNumber: 'OLY-2025-BATCH-4',
    purchaseDate: '2025-06-12',
    condition: 'OPERATIONAL',
    qrCodeValue: 'EDU-LAB-QR-PHY-101',
    safetyClassification: 'General Optical Instrument',
    lastVerifiedDate: '2026-10-25'
  },
  {
    id: 'ITEM-PHY-102',
    name: 'Sodium Vapour Lamp Setup with Optical Bench & Slits',
    labId: 'LAB-PHY-01',
    category: 'REUSABLE_EQUIPMENT',
    storageLocation: 'Bench Station 4',
    unit: 'Sets',
    currentStock: 6,
    minStockLevel: 2,
    unitPrice: 12000,
    totalValue: 72000,
    manufacturer: 'Labtronics India',
    supplier: 'Precision Scientific instruments',
    batchNumber: 'LTI-SOD-2024',
    purchaseDate: '2024-09-10',
    condition: 'CALIBRATION_DUE',
    qrCodeValue: 'EDU-LAB-QR-PHY-102',
    safetyClassification: 'High Voltage Arc Hazard',
    lastVerifiedDate: '2026-10-15'
  },
  {
    id: 'ITEM-CHEM-201',
    name: 'Concentrated Hydrochloric Acid (HCl 37% AR Grade)',
    labId: 'LAB-CHEM-01',
    category: 'HAZARDOUS_MATERIAL',
    storageLocation: 'Fume Hood Acid Locker #3',
    unit: 'Bottles (500ml)',
    currentStock: 4,
    minStockLevel: 8, // Low Stock Alert
    unitPrice: 450,
    totalValue: 1800,
    manufacturer: 'Merck Life Science Pvt Ltd',
    supplier: 'Apex Chemical Distributors, Malleshwaram',
    batchNumber: 'MRC-HCL-8921B',
    purchaseDate: '2026-02-14',
    expiryDate: '2028-02-14',
    condition: 'OPERATIONAL',
    qrCodeValue: 'EDU-LAB-QR-CHEM-201',
    safetyClassification: 'Class 8 Corrosive • Mandatory Gloves & Goggles',
    lastVerifiedDate: '2026-11-01'
  },
  {
    id: 'ITEM-CHEM-202',
    name: 'Potassium Permanganate Crystals (KMnO4 99.5% Pure)',
    labId: 'LAB-CHEM-01',
    category: 'CONSUMABLE_CHEMICAL',
    storageLocation: 'Reagent Shelf C-4',
    unit: 'Bottles (500g)',
    currentStock: 12,
    minStockLevel: 4,
    unitPrice: 620,
    totalValue: 7440,
    manufacturer: 'SD Fine-Chem Limited',
    supplier: 'Apex Chemical Distributors',
    batchNumber: 'SDF-KMN-2025',
    purchaseDate: '2025-11-20',
    expiryDate: '2029-11-20',
    condition: 'OPERATIONAL',
    qrCodeValue: 'EDU-LAB-QR-CHEM-202</td>',
    safetyClassification: 'Oxidizing Agent Class 5.1',
    lastVerifiedDate: '2026-10-28'
  },
  {
    id: 'ITEM-CHEM-203',
    name: 'Borosilicate Glass Burette 50ml with PTFE Stopcock',
    labId: 'LAB-CHEM-01',
    category: 'GLASSWARE',
    storageLocation: 'Glassware Rack 2',
    unit: 'Units',
    currentStock: 45,
    minStockLevel: 15,
    unitPrice: 380,
    totalValue: 17100,
    manufacturer: 'Borosil Scientific',
    supplier: 'National Lab Glassware',
    batchNumber: 'BOR-50ML-2025',
    purchaseDate: '2025-08-10',
    condition: 'OPERATIONAL',
    qrCodeValue: 'EDU-LAB-QR-CHEM-203',
    safetyClassification: 'Fragile Borosilicate Glass',
    lastVerifiedDate: '2026-10-30'
  },
  {
    id: 'ITEM-BIO-301',
    name: 'Permanent Mitosis in Onion Root Tip Microscope Slides',
    labId: 'LAB-BIO-01',
    category: 'REUSABLE_EQUIPMENT',
    storageLocation: 'Slide Box Alpha',
    unit: 'Slide Sets',
    currentStock: 25,
    minStockLevel: 10,
    unitPrice: 850,
    totalValue: 21250,
    manufacturer: 'Bio-Visual Preparations',
    supplier: 'Karnataka Scientific Suppliers',
    batchNumber: 'BVP-ROOT-2026',
    purchaseDate: '2026-01-08',
    condition: 'OPERATIONAL',
    qrCodeValue: 'EDU-LAB-QR-BIO-301',
    safetyClassification: 'Preserved Histological Specimen',
    lastVerifiedDate: '2026-10-22'
  },
  {
    id: 'ITEM-CS-401',
    name: 'Dell OptiPlex 7010 Desktop (i7-13700, 32GB RAM, 1TB SSD)',
    labId: 'LAB-CS-01',
    category: 'COMPUTING_HARDWARE',
    storageLocation: 'Workstations 01 to 30',
    unit: 'Workstations',
    currentStock: 30,
    minStockLevel: 5,
    unitPrice: 65000,
    totalValue: 1950000,
    manufacturer: 'Dell Technologies',
    supplier: 'Compunet Systems India',
    batchNumber: 'DELL-OPT-2025-Q3',
    purchaseDate: '2025-07-01',
    condition: 'OPERATIONAL',
    qrCodeValue: 'EDU-LAB-QR-CS-401',
    safetyClassification: 'Electronic IT Hardware',
    lastVerifiedDate: '2026-11-02'
  }
];

export const initialLabMovements: LabStockMovement[] = [
  {
    id: 'MOV-2026-0041',
    itemId: 'ITEM-CHEM-201',
    itemName: 'Concentrated Hydrochloric Acid (HCl 37%)',
    type: 'CONSUMPTION',
    quantity: 2,
    unit: 'Bottles (500ml)',
    performedBy: 'R. Manjunath (Lab Asst)',
    requestedBy: 'Prof. S. Joshi',
    purpose: 'PU II Section A Chemistry Practical: Salt Analysis & Titration',
    timestamp: '2026-11-04 10:15 AM',
    balanceAfter: 4
  },
  {
    id: 'MOV-2026-0040',
    itemId: 'ITEM-PHY-101',
    itemName: 'Compound Binocular Optical Microscope 1000x',
    type: 'ISSUE',
    quantity: 12,
    unit: 'Units',
    performedBy: 'K. Suresh (Senior Lab Tech)',
    requestedBy: 'Dr. Anita Deshmukh',
    purpose: 'Class XII Biology Cytology Practical Session',
    timestamp: '2026-11-04 09:00 AM',
    balanceAfter: 6
  },
  {
    id: 'MOV-2026-0039',
    itemId: 'ITEM-PHY-101',
    itemName: 'Compound Binocular Optical Microscope 1000x',
    type: 'RETURN',
    quantity: 12,
    unit: 'Units',
    performedBy: 'K. Suresh',
    requestedBy: 'Dr. Anita Deshmukh',
    purpose: 'Post-Practical Custody Inspection - All Units Clean & Operational',
    timestamp: '2026-11-04 11:30 AM',
    balanceAfter: 18
  }
];

export const initialLabExperiments: LabExperiment[] = [
  {
    id: 'EXP-PHY-01',
    subject: 'Physics',
    title: 'Verification of Ohm\\'s Law & Resistance per cm of Given Wire',
    classGroup: 'I PUC - Science (PCMB)',
    requiredMaterials: ['Voltmeter (0-3V)', 'Ammeter (0-1.5A)', 'Rheostat 50 Ohm', 'Battery Eliminator', 'Connecting Wires'],
    scheduleDate: '2026-11-06 09:30 AM',
    status: 'SCHEDULED',
    teacherName: 'Dr. V. Murthy'
  },
  {
    id: 'EXP-CHEM-01',
    subject: 'Chemistry',
    title: 'Titration of Standard Oxalic Acid with Potassium Permanganate (KMnO4)',
    classGroup: 'II PUC - Science (PCMB/PCMC)',
    requiredMaterials: ['Borosilicate Burette 50ml', 'Pipette 20ml', 'KMnO4 0.02M', 'Oxalic Acid 0.05M', 'Dilute H2SO4'],
    scheduleDate: '2026-11-07 10:00 AM',
    status: 'SCHEDULED',
    teacherName: 'Prof. S. Joshi'
  },
  {
    id: 'EXP-BIO-01',
    subject: 'Biology',
    title: 'Preparation & Microscopic Study of Temporary Mount of Onion Root Tip',
    classGroup: 'I PUC - Biology Batch B',
    requiredMaterials: ['Compound Microscopes', 'Acetocarmine Stain', 'Watch Glasses', 'Filter Paper', 'Glass Slides & Coverslips'],
    scheduleDate: '2026-11-05 02:00 PM',
    status: 'COMPLETED',
    teacherName: 'Dr. Anita Deshmukh'
  }
];

export const initialCommChannels: CommunicationChannelConfig[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Business Cloud API (Official Meta Platform)',
    isEnabled: true,
    status: 'CONNECTED',
    lastPingTime: '2 mins ago (Latency: 124ms)',
    credentials: {
      phoneNumberId: '109283746152840',
      wabaId: 'waba_99281734_akshara',
      accessToken: 'EAAG9...[Meta System Token Verified]',
      webhookVerifyToken: 'akshara_wh_token_2026_secure'
    }
  },
  {
    id: 'telegram',
    name: 'Telegram Bot API (@AksharaGlobal_Bot)',
    isEnabled: true,
    status: 'CONNECTED',
    lastPingTime: '5 mins ago (Latency: 88ms)',
    credentials: {
      botToken: '7182940215:AAH47q9xL1-zYk98V2b...[Verified Active]',
      botUsername: '@AksharaGlobal_Bot',
      targetChannelOrChatId: '@akshara_official_alerts'
    }
  },
  {
    id: 'sms',
    name: 'National DLT SMS Gateway (Textlocal / Kaleyra)',
    isEnabled: true,
    status: 'CONNECTED',
    lastPingTime: '10 mins ago',
    credentials: {
      senderId: 'AKSHRA',
      apiKey: 'tx_live_891723...[DLT Principal ID 110156]'
    }
  },
  {
    id: 'email',
    name: 'Institutional Transactional Email (Amazon SES)',
    isEnabled: true,
    status: 'CONNECTED',
    lastPingTime: '1 min ago',
    credentials: {
      smtpHost: 'email-smtp.ap-south-1.amazonaws.com',
      smtpUser: 'AKIA...[DKIM & SPF Verified]'
    }
  }
];

export const initialCommTemplates: CommunicationTemplate[] = [
  {
    id: 'TMPL-WH-EXAM-EN',
    eventTrigger: 'EXAM_TIMETABLE',
    title: 'Exam Schedule Publication Notice',
    language: 'EN',
    channel: 'whatsapp',
    content: 'Dear {{parent_name}}, the official timetable for {{exam_name}} (Academic Year {{academic_year}}) for your ward {{student_name}} (Class: {{class_name}}) has been published. Exams commence on {{start_date}}. View full schedule and download hall ticket at: {{portal_url}} - Akshara Global Campus.',
    placeholders: ['parent_name', 'exam_name', 'academic_year', 'student_name', 'class_name', 'start_date', 'portal_url'],
    providerApproved: true
  },
  {
    id: 'TMPL-WH-EXAM-KN',
    eventTrigger: 'EXAM_TIMETABLE',
    title: 'ಪರೀಕ್ಷಾ ವೇಳಾಪಟ್ಟಿ ಪ್ರಕಟಣೆ (Kannada)',
    language: 'KN',
    channel: 'whatsapp',
    content: 'ಗೌರವಾನ್ವಿತ {{parent_name}} ಅವರೇ, ನಿಮ್ಮ ಮಗು {{student_name}} (ತರಗತಿ: {{class_name}}) ಅವರ {{exam_name}} ವೇಳಾಪಟ್ಟಿ ಪ್ರಕಟಿಸಲಾಗಿದೆ. ಪರೀಕ್ಷೆಗಳು {{start_date}} ರಂದು ಪ್ರಾರಂಭವಾಗುತ್ತವೆ. ಪೂರ್ಣ ವೇಳಾಪಟ್ಟಿಯನ್ನು ಇಲ್ಲಿ ವೀಕ್ಷಿಸಿ: {{portal_url}} - ಅಕ್ಷರ ಗ್ಲೋಬಲ್ ಶಿಕ್ಷಣ ಸಂಸ್ಥೆ.',
    placeholders: ['parent_name', 'student_name', 'class_name', 'exam_name', 'start_date', 'portal_url'],
    providerApproved: true
  },
  {
    id: 'TMPL-WH-FEE-EN',
    eventTrigger: 'FEE_RECEIPT',
    title: 'Instant Fee Payment Receipt & Confirmation',
    language: 'EN',
    channel: 'whatsapp',
    content: 'Namaste {{parent_name}}, thank you for the payment of ₹{{amount_paid}} towards {{fee_heads}} for {{student_name}} (Adm: {{admission_no}}). Receipt No: {{receipt_no}} has been generated. Download authenticated receipt: {{receipt_link}}. Remaining Due Balance: ₹{{balance_due}}. - Accounts Dept, Akshara Global.',
    placeholders: ['parent_name', 'amount_paid', 'fee_heads', 'student_name', 'admission_no', 'receipt_no', 'receipt_link', 'balance_due'],
    providerApproved: true
  },
  {
    id: 'TMPL-TG-ABSENT-EN',
    eventTrigger: 'ATTENDANCE_ABSENT',
    title: 'Immediate Daily Absence Notification',
    language: 'EN',
    channel: 'telegram',
    content: '🔴 ATTENDANCE ALERT: Your ward {{student_name}} (Class {{class_name}}, Roll {{roll_no}}) is marked ABSENT today ({{current_date}}) during morning roll call. If this is unscheduled, please contact the Principal / Class Teacher immediately at {{contact_phone}}.',
    placeholders: ['student_name', 'class_name', 'roll_no', 'current_date', 'contact_phone'],
    providerApproved: true
  }
];

export const initialCommDeliveryLogs: CommunicationDeliveryLog[] = [
  {
    id: 'LOG-MSG-9901',
    recipientName: 'Ramesh Kumar',
    recipientContact: '+91 98450 12345',
    recipientRole: 'PARENT',
    channel: 'whatsapp',
    eventTrigger: 'FEE_RECEIPT',
    messageText: 'Payment of ₹50,000 confirmed for Rahul Kumar. Receipt REC-2026-00125 generated. Download: https://education-erp-nine.vercel.app/receipts/REC-2026-00125.pdf',
    status: 'READ',
    timestamp: '2026-11-04 11:42 AM',
    providerRefId: 'wamid.HBgLOTE5ODQ1MDEyMzQ1FQIAERgSMzQ5RT...[Verified by Meta]'
  },
  {
    id: 'LOG-MSG-9902',
    recipientName: 'Suresh Hegde',
    recipientContact: '+91 94480 87654',
    recipientRole: 'PARENT',
    channel: 'whatsapp',
    eventTrigger: 'EXAM_TIMETABLE',
    messageText: 'Timetable published for Unit Test 1 (Class I PUC PCMB). Ananya Hegde schedule verified. View portal link.',
    status: 'DELIVERED',
    timestamp: '2026-11-04 10:30 AM',
    providerRefId: 'wamid.HBgLOTE5NDQ4MDg3NjU0FQIAERgSODE2OT...[Delivered]'
  },
  {
    id: 'LOG-MSG-9903',
    recipientName: 'Class XII Physics Faculty & Students',
    recipientContact: '@akshara_official_alerts',
    recipientRole: 'STUDENT',
    channel: 'telegram',
    eventTrigger: 'PRACTICAL_SCHEDULE',
    messageText: 'Notice: Physics Practical Session on Optical Bench & Lenses scheduled tomorrow 9:30 AM in Raman Lab ST-204.',
    status: 'SENT',
    timestamp: '2026-11-04 09:15 AM',
    providerRefId: 'tg_msg_id_8912746'
  }
];

export const initialPlatformTenants: PlatformTenant[] = [
  {
    id: 'TEN-2026-001',
    name: 'Akshara Global Composite School & PU College',
    type: 'COMPOSITE_GROUP',
    state: 'Karnataka',
    city: 'Bengaluru',
    plan: 'ENTERPRISE',
    status: 'ACTIVE',
    studentCount: 3450,
    staffCount: 184,
    mrrAmount: 95000,
    renewalDate: '2027-08-31',
    chairmanEmail: 'chairman@akshara.edu.in',
    activeCampuses: 3,
    customDomain: 'erp.akshara.edu.in',
    consentSupportActive: false
  },
  {
    id: 'TEN-2026-002',
    name: 'Vishwa Vidyanikethan Public School',
    type: 'SCHOOL',
    state: 'Karnataka',
    city: 'Mysuru',
    plan: 'STANDARD',
    status: 'ACTIVE',
    studentCount: 1820,
    staffCount: 92,
    mrrAmount: 45000,
    renewalDate: '2027-05-15',
    chairmanEmail: 'director@vidyanikethan.org',
    activeCampuses: 1,
    consentSupportActive: false
  },
  {
    id: 'TEN-2026-003',
    name: 'Sri Chaitanya National Pre-University College',
    type: 'PU_COLLEGE',
    state: 'Telangana',
    city: 'Hyderabad',
    plan: 'ENTERPRISE',
    status: 'ACTIVE',
    studentCount: 5200,
    staffCount: 260,
    mrrAmount: 140000,
    renewalDate: '2027-11-30',
    chairmanEmail: 'mgmt@chaitanyapuc.edu',
    activeCampuses: 4,
    consentSupportActive: false
  },
  {
    id: 'TEN-2026-004',
    name: 'Apex Institute of Science & Degree Commerce',
    type: 'DEGREE_COLLEGE',
    state: 'Maharashtra',
    city: 'Pune',
    plan: 'PRO',
    status: 'ACTIVE',
    studentCount: 2900,
    staffCount: 140,
    mrrAmount: 75000,
    renewalDate: '2027-04-30',
    chairmanEmail: 'principal@apexdegree.ac.in',
    activeCampuses: 2,
    consentSupportActive: false
  },
  {
    id: 'TEN-2026-005',
    name: 'Greenfield International Cambridge Academy',
    type: 'SCHOOL',
    state: 'Tamil Nadu',
    city: 'Chennai',
    plan: 'ENTERPRISE',
    status: 'TRIAL',
    studentCount: 850,
    staffCount: 65,
    mrrAmount: 0,
    renewalDate: '2026-11-20',
    chairmanEmail: 'founder@greenfield.edu',
    activeCampuses: 1,
    consentSupportActive: false
  }
];

export const initialSupportTickets: TechnicalSupportTicket[] = [
  {
    id: 'TKT-8902',
    tenantId: 'TEN-2026-001',
    tenantName: 'Akshara Global Composite School',
    category: 'DATABASE_MIGRATION',
    requestedScope: 'DIAGNOSTICS_ONLY',
    requestedDurationHours: 4,
    status: 'PENDING_INSTITUTION_APPROVAL',
    requestedAt: '2026-11-04 11:00 AM'
  },
  {
    id: 'TKT-8899',
    tenantId: 'TEN-2026-003',
    tenantName: 'Sri Chaitanya National PU College',
    category: 'WHATSAPP_INTEGRATION',
    requestedScope: 'CONFIG_INSPECTION',
    requestedDurationHours: 2,
    status: 'APPROVED_ACTIVE',
    requestedAt: '2026-11-04 09:30 AM',
    approvedByChairman: 'Dr. B.S. Rao (Chairman)',
    expiresAt: '2026-11-04 01:30 PM'
  }
];

export const initialProcurementItems: PlatformProcurementItem[] = [
  {
    id: 'PROC-01',
    serviceCategory: 'Cloud Virtual Servers & MicroVM Sandbox',
    vendor: 'Amazon Web Services (AWS Mumbai ap-south-1)',
    monthlyCost: 82000,
    status: 'PRODUCTION_ACTIVE',
    renewalDate: '2026-11-30'
  },
  {
    id: 'PROC-02',
    serviceCategory: 'WhatsApp Business Cloud API Messaging Gateway',
    vendor: 'Meta Platforms Inc. / WhatsApp Cloud Graph API',
    monthlyCost: 34500,
    status: 'PRODUCTION_ACTIVE',
    renewalDate: '2026-11-30'
  },
  {
    id: 'PROC-03',
    serviceCategory: 'Managed High-Availability PostgreSQL 16 Cluster',
    vendor: 'Supabase / AWS RDS Multi-AZ PostgreSQL',
    monthlyCost: 48000,
    status: 'PRODUCTION_ACTIVE',
    renewalDate: '2026-12-15'
  },
  {
    id: 'PROC-04',
    serviceCategory: 'Edge CDN, DDoS Shield & SSL WAF Protection',
    vendor: 'Cloudflare Inc. (Enterprise Edge)',
    monthlyCost: 25000,
    status: 'PRODUCTION_ACTIVE',
    renewalDate: '2027-01-01'
  },
  {
    id: 'PROC-05',
    serviceCategory: 'Institutional Payment Gateway (UPI / NetBanking)',
    vendor: 'Razorpay Software Private Limited',
    monthlyCost: 15000,
    status: 'PRODUCTION_ACTIVE',
    renewalDate: '2027-06-30'
  }
];
'''

# Find insertion anchor
anchor = "const initialStudents: DemoStudent[] = ["
if anchor in text:
    text = text.replace(anchor, initial_data_to_add + "\n" + anchor)
    print("Inserted initial data before initialStudents")
else:
    print("Could not find initialStudents anchor")
    sys.exit(1)

with open('apps/web/src/store/demoStore.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Step 2 complete.")
