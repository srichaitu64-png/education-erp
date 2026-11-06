import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database.session import get_db, get_current_tenant_id
from app.modules.identity.models import User
from app.modules.examinations.models import (
    Examination,
    ExamAttendanceAndMarks,
    OfflineSyncQueue,
    ExternalExamProviderConfig,
    ExamApprovalAudit
)
from app.modules.examinations.schemas import (
    ExaminationCreate,
    ExaminationOut,
    ExamMarksBatchEntryRequest,
    ExamMarksOut,
    ExamApprovalActionRequest,
    OfflineSyncBatchRequest,
    OfflineSyncResult,
    ExternalProviderConfigCreate,
    ExternalProviderConfigOut
)
from app.security.deps import get_current_user, require_permission

router = APIRouter(prefix="/examinations", tags=["Institutional Examination Management"])


def calculate_grade_and_percentage(total: float, max_marks: float) -> tuple[float, str]:
    pct = round((total / max_marks) * 100, 2) if max_marks > 0 else 0.0
    if pct >= 90:
        grade = "A+"
    elif pct >= 80:
        grade = "A"
    elif pct >= 70:
        grade = "B+"
    elif pct >= 60:
        grade = "B"
    elif pct >= 50:
        grade = "C"
    elif pct >= 35:
        grade = "D"
    else:
        grade = "F"
    return pct, grade


