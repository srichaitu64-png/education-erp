import uuid
from datetime import date, datetime, timezone
from math import isfinite
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db, get_current_tenant_id
from app.security.deps import get_current_user, require_permission
from app.modules.identity.models import User
from app.modules.migration.models import MigrationBatchLog
from app.modules.migration.schemas import (
    MigrationValidateRequest,
    MigrationValidateResponse,
    MigrationExecuteRequest,
    MigrationExecuteResponse,
    MigrationBatchLogOut,
)
from app.modules.academic.models import Student
from app.modules.finance.models import FeeInvoice

router = APIRouter(prefix="/migration", tags=["Data Migration & Bulk Ingestion Engine"])

SUPPORTED_IMPORT_MODULES = {"STUDENTS", "FEES"}
ALLOWED_CONFLICT_POLICIES = {"SKIP", "OVERWRITE", "MERGE"}


def require_migration_tenant_id() -> uuid.UUID:
    """Require an explicitly authenticated institution context; never infer a tenant."""
    tenant_id = get_current_tenant_id()
    if tenant_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="An active institution context is required for data migration.",
        )
    return tenant_id


def _normalise_module(value: str) -> str:
    module = (value or "").strip().upper()
    if module not in SUPPORTED_IMPORT_MODULES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Import for '{module or 'UNKNOWN'}' is not implemented. Supported modules: STUDENTS, FEES.",
        )
    return module


TEMPLATE_HEADERS = {
    "STUDENTS": [
        "admission_number", "first_name", "middle_name", "last_name", "class_name",
        "section_or_stream", "date_of_birth", "gender", "father_name", "mother_name",
        "guardian_name", "father_mobile", "mother_mobile", "guardian_phone", "parent_email",
        "door_street", "city_town", "district_state", "pincode",
    ],
    "FEES": [
        "admission_number", "student_name", "class_name", "academic_year", "term_code",
        "term_name", "fee_head", "fee_title", "total_amount", "paid_amount", "due_date",
    ],
    "STAFF": ["employee_code", "full_name", "email", "phone", "department", "designation", "duty_role"],
    "ATTENDANCE": ["attendance_date", "admission_number", "class_name", "section_code", "status", "absence_reason"],
    "EXAMINATIONS": ["exam_code", "exam_name", "category", "target_class", "subject_code", "subject_name", "exam_date", "max_marks"],
}


@router.get("/templates/{module}")
async def download_migration_template(module: str):
    """Download a CSV header template. Template availability does not imply import support."""
    mod_key = (module or "").strip().upper()
    headers = TEMPLATE_HEADERS.get(mod_key)
    if not headers:
        raise HTTPException(status_code=400, detail=f"Unsupported template '{module}'.")
    csv_content = ",".join(headers) + "\n"
    sample_rows = {
        "STUDENTS": "ADM-2026-0101,Rohan,,Sharma,Class 10,A,2010-05-15,MALE,Ramesh Sharma,Sunita Sharma,Ramesh Sharma,9876500001,9876500002,9876500003,parent@example.com,42 MG Road,Bengaluru,Bengaluru,560001",
        "FEES": "ADM-2026-0101,Rohan Sharma,Class 10,2026-2027,TERM_1,Term 1,TUITION,Tuition Fee,35000,0,2026-07-31",
        "STAFF": "EMP-101,Dr Savita Rao,savita@example.edu.in,9876500000,Academics,Senior Lecturer,SUBJECT_TEACHER",
        "ATTENDANCE": "2026-11-07,ADM-2026-0101,Class 10,A,PRESENT,",
        "EXAMINATIONS": "EXAM-10-MATH,Mid-Term Assessment,unit_test,Class 10,MATH-10,Mathematics,2026-11-20,100",
    }
    csv_content += sample_rows[mod_key] + "\n"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=EducationOS_{mod_key}_Template.csv"},
    )


