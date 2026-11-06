import uuid
from typing import List, Dict, Any
from sqlalchemy import select, or_, text
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password, generate_temporary_password, validate_password_strength
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)
from app.modules.tenants.models import Tenant, Campus
from app.modules.identity.models import User, Role, Permission, UserRole, role_permissions
from app.modules.subscriptions.models import (
    FeatureCatalog,
    SubscriptionPlan,
    PlanFeature,
    Subscription
)
from app.modules.academic.models import (
    AcademicSection,
    StudentSectionEnrolment,
    Student,
    AdmissionApplication,
    SubjectCatalog,
    InstitutionSubject,
    ClassSubjectMapping
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

    # Academics & Curriculum
    {"code": "curriculum.view", "name": "View Subject Catalogue & Curriculum", "module": "academic"},
    {"code": "curriculum.manage", "name": "Configure Subjects & Class Curriculum", "module": "academic"},
    
    # Governance & Platform
    {"code": "reports.export", "name": "Generate & Export Reports", "module": "reports"},
    {"code": "settings.branding", "name": "Configure White-Label Branding", "module": "settings"},
    {"code": "permissions.manage", "name": "Super Admin Permission Control", "module": "governance"},
    {"code": "dashboard.design", "name": "Super Admin Dashboard Designer", "module": "governance"},
]

STANDARD_CATALOG_SUBJECTS: List[Dict[str, Any]] = [
    {
        "code": "ENG-101",
        "name": "English Core & Communication",
        "category": "Language",
        "has_practical": False,
        "default_theory_max": 100.0,
        "default_practical_max": 0.0,
        "credits": 4,
        "description": "Compulsory language, reading comprehension, writing skills and literature",
    },
    {
        "code": "KAN-102",
        "name": "Kannada Sahitya (Core Language)",
        "category": "Language",
        "has_practical": False,
        "default_theory_max": 100.0,
        "default_practical_max": 0.0,
        "credits": 4,
        "description": "State regional language core, grammar and classical literature",
    },
    {
        "code": "HIN-103",
        "name": "Hindi Core (Samanya)",
        "category": "Language",
        "has_practical": False,
        "default_theory_max": 100.0,
        "default_practical_max": 0.0,
        "credits": 4,
        "description": "National language option, prose, poetry and applied composition",
    },
    {
        "code": "PHY-101",
        "name": "Physics (Theory + Lab)",
        "category": "Core Science",
        "has_practical": True,
        "default_theory_max": 70.0,
        "default_practical_max": 30.0,
        "credits": 5,
        "description": "Mechanics, Thermodynamics, Electromagnetism, Optics, Modern Physics and Lab Practicals",
    },
    {
        "code": "CHEM-102",
        "name": "Chemistry (Inorganic, Organic & Physical)",
        "category": "Core Science",
        "has_practical": True,
        "default_theory_max": 70.0,
        "default_practical_max": 30.0,
        "credits": 5,
        "description": "General chemical principles, Qualitative and Quantitative Analysis lab",
    },
    {
        "code": "MATH-103",
        "name": "Pure & Applied Mathematics",
        "category": "Core Science",
        "has_practical": False,
        "default_theory_max": 80.0,
        "default_practical_max": 20.0,
        "credits": 5,
        "description": "Calculus, Algebra, Coordinate Geometry, Vectors, Probability and Internal Assessment",
    },
    {
        "code": "BIO-104",
        "name": "Biology (Botany & Zoology)",
        "category": "Core Science",
        "has_practical": True,
        "default_theory_max": 70.0,
        "default_practical_max": 30.0,
        "credits": 5,
        "description": "Cell Biology, Genetics, Plant & Human Physiology, Ecology and Specimen Dissection",
    },
    {
        "code": "CS-105",
        "name": "Computer Science (Python & SQL)",
        "category": "Core Science",
        "has_practical": True,
        "default_theory_max": 70.0,
        "default_practical_max": 30.0,
        "credits": 5,
        "description": "Python Programming, Data Structures, Relational Database, SQL queries & Computer Networks",
    },
    {
        "code": "ACC-201",
        "name": "Accountancy & Financial Statements",
        "category": "Core Commerce",
        "has_practical": False,
        "default_theory_max": 80.0,
        "default_practical_max": 20.0,
        "credits": 4,
        "description": "Double entry bookkeeping, Balance sheets, Partnership & Company accounts",
    },
    {
        "code": "BST-202",
        "name": "Business Studies & Management",
        "category": "Core Commerce",
        "has_practical": False,
        "default_theory_max": 80.0,
        "default_practical_max": 20.0,
        "credits": 4,
        "description": "Principles of Management, Marketing, Business Finance & Consumer Protection",
    },
    {
        "code": "ECO-203",
        "name": "Economics (Micro & Macro)",
        "category": "Core Commerce",
        "has_practical": False,
        "default_theory_max": 80.0,
        "default_practical_max": 20.0,
        "credits": 4,
        "description": "Indian Economic Development, Microeconomics and National Income Accounting",
    },
    {
        "code": "HIST-301",
        "name": "History & Heritage Studies",
        "category": "Arts & Humanities",
        "has_practical": False,
        "default_theory_max": 80.0,
        "default_practical_max": 20.0,
        "credits": 4,
        "description": "Ancient, Medieval, Modern World & Indian Civilizations",
    },
    {
        "code": "POL-302",
        "name": "Political Science & Constitution",
        "category": "Arts & Humanities",
        "has_practical": False,
        "default_theory_max": 80.0,
        "default_practical_max": 20.0,
        "credits": 4,
        "description": "Indian Constitution, Political Theory, Comparative Politics & International Relations",
    },
]