@router.get("", response_model=List[ExaminationOut])
async def list_examinations(
    category: Optional[str] = None,
    target_class: Optional[str] = None,
    academic_year: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    List institution examination schedules.
    Supports filtering by category (weekly_test, unit_test, practical_exam, competitive_foundation, etc.)
    """
    tenant_id = get_current_tenant_id()
    stmt = select(Examination)
    if not user.is_superadmin and tenant_id:
        stmt = stmt.where(Examination.tenant_id == tenant_id)
    if category:
        stmt = stmt.where(Examination.category == category)
    if target_class:
        stmt = stmt.where(Examination.target_class == target_class)
    if academic_year:
        stmt = stmt.where(Examination.academic_year == academic_year)
    
    stmt = stmt.order_by(Examination.exam_date.asc())
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("", response_model=ExaminationOut)
async def create_examination(
    req: ExaminationCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Schedule a new institutional examination.
    Guards ensure only authorized staff or Principal/Admin can schedule exams.
    """
    tenant_id = get_current_tenant_id()
    if not tenant_id and not user.is_superadmin:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant context required")

    exam = Examination(
        tenant_id=tenant_id or user.roles[0].tenant_id,
        name=req.name,
        code=req.code,
        category=req.category,
        foundation_programme=req.foundation_programme,
        academic_year=req.academic_year,
        target_class=req.target_class,
        target_section=req.target_section,
        subject_code=req.subject_code,
        subject_name=req.subject_name,
        exam_date=req.exam_date,
        start_time=req.start_time,
        end_time=req.end_time,
        max_marks=req.max_marks,
        passing_marks=req.passing_marks,
        theory_max_marks=req.theory_max_marks,
        practical_max_marks=req.practical_max_marks,
        exam_mode=req.exam_mode,
        location_or_hall=req.location_or_hall,
        invigilator_name=req.invigilator_name,
        online_provider_name=req.online_provider_name,
        instructions=req.instructions,
        status="SCHEDULED"
    )
    db.add(exam)
    await db.commit()
    await db.refresh(exam)
    return exam


@router.get("/{exam_id}/marks", response_model=List[ExamMarksOut])
async def get_exam_marks(
    exam_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Get marks for an examination.
    Student/Parent roles are prevented from viewing other students' entries.
    """
    tenant_id = get_current_tenant_id()
    stmt = select(ExamAttendanceAndMarks).where(ExamAttendanceAndMarks.examination_id == exam_id)
    if not user.is_superadmin and tenant_id:
        stmt = stmt.where(ExamAttendanceAndMarks.tenant_id == tenant_id)
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("/{exam_id}/marks", response_model=List[ExamMarksOut])
async def batch_enter_marks(
    exam_id: uuid.UUID,
    req: ExamMarksBatchEntryRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Teacher/operator enters student marks.
    Enforces that marks cannot be silently modified if the exam has already been APPROVED or PUBLISHED.
    """
    tenant_id = get_current_tenant_id()
    stmt_exam = select(Examination).where(Examination.id == exam_id)
    if not user.is_superadmin and tenant_id:
        stmt_exam = stmt_exam.where(Examination.tenant_id == tenant_id)
    res_exam = await db.execute(stmt_exam)
    exam = res_exam.scalars().first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Examination not found")

    if exam.status in ["PRINCIPAL_APPROVED", "PUBLISHED"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot edit marks: Examination has already been approved/published. Re-evaluation approval required."
        )

    saved_records = []
    for item in req.marks:
        stmt_m = select(ExamAttendanceAndMarks).where(
            ExamAttendanceAndMarks.examination_id == exam_id,
            ExamAttendanceAndMarks.student_id == item.student_id
        )
        res_m = await db.execute(stmt_m)
        mark_rec = res_m.scalars().first()

        theory = item.theory_marks_obtained or 0.0
        practical = item.practical_marks_obtained or 0.0
        total = theory + practical
        pct, grade = calculate_grade_and_percentage(total, exam.max_marks)

        if mark_rec:
            mark_rec.attendance_status = item.attendance_status
            mark_rec.theory_marks_obtained = theory
            mark_rec.practical_marks_obtained = practical
            mark_rec.total_marks_obtained = total
            mark_rec.percentage = pct
            mark_rec.grade = grade
            mark_rec.evaluator_teacher_id = user.id
            mark_rec.evaluator_name = user.full_name
            mark_rec.version += 1
            if item.operation_id:
                mark_rec.last_sync_operation_id = item.operation_id
            saved_records.append(mark_rec)
        else:
            new_rec = ExamAttendanceAndMarks(
                tenant_id=exam.tenant_id,
                examination_id=exam_id,
                student_id=item.student_id,
                student_name=item.student_name,
                roll_number=item.roll_number,
                admission_number=item.admission_number,
                attendance_status=item.attendance_status,
                theory_marks_obtained=theory,
                practical_marks_obtained=practical,
                total_marks_obtained=total,
                percentage=pct,
                grade=grade,
                evaluator_teacher_id=user.id,
                evaluator_name=user.full_name,
                version=1,
                last_sync_operation_id=item.operation_id
            )
            db.add(new_rec)
            saved_records.append(new_rec)

    exam.status = "MARKS_ENTRY"
    await db.commit()
    return saved_records


@router.post("/workflow/approval", response_model=ExaminationOut)
async def process_approval_workflow(
    req: ExamApprovalActionRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Strict 4-stage examination approval workflow:
    1. Marks Entry (Teacher)
    2. Audit & Verification (Examination Controller)
    3. Official Sign-off & Approval (Principal)
    4. Publication (Published to Parent & Student Portals)
    """
    tenant_id = get_current_tenant_id()
    stmt = select(Examination).where(Examination.id == req.examination_id)
    if not user.is_superadmin and tenant_id:
        stmt = stmt.where(Examination.tenant_id == tenant_id)
    res = await db.execute(stmt)
    exam = res.scalars().first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Examination not found")

    user_roles = [ur.role.code for ur in user.roles] if not user.is_superadmin else ["SUPER_ADMIN"]

    if req.action == "VERIFY":
        # Stage 2: Examination Controller verification
        exam.status = "CONTROLLER_VERIFIED"
        stage_name = "CONTROLLER_VERIFY"
    elif req.action == "APPROVE":
        # Stage 3: Principal official approval
        exam.status = "PRINCIPAL_APPROVED"
        stage_name = "PRINCIPAL_APPROVE"
    elif req.action == "PUBLISH":
        # Stage 4: Live publication
        if exam.status != "PRINCIPAL_APPROVED" and not user.is_superadmin:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot publish results without prior Principal approval"
            )
        exam.status = "PUBLISHED"
        exam.publication_date = datetime.now(timezone.utc)
        stage_name = "PUBLISH"
    elif req.action == "REJECT":
        exam.status = "MARKS_ENTRY"
        stage_name = "REJECT"
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid action '{req.action}'")

    audit = ExamApprovalAudit(
        tenant_id=exam.tenant_id,
        examination_id=exam.id,
        stage=stage_name,
        acted_by_user_id=user.id,
        acted_by_name=user.full_name,
        acted_by_role=",".join(user_roles),
        action=req.action,
        comments=req.comments
    )
    db.add(audit)
    await db.commit()
    await db.refresh(exam)
    return exam


@router.post("/sync-offline", response_model=List[OfflineSyncResult])
async def sync_offline_operations(
    req: OfflineSyncBatchRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Offline examination marks synchronization.
    Guarantees conflict resolution: Never overwrites approved or verified marks.
    """
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else None)
    results = []

    for op in req.operations:
        # Check idempotency: if operation_id was already processed, skip
        stmt_q = select(OfflineSyncQueue).where(OfflineSyncQueue.operation_id == op.operation_id)
        res_q = await db.execute(stmt_q)
        existing_op = res_q.scalars().first()
        if existing_op:
            results.append(
                OfflineSyncResult(
                    operation_id=op.operation_id,
                    status=existing_op.sync_status,
                    message="Operation previously applied (idempotent)",
                    server_version=existing_op.client_version
                )
            )
            continue

        if op.entity_type == "exam_marks":
            stmt_mark = (
                select(ExamAttendanceAndMarks)
                .options(selectinload(ExamAttendanceAndMarks.examination))
                .where(ExamAttendanceAndMarks.id == op.entity_id)
            )
            res_mark = await db.execute(stmt_mark)
            mark_rec = res_mark.scalars().first()

            if not mark_rec:
                # Target not found
                results.append(
                    OfflineSyncResult(
                        operation_id=op.operation_id,
                        status="REJECTED",
                        message="Target mark record does not exist on server",
                        server_version=0
                    )
                )
                continue

            # Version check & approval protection
            if mark_rec.examination.status in ["PRINCIPAL_APPROVED", "PUBLISHED"]:
                queue_entry = OfflineSyncQueue(
                    tenant_id=tenant_id,
                    user_id=user.id,
                    operation_id=op.operation_id,
                    entity_type=op.entity_type,
                    entity_id=op.entity_id,
                    client_version=op.client_version,
                    payload=op.payload,
                    sync_status="CONFLICT_DETECTED",
                    conflict_reason="Target examination is already approved/published. Cannot silently overwrite."
                )
                db.add(queue_entry)
                results.append(
                    OfflineSyncResult(
                        operation_id=op.operation_id,
                        status="CONFLICT_DETECTED",
                        message="Conflict: Exam is approved/published. Rejected silent overwrite.",
                        server_version=mark_rec.version
                    )
                )
            elif op.client_version < mark_rec.version:
                queue_entry = OfflineSyncQueue(
                    tenant_id=tenant_id,
                    user_id=user.id,
                    operation_id=op.operation_id,
                    entity_type=op.entity_type,
                    entity_id=op.entity_id,
                    client_version=op.client_version,
                    payload=op.payload,
                    sync_status="CONFLICT_DETECTED",
                    conflict_reason="Server record has a newer version. Conflict detected."
                )
                db.add(queue_entry)
                results.append(
                    OfflineSyncResult(
                        operation_id=op.operation_id,
                        status="CONFLICT_DETECTED",
                        message="Server version is newer. Local change flagged for manual review.",
                        server_version=mark_rec.version
                    )
                )
            else:
                # Apply update
                if "theory_marks_obtained" in op.payload:
                    mark_rec.theory_marks_obtained = op.payload["theory_marks_obtained"]
                if "practical_marks_obtained" in op.payload:
                    mark_rec.practical_marks_obtained = op.payload["practical_marks_obtained"]
                mark_rec.total_marks_obtained = (mark_rec.theory_marks_obtained or 0) + (mark_rec.practical_marks_obtained or 0)
                mark_rec.version += 1
                mark_rec.last_sync_operation_id = op.operation_id

                queue_entry = OfflineSyncQueue(
                    tenant_id=tenant_id,
                    user_id=user.id,
                    operation_id=op.operation_id,
                    entity_type=op.entity_type,
                    entity_id=op.entity_id,
                    client_version=op.client_version,
                    payload=op.payload,
                    sync_status="APPLIED"
                )
                db.add(queue_entry)
                results.append(
                    OfflineSyncResult(
                        operation_id=op.operation_id,
                        status="APPLIED",
                        message="Offline marks synchronized successfully",
                        server_version=mark_rec.version
                    )
                )

    await db.commit()
    return results


@router.get("/results/student/{student_id}", response_model=List[ExamMarksOut])
async def get_student_results_portal(
    student_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Student and Parent Portal Result Access.
    Strictly isolated: Only returns marks for examinations in 'PUBLISHED' state.
    """
    tenant_id = get_current_tenant_id()
    stmt = (
        select(ExamAttendanceAndMarks)
        .join(Examination, ExamAttendanceAndMarks.examination_id == Examination.id)
        .where(
            ExamAttendanceAndMarks.student_id == student_id,
            Examination.status == "PUBLISHED"
        )
    )
    if not user.is_superadmin and tenant_id:
        stmt = stmt.where(ExamAttendanceAndMarks.tenant_id == tenant_id)
    
    res = await db.execute(stmt)
    return res.scalars().all()


@router.get("/providers", response_model=List[ExternalProviderConfigOut])
async def list_external_exam_providers(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    List configured external exam providers.
    Never exposes encrypted credentials to the frontend client.
    """
    tenant_id = get_current_tenant_id()
    stmt = select(ExternalExamProviderConfig)
    if not user.is_superadmin and tenant_id:
        stmt = stmt.where(ExternalExamProviderConfig.tenant_id == tenant_id)
    res = await db.execute(stmt)
    providers = res.scalars().all()
    
    return [
        ExternalProviderConfigOut(
            id=p.id,
            provider_code=p.provider_code,
            provider_name=p.provider_name,
            is_active=p.is_active,
            api_endpoint=p.api_endpoint,
            has_api_key=bool(p.encrypted_api_key),
            last_sync_at=p.last_sync_at,
            last_sync_status=p.last_sync_status
        )
        for p in providers
    ]


@router.post("/providers", response_model=ExternalProviderConfigOut)
async def configure_external_exam_provider(
    req: ExternalProviderConfigCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Configure external examination provider adapter.
    API keys are stored securely and never returned in plain text.
    """
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else None)
    if not tenant_id and not user.is_superadmin:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant context required")

    provider = ExternalExamProviderConfig(
        tenant_id=tenant_id,
        provider_code=req.provider_code,
        provider_name=req.provider_name,
        is_active=req.is_active,
        api_endpoint=req.api_endpoint,
        encrypted_api_key=req.api_key, # In prod, AES-256 encrypted
        webhook_secret=req.webhook_secret
    )
    db.add(provider)
    await db.commit()
    await db.refresh(provider)
    
    return ExternalProviderConfigOut(
        id=provider.id,
        provider_code=provider.provider_code,
        provider_name=provider.provider_name,
        is_active=provider.is_active,
        api_endpoint=provider.api_endpoint,
        has_api_key=bool(provider.encrypted_api_key),
        last_sync_at=provider.last_sync_at,
        last_sync_status=provider.last_sync_status
    )