async def _validate_records(
    module: str,
    records: list[dict],
    tenant_id: uuid.UUID,
    db: AsyncSession,
    conflict_policy: str = "SKIP",
) -> tuple[list[dict], list[dict]]:
    errors: list[dict] = []
    duplicates: list[dict] = []
    seen_admission_numbers: set[str] = set()

    for index, row in enumerate(records):
        row_num = index + 1
        if module == "STUDENTS":
            first_name = str(row.get("first_name") or "").strip()
            last_name = str(row.get("last_name") or "").strip()
            class_name = str(row.get("class_name") or "").strip()
            admission_number = str(
                row.get("admission_number") or row.get("admission_no") or row.get("adm_no") or ""
            ).strip()

            existing = None
            if admission_number:
                if admission_number in seen_admission_numbers:
                    errors.append({"row": row_num, "field": "admission_number", "message": "Duplicate admission number within this file."})
                seen_admission_numbers.add(admission_number)
                result = await db.execute(
                    select(Student).where(
                        Student.tenant_id == tenant_id,
                        Student.admission_number == admission_number,
                    )
                )
                existing = result.scalars().first()
                if existing:
                    duplicates.append({
                        "row": row_num,
                        "admission_number": admission_number,
                        "existing_student_name": f"{existing.first_name} {existing.last_name}",
                        "candidate_student_name": f"{first_name} {last_name}",
                        "match_type": "EXACT",
                        "existing_id": str(existing.id),
                    })

            # MERGE accepts sparse rows because only empty fields on an existing
            # student are filled. New students and overwrite rows need full identity.
            needs_full_identity = not (existing and conflict_policy == "MERGE")
            if needs_full_identity:
                if not first_name:
                    errors.append({"row": row_num, "field": "first_name", "message": "First name is mandatory."})
                if not last_name:
                    errors.append({"row": row_num, "field": "last_name", "message": "Last name is mandatory."})
                if not class_name:
                    errors.append({"row": row_num, "field": "class_name", "message": "Class is mandatory."})

            dob = row.get("date_of_birth")
            if dob:
                try:
                    date.fromisoformat(str(dob))
                except ValueError:
                    errors.append({"row": row_num, "field": "date_of_birth", "message": "Use YYYY-MM-DD."})

        elif module == "FEES":
            admission_number = str(row.get("admission_number") or "").strip()
            if not admission_number:
                errors.append({"row": row_num, "field": "admission_number", "message": "Admission number is mandatory."})
                continue

            student_result = await db.execute(
                select(Student).where(
                    Student.tenant_id == tenant_id,
                    Student.admission_number == admission_number,
                )
            )
            student = student_result.scalars().first()
            if student is None:
                errors.append({"row": row_num, "field": "admission_number", "message": "No student with this admission number exists in the active institution."})
                continue

            academic_year = str(row.get("academic_year") or "").strip()
            term_code = str(row.get("term_code") or "").strip()
            fee_head = str(row.get("fee_head") or "").strip()
            if academic_year and term_code and fee_head:
                invoice_result = await db.execute(
                    select(FeeInvoice).where(
                        FeeInvoice.tenant_id == tenant_id,
                        FeeInvoice.student_id == student.id,
                        FeeInvoice.academic_year == academic_year,
                        FeeInvoice.term_code == term_code,
                        FeeInvoice.fee_head == fee_head,
                    )
                )
                existing_invoice = invoice_result.scalars().first()
                if existing_invoice:
                    duplicates.append({
                        "row": row_num,
                        "admission_number": admission_number,
                        "existing_invoice_id": str(existing_invoice.id),
                        "match_type": "FEE_LEDGER_KEY",
                    })

            try:
                total_amount = float(row.get("total_amount") or row.get("opening_balance") or 0)
                paid_amount = float(row.get("paid_amount") or 0)
                if not isfinite(total_amount) or total_amount <= 0:
                    raise ValueError
                if not isfinite(paid_amount) or paid_amount < 0 or paid_amount > total_amount:
                    raise ValueError
            except (TypeError, ValueError):
                errors.append({"row": row_num, "field": "amounts", "message": "Amounts must be finite; total must be positive and paid must be between zero and total."})

            try:
                date.fromisoformat(str(row.get("due_date") or ""))
            except ValueError:
                errors.append({"row": row_num, "field": "due_date", "message": "A valid due_date in YYYY-MM-DD format is mandatory."})

            for field in ("academic_year", "term_code", "term_name", "fee_head", "fee_title"):
                if not str(row.get(field) or "").strip():
                    errors.append({"row": row_num, "field": field, "message": f"{field} is mandatory for fee ledger imports."})

    return errors, duplicates


