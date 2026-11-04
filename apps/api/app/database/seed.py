import uuid
from typing import List, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.modules.tenants.models import Tenant, Campus
from app.modules.identity.models import User, Role, Permission, UserRole, role_permissions
from app.modules.subscriptions.models import (
    FeatureCatalog,
    SubscriptionPlan,
    PlanFeature
)

# Standard Platform Features Registry
FEATURE_DEFINITIONS: List[Dict[str, Any]] = [
    {"id": "admissions.basic", "name": "Basic Admissions", "module": "admissions", "category": "Core", "description": "Enquiry & Application management", "min_plan_tier": 1},
    {"id": "students.management", "name": "Student Information System", "module": "students", "category": "Core", "description": "Profiles, guardians, enrollments", "min_plan_tier": 1},
    {"id": "fees.basic", "name": "Basic Fee Management", "module": "fees", "category": "Core", "description": "Fee structures, invoicing, cash/UPI receipts", "min_plan_tier": 1},
    {"id": "fees.advanced", "name": "Advanced Fees & Gateway", "module": "fees", "category": "Finance", "description": "Online payment gateway, automated receipts, refunds", "min_plan_tier": 3},
    {"id": "attendance.basic", "name": "Daily Attendance", "module": "attendance", "category": "Core", "description": "Student & staff daily attendance", "min_plan_tier": 1},
    {"id": "attendance.biometric", "name": "Biometric Attendance Sync", "module": "attendance", "category": "Advanced", "description": "Biometric device integration", "min_plan_tier": 4},
    {"id": "examinations.basic", "name": "Examinations & Marks", "module": "examinations", "category": "Core", "description": "Exams, marks entry, report cards", "min_plan_tier": 1},
    {"id": "examinations.advanced", "name": "Advanced Grading & Ranks", "module": "examinations", "category": "Academics", "description": "University grading, credits, backlogs, revaluation", "min_plan_tier": 3},
    {"id": "analytics.basic", "name": "Basic Reports & Excel Export", "module": "reports", "category": "Reporting", "description": "Class performance, collection reports", "min_plan_tier": 1},
    {"id": "analytics.advanced", "name": "Advanced Multi-Campus Analytics", "module": "reports", "category": "Reporting", "description": "Comparative dashboards, trend metrics", "min_plan_tier": 4},
    {"id": "analytics.ai_reports", "name": "AI Performance Analytics", "module": "analytics", "category": "AI", "description": "AI-powered student risk and forecasting insights", "min_plan_tier": 5},
    {"id": "communication.email", "name": "Email Notifications", "module": "communication", "category": "Communication", "description": "Email announcements and circulars", "min_plan_tier": 1},
    {"id": "communication.sms", "name": "SMS Alerts", "module": "communication", "category": "Communication", "description": "Automated SMS fee reminders and alerts", "min_plan_tier": 2},
    {"id": "communication.whatsapp", "name": "WhatsApp Automation", "module": "communication", "category": "Communication", "description": "Official WhatsApp Business API notifications", "min_plan_tier": 4},
    {"id": "parent.portal", "name": "Parent Portal & App", "module": "portals", "category": "Portals", "description": "Dedicated parent progress and fee access", "min_plan_tier": 2},
    {"id": "student.portal", "name": "Student Portal & App", "module": "portals", "category": "Portals", "description": "Student academic and timetable access", "min_plan_tier": 2},
    {"id": "offline.sync", "name": "Offline PWA & Mobile Sync", "module": "offline", "category": "Platform", "description": "True offline operation with sync queue", "min_plan_tier": 2},
    {"id": "custom_branding", "name": "White-Label Institution Branding", "module": "branding", "category": "White-Label", "description": "Custom logo, colors, and report cards", "min_plan_tier": 2},
    {"id": "custom_domain", "name": "Custom Domain Mapping", "module": "branding", "category": "White-Label", "description": "Connect school's own domain name", "min_plan_tier": 3},
    {"id": "multi_campus", "name": "Multi-Campus Management", "module": "tenants", "category": "Enterprise", "description": "Manage multiple branches under one organization", "min_plan_tier": 4},
    {"id": "library.management", "name": "Library Management", "module": "library", "category": "Operations", "description": "Book catalog, issues, returns, barcode", "min_plan_tier": 3},
    {"id": "transport.management", "name": "Transport & Route Tracking", "module": "transport", "category": "Operations", "description": "Vehicles, routes, stops, transport fees", "min_plan_tier": 3},
    {"id": "hostel.management", "name": "Hostel Management", "module": "hostel", "category": "Operations", "description": "Rooms, bed allocations, hostel fees", "min_plan_tier": 3},
    {"id": "hr.payroll", "name": "Staff HR & Payroll", "module": "hr", "category": "Operations", "description": "Employee directory, leaves, salary, payslips", "min_plan_tier": 3},
    {"id": "advanced_exports", "name": "Custom Data Exports", "module": "reports", "category": "Data", "description": "Automated CSV/Excel/PDF batch exports", "min_plan_tier": 3},
    {"id": "api.integrations", "name": "REST API Integrations", "module": "platform", "category": "Enterprise", "description": "Webhooks and programmatic API access", "min_plan_tier": 4},
    {"id": "dedicated_database", "name": "Dedicated Isolated Database", "module": "infrastructure", "category": "Enterprise", "description": "Physical database isolation for high compliance", "min_plan_tier": 5},
    {"id": "white_label_android", "name": "Branded Android Play Store App", "module": "mobile", "category": "White-Label", "description": "Separately packaged mobile app in store", "min_plan_tier": 5},
]

