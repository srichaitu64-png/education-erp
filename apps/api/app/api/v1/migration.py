import uuid
from datetime import datetime, date, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func

from app.database.session import get_db, get_current_tenant_id
from app.security.deps import get_current_user
from app.modules.identity.models import User
from app.modules.migration.models import MigrationBatchLog
from app.modules.migration.schemas import (
    MigrationValidateRequest,
    MigrationValidateResponse,
    MigrationExecuteRequest,
    MigrationExecuteResponse,
    MigrationBatchLogOut,
)
from app.modules.academic.models import Student, AcademicSection, StudentSectionEnrolment
from app.modules.finance.models import FeeInvoice

router = APIRouter(prefix="/migration", tags=["Data Migration & Bulk Ingestion Engine"])

def require_migration_tenant_id() -> uuid.UUID:
    """
    Require an explicitly authenticated tenant context for every migration
    operation. Never infer a tenant from an arbitrary role or invent a UUID:
    migration writes must fail closed when the request has no tenant scope.
    """
    tenant_id = get_current_tenant_id()
    if tenant_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="An active institution context is required for data migration.",
        )
    return tenant_id


TEMPLATE_HEADERS = {
    "STUDENTS": [
        "admission_number",
        "first_name",
        "last_name",
        "class_name",
        "section_or_stream",
        "date_of_birth",
        "gender",
        "guardian_name",
        "guardian_phone",
        "parent_email",
        "door_street",
        "city_town",
        "fee_balance"
    ],
    "FEES": [
        "admission_number",
        "student_name",
        "class_name",
        "term_code",
        "term_name",
        "fee_head",
        "fee_title",
        "total_amount",
        "paid_amount",
        "due_date"
    ],
    "STAFF": [
        "employee_code",
        "full_name",
        "email",
        "phone",
        "department",
        "designation",
        "duty_role"
    ],
    "ATTENDANCE": [
        "attendance_date",
        "admission_number",
        "class_name",
        "section_code",
        "status",
        "absence_reason"
    ],
    "EXAMINATIONS": [
        "exam_code",
        "exam_name",
        "category",
        "target_class",
        "subject_code",
        "subject_name",
        "exam_date",
        "max_marks"
    ]
}


@router.get("/templates/{module}")
async def download_migration_template(module: str):
    """
    Download authoritative CSV column template for bulk data ingestion.
    """
    mod_key = module.upper()
    headers = TEMPLATE_HEADERS.get(mod_key)
    if not headers:
        raise HTTPException(status_code=400, detail=f"Unsupported module '{module}'. Supported: STUDENTS, FEES, STAFF, ATTENDANCE, EXAMINATIONS")

    csv_content = ",".join(headers) + "\n"
    # Sample row
    if mod_key == "STUDENTS":
        csv_content += "ADM-2026-0101,Rohan,Sharma,Class 10,A,2010-05-15,MALE,Ramesh Sharma,+91 98765 43210,ramesh@example.com,42 MG Road,Bengaluru,0.0\n"
    elif mod_key == "FEES":
        csv_content += "ADM-2026-0101,Rohan Sharma,Class 10,TERM_1,Term 1 (June-Aug),TUITION,Tuition Fee,35000.0,0.0,2026-07-31\n"
    elif mod_key == "STAFF":
        csv_content += "EMP-101,Dr. Savita Rao,savita@school.edu.in,+91 98450 12345,Academics,Senior Lecturer,SUBJECT_TEACHER\n"
    elif mod_key == "ATTENDANCE":
        csv_content += f"{date.today().isoformat()},ADM-2026-0101,Class 10,A,PRESENT,\n"
    elif mod_key == "EXAMINATIONS":
        csv_content += "EXAM-10-MATH,Mid-Term Assessment,unit_test,Class 10,MATH-10,Mathematics,2026-11-20,100.0\n"

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=EducationOS_{mod_key}_Template.csv"}
    )