async def seed_initial_data(db: AsyncSession) -> None:
    """Idempotently seed feature catalog, subscription plans, permissions, and superadmin."""
    # Seed runs before RLS policies are enabled on a fresh database. On later
    # production boots, all global seed records already exist and are read-only.
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

    # 3.5 Global Subject Catalogue Reference Library
    for s_def in STANDARD_CATALOG_SUBJECTS:
        stmt_s = select(SubjectCatalog).where(
            SubjectCatalog.code == s_def["code"],
            SubjectCatalog.tenant_id == None
        )
        res_s = await db.execute(stmt_s)
        if not res_s.scalars().first():
            cat_subject = SubjectCatalog(
                tenant_id=None,
                code=s_def["code"],
                name=s_def["name"],
                category=s_def["category"],
                has_practical=s_def["has_practical"],
                default_theory_max=s_def["default_theory_max"],
                default_practical_max=s_def["default_practical_max"],
                credits=s_def["credits"],
                description=s_def["description"],
                is_active=True
            )
            db.add(cat_subject)
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
        ("LIBRARIAN", "Head Librarian", False),
        ("CHAIRMAN_DIRECTOR", "Chairman and Governing Director", False)
    ]
    for r_code, r_name, is_sys in system_roles:
        stmt = select(Role).where(Role.code == r_code, Role.tenant_id == None)
        res = await db.execute(stmt)
        if not res.scalars().first():
            role = Role(code=r_code, name=r_name, is_system=is_sys, tenant_id=None)
            db.add(role)
    await db.flush()

    # Link default permissions to system roles for effective-access computation
    res_all_perms = await db.execute(select(Permission))
    all_perms = {p.code: p for p in res_all_perms.scalars().all()}

    ROLE_DEFAULT_PERMS: Dict[str, List[str]] = {
        "SUPER_ADMIN": list(all_perms.keys()),
        "CHAIRMAN_DIRECTOR": list(all_perms.keys()),
        "INSTITUTION_ADMIN": [p for p in all_perms.keys() if p not in ("permissions.manage",)],
        "PRINCIPAL": [
            "students.view", "students.create", "students.edit", "students.archive", "admissions.manage",
            "fees.view", "fees.configure",
            "attendance.mark", "attendance.verify",
            "exams.view", "exams.manage", "marks.enter", "marks.verify", "marks.approve", "marks.publish", "marks.export",
            "curriculum.view", "curriculum.manage",
            "staff.manage", "transport.view", "reports.export", "settings.branding"
        ],
        "VICE_PRINCIPAL": [
            "students.view", "students.create", "students.edit", "admissions.manage",
            "attendance.mark", "attendance.verify",
            "exams.view", "exams.manage", "marks.enter", "marks.verify", "marks.approve",
            "curriculum.view", "curriculum.manage",
            "staff.manage", "reports.export"
        ],
        "ACCOUNTANT": [
            "fees.view", "fees.collect", "fees.refund", "fees.reconcile", "fees.configure",
            "reports.export", "students.view"
        ],
        "EXAM_CONTROLLER": [
            "exams.view", "exams.manage", "exams.delete", "marks.enter", "marks.verify", "marks.publish", "marks.export",
            "curriculum.view",
            "students.view", "reports.export"
        ],
        "TEACHER": [
            "attendance.mark", "marks.enter", "exams.view", "students.view", "curriculum.view"
        ],
        "STUDENT": [
            "students.view", "exams.view"
        ],
        "PARENT": [
            "students.view", "exams.view", "fees.view"
        ],
        "LIBRARIAN": [
            "students.view"
        ],
    }

    for r_code, perm_codes in ROLE_DEFAULT_PERMS.items():
        stmt_r = select(Role).options(selectinload(Role.permissions)).where(Role.code == r_code, Role.tenant_id == None)
        res_r = await db.execute(stmt_r)
        r_obj = res_r.scalars().first()
        if r_obj:
            existing_perm_codes = {p.code for p in r_obj.permissions}
            for pc in perm_codes:
                if pc in all_perms and pc not in existing_perm_codes:
                    r_obj.permissions.append(all_perms[pc])
    await db.flush()

    # 5. Default Super Admin User
    admin_email = "admin@platform.erp.in"
    stmt = select(User).where(User.email == admin_email)
    res = await db.execute(stmt)
    super_admin = res.scalars().first()
    if not super_admin:
        initial_password = settings.INITIAL_SUPERADMIN_PASSWORD
        if settings.ENVIRONMENT.lower() == "production" and not initial_password:
            raise RuntimeError("INITIAL_SUPERADMIN_PASSWORD must be configured for first production bootstrap.")
        if not initial_password:
            initial_password = generate_temporary_password()
            logger.warning("Generated one-time bootstrap password for %s: %s", admin_email, initial_password)
        is_valid, password_error = validate_password_strength(initial_password)
        if not is_valid:
            raise RuntimeError(f"INITIAL_SUPERADMIN_PASSWORD does not meet password policy: {password_error}")
        super_admin = User(
            email=admin_email,
            hashed_password=hash_password(initial_password),
            full_name="Platform Super Administrator",
            is_active=True,
            is_superadmin=True,
            phone=None
        )
        db.add(super_admin)
        await db.flush()

        stmt_role = select(Role).where(Role.code == "SUPER_ADMIN", Role.tenant_id == None)
        res_role = await db.execute(stmt_role)
        s_role = res_role.scalars().first()
        if s_role:
            db.add(UserRole(user_id=super_admin.id, role_id=s_role.id, tenant_id=None))

    # Never overwrite an existing platform owner's password during application startup.
    if settings.ENVIRONMENT.lower() == "production":
        await db.commit()
        return

    # 6. Seed Default Demonstration Institution: OUR SCHOOL (Live Demo)
    stmt_tenant = select(Tenant).where(or_(Tenant.code == "our-school-demo", Tenant.code == "akshara"))
    res_tenant = await db.execute(stmt_tenant)
    pilot_tenant = res_tenant.scalars().first()
    if pilot_tenant:
        await db.execute(
            text("SELECT set_config('app.current_tenant_id', :tenant_id, true)"),
            {"tenant_id": str(pilot_tenant.id)}
        )
    if not pilot_tenant:
        pilot_tenant = Tenant(
            name="OUR SCHOOL",
            code="our-school-demo",
            institution_type="demo",
            status="active_demo",
            email="demo@ourschool.edu.in",
            phone="+91 98765 43210",
            address="Demo Campus, 100 Feet Ring Road, JP Nagar",
            city="Bengaluru",
            state="Karnataka",
            postal_code="560078",
            country="India",
            primary_color="#1E40AF",
            secondary_color="#F59E0B",
            subdomain="our-school-demo",
            settings={
                "purpose": "DEMO",
                "is_demo": True,
                "academic_units": [
                    {"code": "SCHOOL", "name": "OUR SCHOOL (Demo)", "level": "School", "type": "demo"}
                ]
            }
        )
        db.add(pilot_tenant)
        await db.flush()

        # Add Main Campus
        campus = Campus(
            tenant_id=pilot_tenant.id,
            name="OUR SCHOOL Demo Campus",
            code="DEMO-MAIN",
            is_main=True,
            address="Demo Campus, 100 Feet Ring Road, JP Nagar, Bengaluru",
            contact_email="principal@ourschool.edu.in",
            contact_phone="+91 98765 43210"
        )
        db.add(campus)

        # Assign Standard Plan (Tier 2) Subscription
        from datetime import datetime, timedelta, timezone
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

    # Create Institution Principal User if not present
    principal_email = "principal@akshara.edu.in"
    stmt_u = select(User).where(User.email == principal_email)
    res_u = await db.execute(stmt_u)
    principal = res_u.scalars().first()
    if not principal:
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

        stmt_r_prin = select(Role).where(Role.code == "PRINCIPAL", Role.tenant_id == None)
        res_r_prin = await db.execute(stmt_r_prin)
        prin_role = res_r_prin.scalars().first()
        if prin_role:
            db.add(UserRole(user_id=principal.id, role_id=prin_role.id, tenant_id=pilot_tenant.id))

    # Seed standard institutional users for pilot tenant
    pilot_users = [
        ("chairman@akshara.edu.in", "ChairmanSecure2026!", "Dr. S. K. Narayana (Chairman)", "CHAIRMAN_DIRECTOR"),
        ("accountant@akshara.edu.in", "AccountantSecure2026!", "Venkatesh Iyer (Senior Accountant)", "ACCOUNTANT"),
        ("exams@akshara.edu.in", "ExamController2026!", "Prof. Ananth Murthy (Exam Controller)", "EXAM_CONTROLLER"),
        ("teacher.physics@akshara.edu.in", "TeacherPhysics2026!", "Lakshmi Prasad (Physics Faculty)", "TEACHER"),
        ("librarian@akshara.edu.in", "LibrarianSecure2026!", "Smt. Geetha R. (Head Librarian)", "LIBRARIAN"),
        ("student.rahul@akshara.edu.in", "StudentRahul2026!", "Rahul Kumar (Class I PUC Science)", "STUDENT"),
        ("parent.rahul@akshara.edu.in", "ParentRahul2026!", "Ramesh Kumar (Parent)", "PARENT"),
    ]
    for u_email, u_pass, u_name, r_code in pilot_users:
        stmt_usr = select(User).where(User.email == u_email)
        res_usr = await db.execute(stmt_usr)
        if not res_usr.scalars().first():
            nu = User(
                email=u_email,
                hashed_password=hash_password(u_pass),
                full_name=u_name,
                is_active=True,
                is_superadmin=False
            )
            db.add(nu)
            await db.flush()

            stmt_rl = select(Role).where(Role.code == r_code, Role.tenant_id == None)
            res_rl = await db.execute(stmt_rl)
            ro = res_rl.scalars().first()
            if ro:
                db.add(UserRole(user_id=nu.id, role_id=ro.id, tenant_id=pilot_tenant.id))

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

        # Seed School-Defined Fee Structures, Invoices & Receipts
        from app.modules.finance.models import FeeStructure, FeeInvoice, FeePayment, FeeReceipt, ReceiptAuditLog
        from datetime import datetime, timezone
        stmt_fs = select(FeeStructure).where(FeeStructure.tenant_id == pilot_tenant.id)
        res_fs = await db.execute(stmt_fs)
        if not res_fs.scalars().first():
            fs1 = FeeStructure(
                tenant_id=pilot_tenant.id,
                academic_year="2026-2027",
                institution_type="School",
                class_or_stream="Class 10",
                term_count=3,
                terms_config=[
                    {"term_code": "TERM_1", "name": "Term 1 (June-Aug)", "due_date": "2026-06-30", "share_pct": 40},
                    {"term_code": "TERM_2", "name": "Term 2 (Sept-Nov)", "due_date": "2026-11-15", "share_pct": 35},
                    {"term_code": "TERM_3", "name": "Term 3 (Dec-Feb)", "due_date": "2027-01-31", "share_pct": 25},
                ],
                fee_heads=[
                    {"head_code": "TUITION", "title": "Annual Tuition & Digital Classrooms", "amount": 35000.0},
                    {"head_code": "LAB", "title": "Composite Science & Computer Lab", "amount": 5000.0},
                    {"head_code": "TRANSPORT", "title": "Bus Transport Fee (Route 104)", "amount": 12000.0},
                    {"head_code": "LIBRARY", "title": "Library & Co-Curricular", "amount": 3000.0},
                ],
                total_annual_fee=55000.0,
                concessions_allowed=True,
                version=1,
            )
            fs2 = FeeStructure(
                tenant_id=pilot_tenant.id,
                academic_year="2026-2027",
                institution_type="PU College",
                class_or_stream="I PUC (PCMB)",
                term_count=2,
                terms_config=[
                    {"term_code": "SEM_1", "name": "Semester 1 (June-Nov)", "due_date": "2026-08-31", "share_pct": 50},
                    {"term_code": "SEM_2", "name": "Semester 2 (Dec-April)", "due_date": "2026-12-31", "share_pct": 50},
                ],
                fee_heads=[
                    {"head_code": "TUITION", "title": "Pre-University Tuition & Integrated Coaching", "amount": 45000.0},
                    {"head_code": "LAB", "title": "Physics, Chemistry & Biology Practicals", "amount": 15000.0},
                    {"head_code": "HOSTEL_MESS", "title": "Hostel Boarding & Dining Facility", "amount": 38000.0},
                    {"head_code": "EXAM", "title": "Pre-University Board & Internal Assessment", "amount": 3500.0},
                ],
                total_annual_fee=101500.0,
                concessions_allowed=True,
                version=1,
            )
            db.add_all([fs1, fs2])
            await db.flush()

            # Seed pilot invoices
            inv1 = FeeInvoice(
                tenant_id=pilot_tenant.id,
                invoice_number="INV-2026-0091",
                student_id=uuid.uuid4(),
                student_name="Aarav Sharma",
                admission_number="ADM-2026-001",
                class_name="Class 10-A",
                academic_year="2026-2027",
                term_code="TERM_1",
                term_name="Term 1 (June-Aug)",
                fee_head="TUITION",
                fee_title="Annual Tuition & Digital Classrooms",
                total_amount=35000.0,
                concession_amount=0.0,
                net_payable=35000.0,
                paid_amount=35000.0,
                balance_amount=0.0,
                due_date=date(2026, 6, 30),
                last_payment_date=date(2026, 6, 25),
                status="PAID",
                breakdown=[
                    {"head_code": "TUITION", "title": "Tuition Fee", "amount": 30000.0},
                    {"head_code": "LAB", "title": "Lab Fee", "amount": 5000.0},
                ]
            )
            inv2 = FeeInvoice(
                tenant_id=pilot_tenant.id,
                invoice_number="INV-2026-0092",
                student_id=uuid.uuid4(),
                student_name="Ananya Hegde",
                admission_number="ADM-2026-002",
                class_name="I PUC (PCMB)",
                academic_year="2026-2027",
                term_code="SEM_1",
                term_name="Semester 1 (June-Nov)",
                fee_head="LAB",
                fee_title="Physics, Chemistry & Biology Lab Fee",
                total_amount=18000.0,
                concession_amount=0.0,
                net_payable=18000.0,
                paid_amount=5500.0,
                balance_amount=12500.0,
                due_date=date(2026, 11, 20),
                last_payment_date=date(2026, 9, 10),
                status="PARTIAL",
                breakdown=[
                    {"head_code": "LAB", "title": "PCB Lab Practicals", "amount": 18000.0},
                ]
            )
            inv3 = FeeInvoice(
                tenant_id=pilot_tenant.id,
                invoice_number="INV-2026-0093",
                student_id=uuid.uuid4(),
                student_name="Rohan Verma",
                admission_number="ADM-2026-003",
                class_name="B.Sc CS (Sem 3)",
                academic_year="2026-2027",
                term_code="SEM_1",
                term_name="Semester 1 (June-Nov)",
                fee_head="HOSTEL_MESS",
                fee_title="Hostel Accommodation & Dining (Term 1)",
                total_amount=38000.0,
                concession_amount=0.0,
                net_payable=38000.0,
                paid_amount=14000.0,
                balance_amount=24000.0,
                due_date=date(2026, 10, 31),
                last_payment_date=date(2026, 10, 5),
                status="OVERDUE",
                breakdown=[
                    {"head_code": "HOSTEL_MESS", "title": "Hostel Boarding", "amount": 25000.0},
                    {"head_code": "HOSTEL_MESS", "title": "Mess & Dining", "amount": 13000.0},
                ]
            )
            db.add_all([inv1, inv2, inv3])
            await db.flush()
            db.add_all([inv1, inv2, inv3])
            await db.flush()

            # Seed pilot payment and permanent receipt for inv1
            p1 = FeePayment(
                tenant_id=pilot_tenant.id,
                invoice_id=inv1.id,
                student_id=inv1.student_id,
                amount_paid=35000.0,
                payment_method="UPI",
                transaction_reference="UPI/2026/0625/89210",
                idempotency_key="SEED-IDEMP-001",
                collected_by_name="Senior Cashier",
                payment_date=datetime(2026, 6, 25, 10, 30, tzinfo=timezone.utc),
                fee_allocations=[
                    {"head": "TUITION", "title": "Tuition Fee", "allocated": 30000.0, "remaining": 0.0},
                    {"head": "LAB", "title": "Lab Fee", "allocated": 5000.0, "remaining": 0.0},
                ],
                status="CONFIRMED"
            )
            db.add(p1)
            await db.flush()

            rcp1 = FeeReceipt(
                tenant_id=pilot_tenant.id,
                receipt_number="RCP-AKSH-2026-1001",
                payment_id=p1.id,
                invoice_id=inv1.id,
                student_id=inv1.student_id,
                student_name=inv1.student_name,
                admission_number=inv1.admission_number,
                class_name=inv1.class_name,
                academic_year=inv1.academic_year,
                term_code=inv1.term_code,
                term_name=inv1.term_name,
                amount_paid=35000.0,
                previous_balance=35000.0,
                current_balance=0.0,
                payment_method="UPI",
                transaction_reference=p1.transaction_reference,
                payment_date=p1.payment_date,
                fee_allocations=p1.fee_allocations,
                institution_branding={
                    "institution_name": "Akshara Global Educational Institutions",
                    "affiliation": "Affiliated to State Pre-University & Secondary Education Board",
                    "address": "Campus Ground, 80 Feet Road, Bengaluru, Karnataka - 560085",
                    "phone": "+91 80 2345 6789",
                    "email": "accounts@akshara.erp.in",
                    "receipt_header_note": "Computer Generated Fee Receipt - Valid with Authorized Signatory Seal"
                },
                qr_verification_code="VERIFY:RECEIPT:RCP-AKSH-2026-1001:SEED-IDEMP-001",
                reprint_count=0,
                is_duplicate=False,
                status="CONFIRMED"
            )
            db.add(rcp1)
            await db.flush()

            audit1 = ReceiptAuditLog(
                tenant_id=pilot_tenant.id,
                receipt_id=rcp1.id,
                receipt_number=rcp1.receipt_number,
                action="GENERATED",
                performed_by_name="Senior Cashier",
                role="ACCOUNTANT",
                details={"amount": 35000.0, "method": "UPI"}
            )
            db.add(audit1)

    # 6B. Seed Canonical Students & Admissions for Pilot Tenant (Live Demo)
    if pilot_tenant:
        s1_res = await db.execute(
            select(Student).where(
                Student.tenant_id == pilot_tenant.id,
                Student.admission_number == "ADM-2026-001"
            )
        )
        s1 = s1_res.scalars().first()
        if not s1:
            s1 = Student(
                tenant_id=pilot_tenant.id,
                admission_number="ADM-2026-001",
                first_name="Aarav",
                last_name="Sharma",
                date_of_birth=date(2010, 4, 15),
                gender="MALE",
                blood_group="O+",
                father_name="Ramesh Sharma",
                mother_name="Sunita Sharma",
                guardian_name="Ramesh Sharma",
                father_mobile="+91 98765 43210",
                guardian_phone="+91 98765 43210",
                parent_email="parent@akshara.erp.in",
                emergency_contact="+91 98765 43210",
                door_street="#42, 5th Cross, Malleshwaram",
                city_town="Bengaluru",
                district_state="Karnataka",
                pincode="560003",
                academic_year="2026-2027",
                institution_level="School",
                class_name="Class 10-A",
                section_or_stream="A",
                roll_number="1001",
                admission_date=date(2026, 6, 1),
                status="ACTIVE",
                masked_aadhaar="XXXX-XXXX-4512",
                fee_balance=0.0,
                attendance_pct=94.2
            )
            db.add(s1)

        s2_res = await db.execute(
            select(Student).where(
                Student.tenant_id == pilot_tenant.id,
                Student.admission_number == "ADM-2026-002"
            )
        )
        s2 = s2_res.scalars().first()
        if not s2:
            s2 = Student(
                tenant_id=pilot_tenant.id,
                admission_number="ADM-2026-002",
                first_name="Ananya",
                last_name="Hegde",
                date_of_birth=date(2008, 9, 21),
                gender="FEMALE",
                blood_group="B+",
                father_name="Dr. Anand Hegde",
                mother_name="Dr. Shweta Hegde",
                guardian_name="Dr. Anand Hegde",
                father_mobile="+91 98450 11223",
                guardian_phone="+91 98450 11223",
                parent_email="student@akshara.erp.in",
                emergency_contact="+91 98450 11223",
                door_street="#18, 11th Main, Jayanagar",
                city_town="Bengaluru",
                district_state="Karnataka",
                pincode="560011",
                academic_year="2026-2027",
                institution_level="PU College",
                class_name="I PUC (PCMB)",
                section_or_stream="A",
                roll_number="2001",
                admission_date=date(2026, 6, 1),
                status="ACTIVE",
                masked_aadhaar="XXXX-XXXX-8823",
                fee_balance=12500.0,
                attendance_pct=91.8
            )
            db.add(s2)

        s3_res = await db.execute(
            select(Student).where(
                Student.tenant_id == pilot_tenant.id,
                Student.admission_number == "ADM-2026-003"
            )
        )
        s3 = s3_res.scalars().first()
        if not s3:
            s3 = Student(
                tenant_id=pilot_tenant.id,
                admission_number="ADM-2026-003",
                first_name="Rohan",
                last_name="Verma",
                date_of_birth=date(2005, 12, 5),
                gender="MALE",
                blood_group="AB+",
                father_name="Sanjay Verma",
                mother_name="Rekha Verma",
                guardian_name="Sanjay Verma",
                father_mobile="+91 99001 22334",
                guardian_phone="+91 99001 22334",
                parent_email="rohan.verma@akshara.erp.in",
                emergency_contact="+91 99001 22334",
                door_street="#7, 2nd Stage, Indiranagar",
                city_town="Bengaluru",
                district_state="Karnataka",
                pincode="560038",
                academic_year="2026-2027",
                institution_level="Degree College",
                class_name="B.Sc CS (Sem 3)",
                section_or_stream="A",
                roll_number="3001",
                admission_date=date(2026, 6, 1),
                status="ACTIVE",
                masked_aadhaar="XXXX-XXXX-3341",
                fee_balance=24000.0,
                attendance_pct=88.5
            )
            db.add(s3)

        app_sample_res = await db.execute(
            select(AdmissionApplication).where(
                AdmissionApplication.tenant_id == pilot_tenant.id,
                AdmissionApplication.application_number == "APP-2026-0001"
            )
        )
        if not app_sample_res.scalars().first():
            app_sample = AdmissionApplication(
                tenant_id=pilot_tenant.id,
                application_number="APP-2026-0001",
                applicant_name="Dev Patel",
                level="School",
                target_class="Class 6",
                parent_name="Kishore Patel",
                parent_phone="+91 97400 55667",
                parent_email="kishore.patel@example.com",
                date_of_birth=date(2014, 8, 12),
                gender="MALE",
                address="Flat 402, Green Glen Layout, Bengaluru",
                submission_date=date.today(),
                status="PENDING"
            )
            db.add(app_sample)

        await db.flush()

        # Link FeeInvoices to Canonical Students
        if s1:
            inv1_res = await db.execute(
                select(FeeInvoice).where(FeeInvoice.admission_number == "ADM-2026-001")
            )
            inv1 = inv1_res.scalars().first()
            if inv1:
                inv1.student_id = s1.id

        if s2:
            inv2_res = await db.execute(
                select(FeeInvoice).where(FeeInvoice.admission_number == "ADM-2026-002")
            )
            inv2 = inv2_res.scalars().first()
            if inv2:
                inv2.student_id = s2.id

        if s3:
            inv3_res = await db.execute(
                select(FeeInvoice).where(FeeInvoice.admission_number == "ADM-2026-003")
            )
            inv3 = inv3_res.scalars().first()
            if inv3:
                inv3.student_id = s3.id

    # 7. Seed Independent Trial Tenant: Akshara Global School and PU College
    trial_code = "akshara-trial"
    stmt_trial = select(Tenant).where(Tenant.code == trial_code)
    res_trial = await db.execute(stmt_trial)
    trial_tenant = res_trial.scalars().first()
    if trial_tenant:
        await db.execute(
            text("SELECT set_config('app.current_tenant_id', :tenant_id, true)"),
            {"tenant_id": str(trial_tenant.id)}
        )
    if not trial_tenant:
        from datetime import datetime, timedelta, timezone
        now = datetime.now(timezone.utc)
        trial_tenant = Tenant(
            name="AKSHARA GLOBAL SCHOOL AND PU COLLEGE",
            code=trial_code,
            institution_type="composite_group",
            status="trial_active",
            email="info@akshara-trial.edu.in",
            phone="+91 80 2345 6789",
            address="Campus Ground, 80 Feet Road, Bengaluru",
            city="Bengaluru",
            state="Karnataka",
            postal_code="560085",
            country="India",
            primary_color="#1E3A8A",
            secondary_color="#D97706",
            subdomain="akshara-trial",
            settings={
                "academic_units": [
                    {
                        "code": "SCHOOL",
                        "name": "Akshara Global Public School",
                        "level": "School",
                        "type": "k12",
                        "principal_email": "school.principal@akshara-trial.edu.in"
                    },
                    {
                        "code": "PU_COLLEGE",
                        "name": "Akshara Pre-University College",
                        "level": "PU College",
                        "type": "composite_pu",
                        "principal_email": "pu.principal@akshara-trial.edu.in"
                    }
                ],
                "trial_policy": {
                    "is_trial": True,
                    "trial_days": 30,
                    "max_students": 1000,
                    "max_staff": 100
                }
            }
        )
        db.add(trial_tenant)
        await db.flush()

        # Add Main Campus
        trial_campus = Campus(
            tenant_id=trial_tenant.id,
            name="Akshara Global Main Campus",
            code="MAIN",
            is_main=True,
            address="Campus Ground, 80 Feet Road, Bengaluru",
            contact_email="principal@akshara-trial.edu.in",
            contact_phone="+91 80 2345 6789"
        )
        db.add(trial_campus)

        # 30-Day Trial Subscription of Standard Plan
        stmt_plan = select(SubscriptionPlan).where(SubscriptionPlan.code == "STANDARD")
        res_plan = await db.execute(stmt_plan)
        std_plan = res_plan.scalars().first()
        if std_plan:
            trial_sub = Subscription(
                tenant_id=trial_tenant.id,
                plan_id=std_plan.id,
                status="trial",
                billing_cycle="annual",
                starts_at=now,
                ends_at=now + timedelta(days=30),
                trial_ends_at=now + timedelta(days=30)
            )
            db.add(trial_sub)

    # Configure Separate Accounts for Trial Tenant:
    # 1. Chairman / Director
    # 2. School Principal
    # 3. PU Principal
    trial_accounts = [
        (
            "chairman@akshara-trial.edu.in",
            "ChairmanTrialSecure2026!",
            "Dr. Anand Hegde (Chairman)",
            "CHAIRMAN_DIRECTOR"
        ),
        (
            "school.principal@akshara-trial.edu.in",
            "SchoolPrincipalTrial2026!",
            "Mrs. Sunita Deshmukh (School Principal)",
            "PRINCIPAL"
        ),
        (
            "pu.principal@akshara-trial.edu.in",
            "PUPrincipalTrial2026!",
            "Prof. M. B. Patil (PU Principal)",
            "PRINCIPAL"
        ),
    ]
    for t_email, t_pass, t_name, t_role in trial_accounts:
        stmt_tu = select(User).where(User.email == t_email)
        res_tu = await db.execute(stmt_tu)
        tu = res_tu.scalars().first()
        if not tu:
            tu = User(
                email=t_email,
                hashed_password=hash_password(t_pass),
                full_name=t_name,
                is_active=True,
                is_superadmin=False,
                must_change_password=True
            )
            db.add(tu)
            await db.flush()

        stmt_r = select(Role).where(Role.code == t_role, Role.tenant_id == None)
        res_r = await db.execute(stmt_r)
        ro = res_r.scalars().first()
        if ro:
            stmt_ur = select(UserRole).where(
                UserRole.user_id == tu.id,
                UserRole.role_id == ro.id,
                UserRole.tenant_id == trial_tenant.id
            )
            res_ur = await db.execute(stmt_ur)
            if not res_ur.scalars().first():
                db.add(UserRole(user_id=tu.id, role_id=ro.id, tenant_id=trial_tenant.id))

    await db.commit()


if __name__ == "__main__":
    import asyncio
    from app.database.session import AsyncSessionLocal

    async def _main():
        async with AsyncSessionLocal() as session:
            await seed_initial_data(session)
            print("Successfully executed database seed.")

    asyncio.run(_main())