# Standard Subscription Plans
PLAN_DEFINITIONS: List[Dict[str, Any]] = [
    {
        "code": "TRIAL",
        "name": "Free Trial",
        "tier": 0,
        "description": "30-day evaluation trial with basic school features",
        "price_monthly_inr": 0.0,
        "price_annual_inr": 0.0,
        "max_students": 100,
        "max_staff": 15,
        "max_campuses": 1,
        "max_storage_mb": 1000,
        "tier_features_up_to": 1
    },
    {
        "code": "STARTER",
        "name": "Starter Plan",
        "tier": 1,
        "description": "Ideal for small schools and institutes up to 300 students",
        "price_monthly_inr": 999.0,
        "price_annual_inr": 9999.0,
        "max_students": 300,
        "max_staff": 30,
        "max_campuses": 1,
        "max_storage_mb": 5000,
        "tier_features_up_to": 1
    },
    {
        "code": "STANDARD",
        "name": "Standard Plan",
        "tier": 2,
        "description": "Popular plan for schools up to 750 students with Parent & Student portals",
        "price_monthly_inr": 1999.0,
        "price_annual_inr": 19999.0,
        "max_students": 750,
        "max_staff": 75,
        "max_campuses": 1,
        "max_storage_mb": 15000,
        "tier_features_up_to": 2
    },
    {
        "code": "PROFESSIONAL",
        "name": "Professional Plan",
        "tier": 3,
        "description": "For growing colleges & institutions up to 1,500 students with HR, Library, Transport",
        "price_monthly_inr": 3499.0,
        "price_annual_inr": 34999.0,
        "max_students": 1500,
        "max_staff": 150,
        "max_campuses": 2,
        "max_storage_mb": 35000,
        "tier_features_up_to": 3
    },
    {
        "code": "PREMIUM",
        "name": "Premium Plan",
        "tier": 4,
        "description": "Comprehensive multi-campus suite with WhatsApp, Biometric and Advanced Analytics",
        "price_monthly_inr": 5999.0,
        "price_annual_inr": 59999.0,
        "max_students": 3000,
        "max_staff": 300,
        "max_campuses": 5,
        "max_storage_mb": 100000,
        "tier_features_up_to": 4
    },
    {
        "code": "ENTERPRISE",
        "name": "Enterprise Plan",
        "tier": 5,
        "description": "Unlimited capacity, AI Analytics, White-label Android app and Dedicated DB option",
        "price_monthly_inr": 9999.0,
        "price_annual_inr": 99999.0,
        "max_students": 10000,
        "max_staff": 1000,
        "max_campuses": 20,
        "max_storage_mb": 500000,
        "tier_features_up_to": 5
    }
]