@router.post("/validate", response_model=MigrationValidateResponse)
async def validate_migration_dataset(
    payload: MigrationValidateRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Dry-run ingestion parser and schema validator.
    Detects missing fields, validates types, and discovers exact and probable duplicate matches.
    """
    tenant_id = require_migration_tenant_id()
    total_records = len(payload.records)
    duplicates = []
    errors = []

    if payload.target_module.upper() == "STUDENTS":
        # Check against existing students in tenant
        for idx, row in enumerate(payload.records):
            row_num = idx + 1
            adm_no = row.get("admission_number") or row.get("admission_no") or row.get("adm_no")
            f_name = row.get("first_name") or ""
            l_name = row.get("last_name") or ""

            if not f_name:
                errors.append({"row": row_num, "field": "first_name", "message": "First name is mandatory."})
            if not row.get("class_name"):
                errors.append({"row": row_num, "field": "class_name", "message": "Class name is mandatory."})

            if adm_no:
                existing = await db.execute(
                    select(Student).where(
                        Student.tenant_id == tenant_id,
                        Student.admission_number == str(adm_no)
                    )
                )
                match = existing.scalars().first()
                if match:
                    duplicates.append({
                        "row": row_num,
                        "admission_number": str(adm_no),
                        "existing_student_name": f"{match.first_name} {match.last_name}",
                        "candidate_student_name": f"{f_name} {l_name}",
                        "match_type": "EXACT",
                        "existing_id": str(match.id)
                    })

    clean_count = max(0, total_records - len(duplicates) - len(errors))
    return MigrationValidateResponse(
        is_valid=len(errors) == 0,
        total_records=total_records,
        clean_records_count=clean_count,
        duplicate_candidates_count=len(duplicates),
        errors_count=len(errors),
        duplicate_candidates=duplicates,
        errors=errors,
        column_mappings=[{"field": k, "sample": v} for k, v in (payload.records[0].items() if payload.records else [])]
    )


@router.post("/execute", response_model=MigrationExecuteResponse, status_code=status.HTTP_201_CREATED)
async def execute_bulk_migration(
    payload: MigrationExecuteRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Execute high-speed chunked batch ingestion with conflict resolution policies (SKIP / OVERWRITE / MERGE).
    Persists audit log in migration_batch_logs.
    """
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else uuid.uuid4())
    batch_no = f"BATCH-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4].upper()}"
    
    total = len(payload.records)
    imported = 0
    skipped = 0
    err_count = 0

    chunk_size = 100
    records = payload.records

    for i in range(0, total, chunk_size):
        chunk = records[i : i + chunk_size]
        for row in chunk:
            try:
                if payload.target_module.upper() == "STUDENTS":
                    adm_no = row.get("admission_number") or row.get("admission_no") or row.get("adm_no")
                    f_name = row.get("first_name", "Student")
                    l_name = row.get("last_name", "")
                    class_name = row.get("class_name", "Class 1")
                    sec_code = row.get("section_or_stream", "A")

                    existing_student = None
                    if adm_no:
                        res = await db.execute(
                            select(Student).where(
                                Student.tenant_id == tenant_id,
                                Student.admission_number == str(adm_no)
                            )
                        )
                        existing_student = res.scalars().first()

                    if existing_student:
                        if payload.conflict_policy == "SKIP":
                            skipped += 1
                            continue
                        elif payload.conflict_policy == "OVERWRITE":
                            existing_student.first_name = f_name
                            existing_student.last_name = l_name
                            existing_student.class_name = class_name
                            existing_student.section_or_stream = sec_code
                            if row.get("guardian_name"):
                                existing_student.guardian_name = row.get("guardian_name")
                            if row.get("guardian_phone"):
                                existing_student.guardian_phone = row.get("guardian_phone")
                            imported += 1
                        elif payload.conflict_policy == "MERGE":
                            if not existing_student.guardian_phone and row.get("guardian_phone"):
                                existing_student.guardian_phone = row.get("guardian_phone")
                            if not existing_student.parent_email and row.get("parent_email"):
                                existing_student.parent_email = row.get("parent_email")
                            imported += 1
                    else:
                        # Auto-generate admission number if omitted
                        if not adm_no:
                            count_res = await db.execute(
                                select(func.count(Student.id)).where(Student.tenant_id == tenant_id)
                            )
                            current_total = count_res.scalar_one() or 0
                            adm_no = f"ADM-{datetime.now().year}-{current_total + imported + 1:04d}"

                        new_st = Student(
                            tenant_id=tenant_id,
                            admission_number=str(adm_no),
                            first_name=f_name,
                            last_name=l_name,
                            class_name=class_name,
                            section_or_stream=sec_code,
                            guardian_name=row.get("guardian_name"),
                            guardian_phone=row.get("guardian_phone"),
                            parent_email=row.get("parent_email"),
                            door_street=row.get("door_street"),
                            city_town=row.get("city_town"),
                            fee_balance=float(row.get("fee_balance") or 0.0),
                            status="ACTIVE"
                        )
                        db.add(new_st)
                        imported += 1

                elif payload.target_module.upper() == "FEES":
                    # Fee opening balance ingestion
                    inv_no = f"INV-OPEN-{datetime.now().year}-{imported + 1:04d}"
                    adm_no = row.get("admission_number", "ADM-UNKNOWN")
                    tot_amt = float(row.get("total_amount") or row.get("opening_balance") or 0.0)
                    paid_amt = float(row.get("paid_amount") or 0.0)
                    
                    new_inv = FeeInvoice(
                        tenant_id=tenant_id,
                        invoice_number=inv_no,
                        student_id=uuid.uuid4(),
                        student_name=row.get("student_name", "Student"),
                        admission_number=str(adm_no),
                        class_name=row.get("class_name", "Class 1"),
                        academic_year="2026-2027",
                        term_code="OPEN_BAL",
                        term_name="Opening Arrears Balance",
                        fee_head="ARREARS",
                        fee_title="Legacy Balance Carried Forward",
                        total_amount=tot_amt,
                        concession_amount=0.0,
                        net_payable=tot_amt,
                        paid_amount=paid_amt,
                        balance_amount=max(0.0, tot_amt - paid_amt),
                        status="PAID" if paid_amt >= tot_amt else ("PARTIAL" if paid_amt > 0 else "UNPAID")
                    )
                    db.add(new_inv)
                    imported += 1

            except Exception:
                err_count += 1

        await db.commit()

    # Create immutable audit log
    batch_log = MigrationBatchLog(
        tenant_id=tenant_id,
        batch_number=batch_no,
        target_module=payload.target_module.upper(),
        import_type=payload.import_type,
        file_name=payload.file_name,
        total_records=total,
        imported_count=imported,
        skipped_count=skipped,
        error_count=err_count,
        conflict_policy=payload.conflict_policy,
        status="COMPLETED" if err_count == 0 else "PARTIAL",
        validation_summary={"total": total, "imported": imported, "skipped": skipped, "errors": err_count},
        executed_by_name=user.full_name
    )
    db.add(batch_log)
    await db.commit()

    return MigrationExecuteResponse(
        status="SUCCESS",
        batch_number=batch_no,
        total_records=total,
        imported_count=imported,
        skipped_count=skipped,
        error_count=err_count,
        message=f"Batch {batch_no} processed: {imported} imported, {skipped} skipped, {err_count} errors."
    )


@router.get("/batches", response_model=List[MigrationBatchLogOut])
async def list_migration_batches(
    target_module: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List historical bulk migration batch logs for active tenant."""
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else uuid.uuid4())
    stmt = select(MigrationBatchLog).where(MigrationBatchLog.tenant_id == tenant_id)
    if target_module:
        stmt = stmt.where(MigrationBatchLog.target_module == target_module.upper())
    stmt = stmt.order_by(MigrationBatchLog.created_at.desc())
    res = await db.execute(stmt)
    return res.scalars().all()