@router.post("/validate", response_model=MigrationValidateResponse)
async def validate_migration_dataset(
    payload: MigrationValidateRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    tenant_id = require_migration_tenant_id()
    module = _normalise_module(payload.target_module)
    permission_code = "students.create" if module == "STUDENTS" else "fees.reconcile"
    await require_permission(permission_code)(user)
    errors, duplicates = await _validate_records(module, payload.records, tenant_id, db)
    clean_count = max(0, len(payload.records) - len(duplicates) - len(errors))
    return MigrationValidateResponse(
        is_valid=len(errors) == 0,
        total_records=len(payload.records),
        clean_records_count=clean_count,
        duplicate_candidates_count=len(duplicates),
        errors_count=len(errors),
        duplicate_candidates=duplicates,
        errors=errors,
        column_mappings=[
            {"field": key, "sample": value}
            for key, value in (payload.records[0].items() if payload.records else [])
        ],
    )


@router.post("/execute", response_model=MigrationExecuteResponse, status_code=status.HTTP_201_CREATED)
async def execute_bulk_migration(
    payload: MigrationExecuteRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Import validated student masters or fee opening balances in one DB transaction."""
    tenant_id = require_migration_tenant_id()
    module = _normalise_module(payload.target_module)
    permission_code = "students.create" if module == "STUDENTS" else "fees.reconcile"
    await require_permission(permission_code)(user)
    conflict_policy = (payload.conflict_policy or "SKIP").strip().upper()
    if conflict_policy not in ALLOWED_CONFLICT_POLICIES:
        raise HTTPException(status_code=422, detail="conflict_policy must be SKIP, OVERWRITE, or MERGE.")

    errors, duplicates = await _validate_records(module, payload.records, tenant_id, db, conflict_policy)
    if errors:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"message": "Import validation failed; no records were written.", "errors": errors},
        )
    if module == "FEES" and duplicates and conflict_policy != "SKIP":
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Existing fee invoices are not overwritten or merged by bulk import. Use SKIP and reconcile the ledger separately.",
        )

    batch_no = f"BATCH-{datetime.now(timezone.utc):%Y%m%d%H%M%S}-{uuid.uuid4().hex[:8].upper()}"
    imported = 0
    skipped = 0
    duplicate_rows = {item["row"] for item in duplicates}

    for index, row in enumerate(payload.records, start=1):
        if index in duplicate_rows and conflict_policy == "SKIP":
            skipped += 1
            continue

        if module == "STUDENTS":
            admission_number = str(
                row.get("admission_number") or row.get("admission_no") or row.get("adm_no") or ""
            ).strip()
            existing_result = None
            if admission_number:
                existing_result = await db.execute(
                    select(Student).where(
                        Student.tenant_id == tenant_id,
                        Student.admission_number == admission_number,
                    )
                )
            existing = existing_result.scalars().first() if existing_result is not None else None

            if existing:
                if conflict_policy == "OVERWRITE":
                    for field in (
                        "first_name", "middle_name", "last_name", "class_name", "section_or_stream",
                        "guardian_name", "guardian_phone", "parent_email", "door_street", "city_town",
                    ):
                        if field in row:
                            setattr(existing, field, row.get(field) or None)
                elif conflict_policy == "MERGE":
                    for field in (
                        "middle_name", "guardian_name", "guardian_phone", "parent_email",
                        "door_street", "city_town", "district_state", "pincode",
                    ):
                        if not getattr(existing, field) and row.get(field):
                            setattr(existing, field, row[field])
                imported += 1
                continue

            if not admission_number:
                count_result = await db.execute(
                    select(func.count(Student.id)).where(Student.tenant_id == tenant_id)
                )
                admission_number = f"ADM-{date.today().year}-{(count_result.scalar_one() or 0) + imported + 1:06d}"

            dob_value = row.get("date_of_birth")
            db.add(Student(
                tenant_id=tenant_id,
                admission_number=admission_number,
                first_name=str(row["first_name"]).strip(),
                middle_name=(str(row.get("middle_name")).strip() or None) if row.get("middle_name") else None,
                last_name=str(row["last_name"]).strip(),
                date_of_birth=date.fromisoformat(str(dob_value)) if dob_value else None,
                gender=row.get("gender") or None,
                father_name=row.get("father_name") or None,
                mother_name=row.get("mother_name") or None,
                guardian_name=row.get("guardian_name") or None,
                father_mobile=row.get("father_mobile") or None,
                mother_mobile=row.get("mother_mobile") or None,
                guardian_phone=row.get("guardian_phone") or None,
                parent_email=row.get("parent_email") or None,
                door_street=row.get("door_street") or None,
                city_town=row.get("city_town") or None,
                district_state=row.get("district_state") or None,
                pincode=row.get("pincode") or None,
                class_name=str(row["class_name"]).strip(),
                section_or_stream=str(row.get("section_or_stream") or "A").strip(),
                status="ACTIVE",
            ))
            imported += 1

        elif module == "FEES":
            admission_number = str(row["admission_number"]).strip()
            student_result = await db.execute(
                select(Student).where(
                    Student.tenant_id == tenant_id,
                    Student.admission_number == admission_number,
                )
            )
            student = student_result.scalars().first()
            if student is None:
                raise HTTPException(status_code=422, detail=f"Student {admission_number} was not found; no fee invoice was written.")

            total_amount = float(row.get("total_amount") or row.get("opening_balance") or 0)
            paid_amount = float(row.get("paid_amount") or 0)
            balance = total_amount - paid_amount
            db.add(FeeInvoice(
                tenant_id=tenant_id,
                invoice_number=f"IMP-{uuid.uuid4().hex[:20].upper()}",
                student_id=student.id,
                student_name=student.full_name,
                admission_number=student.admission_number,
                class_name=student.class_name,
                section_or_stream=student.section_or_stream,
                academic_year=str(row["academic_year"]).strip(),
                term_code=str(row["term_code"]).strip(),
                term_name=str(row["term_name"]).strip(),
                fee_head=str(row["fee_head"]).strip(),
                fee_title=str(row["fee_title"]).strip(),
                total_amount=total_amount,
                concession_amount=0.0,
                net_payable=total_amount,
                paid_amount=paid_amount,
                balance_amount=balance,
                due_date=date.fromisoformat(str(row["due_date"])),
                status="PAID" if balance == 0 else ("PARTIAL" if paid_amount > 0 else "UNPAID"),
            ))
            imported += 1

    log = MigrationBatchLog(
        tenant_id=tenant_id,
        batch_number=batch_no,
        target_module=module,
        import_type=payload.import_type,
        file_name=payload.file_name,
        total_records=len(payload.records),
        imported_count=imported,
        skipped_count=skipped,
        error_count=0,
        conflict_policy=conflict_policy,
        status="COMPLETED",
        validation_summary={
            "total": len(payload.records),
            "imported": imported,
            "skipped": skipped,
            "errors": 0,
            "module": module,
        },
        executed_by_name=user.full_name,
    )
    db.add(log)
    await db.commit()

    return MigrationExecuteResponse(
        status="SUCCESS",
        batch_number=batch_no,
        total_records=len(payload.records),
        imported_count=imported,
        skipped_count=skipped,
        error_count=0,
        message=f"Batch {batch_no} processed: {imported} imported, {skipped} skipped, 0 errors.",
    )


@router.get("/batches", response_model=List[MigrationBatchLogOut])
async def list_migration_batches(
    target_module: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    tenant_id = require_migration_tenant_id()
    if target_module:
        module = _normalise_module(target_module)
        permission_code = "students.view" if module == "STUDENTS" else "fees.view"
        await require_permission(permission_code)(user)
    elif not user.is_superadmin and not any(
        permission.code in {"students.view", "fees.view"}
        for user_role in user.roles
        for permission in user_role.role.permissions
        if user_role.tenant_id == tenant_id
    ):
        raise HTTPException(status_code=403, detail="Missing required permission to view migration history.")

    stmt = select(MigrationBatchLog).where(MigrationBatchLog.tenant_id == tenant_id)
    if target_module:
        stmt = stmt.where(MigrationBatchLog.target_module == target_module.upper())
    stmt = stmt.order_by(MigrationBatchLog.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()