# Standard RBAC Permissions
DEFAULT_PERMISSIONS: List[Dict[str, str]] = [
    # Students & Admissions
    {"code": "students.view", "name": "View Students", "module": "students"},
    {"code": "students.create", "name": "Register Students", "module": "students"},
    {"code": "students.edit", "name": "Edit Students", "module": "students"},
    {"code": "students.archive", "name": "Archive Students", "module": "students"},
    {"code": "admissions.manage", "name": "Manage Admissions", "module": "admissions"},
    
    # Financial Management
    {"code": "fees.view", "name": "View Fee Invoices", "module": "fees"},
    {"code": "fees.collect", "name": "Collect Fee Payments", "module": "fees"},
    {"code": "fees.refund", "name": "Process Fee Refunds", "module": "fees"},
    {"code": "fees.reconcile", "name": "Reconcile Bank & Gateway Statements", "module": "fees"},
    {"code": "fees.configure", "name": "Configure Fee Structures", "module": "fees"},
    
    # Attendance
    {"code": "attendance.mark", "name": "Mark Attendance", "module": "attendance"},
    {"code": "attendance.verify", "name": "Verify Attendance & Biometrics", "module": "attendance"},
    
    # Examinations & Marks Lifecycle
    {"code": "exams.view", "name": "View Examination Schedules & Timetables", "module": "examinations"},
    {"code": "exams.manage", "name": "Configure & Schedule Examinations", "module": "examinations"},
    {"code": "exams.delete", "name": "Delete or Archive Examinations", "module": "examinations"},
    {"code": "marks.enter", "name": "Enter Exam Marks", "module": "examinations"},
    {"code": "marks.verify", "name": "Controller Audit & Verification", "module": "examinations"},
    {"code": "marks.approve", "name": "Principal Official Approval", "module": "examinations"},
    {"code": "marks.publish", "name": "Publish Results to Portals", "module": "examinations"},
    {"code": "marks.export", "name": "Export Report Cards & Ledgers", "module": "examinations"},
    
    # HR & Transport
    {"code": "staff.manage", "name": "Manage Staff Directory", "module": "hr"},
    {"code": "transport.view", "name": "View Transport Routes & Fleet", "module": "transport"},
    {"code": "transport.manage", "name": "Manage Vehicles, Routes & Stops", "module": "transport"},
    {"code": "transport.track", "name": "Live GPS Tracking Telemetry", "module": "transport"},
    
    # Governance & Platform
    {"code": "reports.export", "name": "Generate & Export Reports", "module": "reports"},
    {"code": "settings.branding", "name": "Configure White-Label Branding", "module": "settings"},
    {"code": "permissions.manage", "name": "Super Admin Permission Control", "module": "governance"},
    {"code": "dashboard.design", "name": "Super Admin Dashboard Designer", "module": "governance"},
]


async def seed_initial_data(db: AsyncSession) -> None:
    """Idempotently seed feature catalog, subscription plans, permissions, and superadmin."""
    # 1. Feature Catalog
    for f_def in FEATURE_DEFINITIONS:
        stmt = select(FeatureCatalog).where(FeatureCatalog.id == f_def["id"])
        res = await db.execute(stmt)
        if not res.scalars().first():
            feat = FeatureCatalog(
                id=f_def["id"],
                name=f_def["name"],
                module=f_def["module"],
                category=f_def["category"],
                description=f_def["description"],
                min_plan_tier=f_def["min_plan_tier"],
                default_enabled=True,
                is_addon=False
            )
            db.add(feat)
    await db.flush()

    # 2. Subscription Plans & Plan Features
    for p_def in PLAN_DEFINITIONS:
        stmt = select(SubscriptionPlan).where(SubscriptionPlan.code == p_def["code"])
        res = await db.execute(stmt)
        plan = res.scalars().first()
        if not plan:
            plan = SubscriptionPlan(
                code=p_def["code"],
                name=p_def["name"],
                tier=p_def["tier"],
                description=p_def["description"],
                price_monthly_inr=p_def["price_monthly_inr"],
                price_annual_inr=p_def["price_annual_inr"],
                max_students=p_def["max_students"],
                max_staff=p_def["max_staff"],
                max_campuses=p_def["max_campuses"],
                max_storage_mb=p_def["max_storage_mb"],
                is_active=True
            )
            db.add(plan)
            await db.flush()

            # Attach included features up to tier
            for f_def in FEATURE_DEFINITIONS:
                if f_def["min_plan_tier"] <= p_def["tier_features_up_to"]:
                    pf = PlanFeature(plan_id=plan.id, feature_id=f_def["id"], is_included=True)
                    db.add(pf)
    await db.flush()

    # 3. Permissions
    for p_def in DEFAULT_PERMISSIONS:
        stmt = select(Permission).where(Permission.code == p_def["code"])
        res = await db.execute(stmt)
        if not res.scalars().first():
            perm = Permission(
                code=p_def["code"],
                name=p_def["name"],
                module=p_def["module"],
                description=p_def["name"]
            )
            db.add(perm)
    await db.flush()

    # 4. Global System Roles (Never overwritten during migrations)
    system_roles = [
        ("SUPER_ADMIN", "Platform Super Administrator", True),
        ("INSTITUTION_ADMIN", "Institution Administrator", False),
        ("PRINCIPAL", "Principal / Director", False),
        ("VICE_PRINCIPAL", "Vice Principal", False),
        ("ACCOUNTANT", "Finance and Accounts Officer", False),
        ("EXAM_CONTROLLER", "Examination Controller", False),
        ("TEACHER", "Faculty and Subject Teacher", False),
        ("PARENT", "Parent / Guardian", False),
        ("STUDENT", "Enrolled Student", False),
        ("TRANSPORT_MANAGER", "Transport Fleet Manager", False),
        ("DRIVER", "School/College Bus Driver", False),
        ("LIBRARIAN", "Head Librarian", False)
    ]
    for r_code, r_name, is_sys in system_roles:
        stmt = select(Role).where(Role.code == r_code, Role.tenant_id == None)
        res = await db.execute(stmt)
        if not res.scalars().first():
            role = Role(code=r_code, name=r_name, is_system=is_sys, tenant_id=None)
            db.add(role)
    await db.flush()

    # 5. Default Super Admin User
    admin_email = "admin@platform.erp.in"
    stmt = select(User).where(User.email == admin_email)
    res = await db.execute(stmt)
    if not res.scalars().first():
        super_admin = User(
            email=admin_email,
            hashed_password=hash_password("AdminSecurePassword2026!"),
            full_name="Platform Super Administrator",
            is_active=True,
            is_superadmin=True
        )
        db.add(super_admin)
        await db.flush()

        # Assign SUPER_ADMIN role
        stmt_role = select(Role).where(Role.code == "SUPER_ADMIN", Role.tenant_id == None)
        res_role = await db.execute(stmt_role)
        s_role = res_role.scalars().first()
        if s_role:
            ur = UserRole(user_id=super_admin.id, role_id=s_role.id, tenant_id=None)
            db.add(ur)

    # 6. Seed Default Pilot Institution (Akshara Global School & College)
    stmt_tenant = select(Tenant).where(Tenant.code == "akshara")
    res_tenant = await db.execute(stmt_tenant)
    if not res_tenant.scalars().first():
        pilot_tenant = Tenant(
            name="Akshara Global School & College",
            code="akshara",
            institution_type="composite_group",
            status="active",
            email="info@akshara.edu.in",
            phone="+91 98765 43210",
            address="100 Feet Ring Road, JP Nagar",
            city="Bengaluru",
            state="Karnataka",
            postal_code="560078",
            country="India",
            primary_color="#1E40AF",
            secondary_color="#F59E0B",
            subdomain="akshara"
        )
        db.add(pilot_tenant)
        await db.flush()

        # Add Main Campus
        campus = Campus(
            tenant_id=pilot_tenant.id,
            name="Akshara Global Main Campus",
            code="MAIN",
            is_main=True,
            address="100 Feet Ring Road, JP Nagar, Bengaluru",
            contact_email="principal@akshara.edu.in",
            contact_phone="+91 98765 43210"
        )
        db.add(campus)

        # Assign Standard Plan (Tier 2) Subscription
        from datetime import datetime, timedelta, timezone
        from app.modules.subscriptions.models import Subscription
        stmt_plan = select(SubscriptionPlan).where(SubscriptionPlan.code == "STANDARD")
        res_plan = await db.execute(stmt_plan)
        std_plan = res_plan.scalars().first()
        if std_plan:
            now = datetime.now(timezone.utc)
            sub = Subscription(
                tenant_id=pilot_tenant.id,
                plan_id=std_plan.id,
                status="active",
                billing_cycle="annual",
                starts_at=now,
                ends_at=now + timedelta(days=365)
            )
            db.add(sub)

        # Create Institution Principal User
        principal_email = "principal@akshara.edu.in"
        stmt_u = select(User).where(User.email == principal_email)
        res_u = await db.execute(stmt_u)
        if not res_u.scalars().first():
            principal = User(
                email=principal_email,
                hashed_password=hash_password("PrincipalSecurePassword2026!"),
                full_name="Dr. Ramesh Kumar (Principal)",
                is_active=True,
                is_superadmin=False
            )
            db.add(principal)
            await db.flush()

            stmt_r = select(Role).where(Role.code == "INSTITUTION_ADMIN", Role.tenant_id == None)
            res_r = await db.execute(stmt_r)
            inst_role = res_r.scalars().first()
            if inst_role:
                ur_inst = UserRole(user_id=principal.id, role_id=inst_role.id, tenant_id=pilot_tenant.id)
                db.add(ur_inst)

        # Seed Standard Examination Categories
        from app.modules.examinations.models import Examination
        from datetime import date
        stmt_ex = select(Examination).where(Examination.tenant_id == pilot_tenant.id)
        res_ex = await db.execute(stmt_ex)
        if not res_ex.scalars().first():
            ex1 = Examination(
                tenant_id=pilot_tenant.id,
                name="Mid-Term Examinations 2026",
                code="EXAM-2026-MID",
                category="midterm",
                foundation_programme="NONE",
                academic_year="2026-2027",
                target_class="I & II PUC (Science)",
                target_section="A",
                subject_code="PHY-101",
                subject_name="Physics (Theory + Practical)",
                exam_date=date(2026, 11, 18),
                start_time="09:30 AM",
                end_time="12:30 PM",
                max_marks=100.0,
                passing_marks=35.0,
                theory_max_marks=70.0,
                practical_max_marks=30.0,
                exam_mode="offline_paper",
                location_or_hall="Hall A-101",
                invigilator_name="Dr. V. Murthy",
                status="CONTROLLER_VERIFIED"
            )
            ex2 = Examination(
                tenant_id=pilot_tenant.id,
                name="Unit Test 2 (Formative Assessment)",
                code="EXAM-2026-UT2",
                category="unit_test",
                foundation_programme="NONE",
                academic_year="2026-2027",
                target_class="Class 10",
                target_section="A",
                subject_code="SCI-101",
                subject_name="Science & Technology",
                exam_date=date(2026, 11, 24),
                start_time="10:00 AM",
                end_time="11:30 AM",
                max_marks=50.0,
                passing_marks=18.0,
                theory_max_marks=40.0,
                practical_max_marks=10.0,
                exam_mode="offline_paper",
                location_or_hall="Classroom 10-A",
                invigilator_name="Mrs. K. Swamy",
                status="PUBLISHED"
            )
            ex3 = Examination(
                tenant_id=pilot_tenant.id,
                name="NEET / JEE Foundation Diagnostic Test",
                code="EXAM-2026-NEET-FND",
                category="competitive_foundation",
                foundation_programme="NEET_FOUNDATION",
                academic_year="2026-2027",
                target_class="I PUC (PCMB)",
                target_section="A",
                subject_code="NEET-F1",
                subject_name="Physics & Biology Foundation",
                exam_date=date(2026, 11, 28),
                start_time="02:00 PM",
                end_time="05:00 PM",
                max_marks=180.0,
                passing_marks=72.0,
                theory_max_marks=180.0,
                practical_max_marks=0.0,
                exam_mode="internal_online",
                location_or_hall="Digital CBT Lab 2",
                invigilator_name="Prof. S. Joshi",
                status="SCHEDULED"
            )
            db.add_all([ex1, ex2, ex3])

    await db.commit()
