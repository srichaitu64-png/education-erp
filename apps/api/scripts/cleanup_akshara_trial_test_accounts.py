#!/usr/bin/env python3
"""Safely disable only the known, seeded Akshara trial principal test accounts.

This is a dry-run by default. It never deletes the Akshara tenant, Chairman,
subscription, campus, academic configuration, or student records. Unknown users
are reported for manual review and are never modified by this script.
"""
import argparse
import asyncio
from sqlalchemy import select, delete

from app.database.session import AsyncSessionLocal
from app.database.session import set_current_tenant_id
from app.modules.tenants.models import Tenant
from app.modules.identity.models import User, UserRole

TENANT_CODE = "akshara-trial"
PRESERVED_CHAIRMAN = "chairman@akshara-trial.edu.in"
KNOWN_SEEDED_TEST_USERS = {
    "school.principal@akshara-trial.edu.in",
    "pu.principal@akshara-trial.edu.in",
}
CONFIRMATION = "AKSHARA-TRIAL-STAFF-CLEANUP"


async def run(apply: bool) -> None:
    async with AsyncSessionLocal() as db:
        tenant = (
            await db.execute(select(Tenant).where(Tenant.code == TENANT_CODE))
        ).scalars().first()
        if tenant is None:
            print(f"No {TENANT_CODE!r} tenant exists. Nothing to change.")
            return

        await db.set_rls_context(tenant.id, is_superadmin=False)
        print(f"Akshara pilot: {tenant.name} ({tenant.code})")
        print(f"Preserved Chairman identity: {PRESERVED_CHAIRMAN}")

        users = (
            await db.execute(
                select(User).where(User.email.in_(KNOWN_SEEDED_TEST_USERS))
            )
        ).scalars().all()

        for user in users:
            assignments = (
                await db.execute(
                    select(UserRole).where(
                        UserRole.user_id == user.id,
                        UserRole.tenant_id == tenant.id,
                    )
                )
            ).scalars().all()
            if not assignments:
                print(f"NO ACTION: {user.email} has no role assignment in this tenant.")
                continue
            print(
                f"{'WOULD DISABLE' if apply else 'DRY RUN'}: {user.email}; "
                f"remove {len(assignments)} Akshara role assignment(s), "
                "deactivate only if no other role assignments remain."
            )
            if not apply:
                continue

            await db.execute(
                delete(UserRole).where(
                    UserRole.user_id == user.id,
                    UserRole.tenant_id == tenant.id,
                )
            )
            remaining = (
                await db.execute(
                    select(UserRole.id).where(UserRole.user_id == user.id)
                )
            ).scalars().first()
            if remaining is None:
                user.is_active = False
                user.must_change_password = True

        # Never modify the Chairman identity or any tenant-level data.
        chairman = (
            await db.execute(select(User).where(User.email == PRESERVED_CHAIRMAN))
        ).scalars().first()
        if chairman is None:
            print("WARNING: Chairman account was not found; no substitute account was created.")
        else:
            chairman_assignment = (
                await db.execute(
                    select(UserRole.id).where(
                        UserRole.user_id == chairman.id,
                        UserRole.tenant_id == tenant.id,
                    )
                )
            ).scalars().first()
            print(f"Chairman account preserved; tenant role present: {bool(chairman_assignment)}")

        if apply:
            await db.commit()
            print("Cleanup applied. Tenant, Chairman, subscription, campus and configuration were preserved.")
        else:
            await db.rollback()
            print("Dry run only. No database changes were committed.")

        set_current_tenant_id(None)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="Apply the narrowly scoped account cleanup.")
    parser.add_argument("--backup-confirmed", action="store_true", help="Confirm that a database backup exists.")
    parser.add_argument("--confirm", default="", help=f"Required confirmation phrase: {CONFIRMATION}")
    args = parser.parse_args()

    if args.apply:
        if not args.backup_confirmed or args.confirm != CONFIRMATION:
            parser.error(
                f"Applying cleanup requires --backup-confirmed and --confirm {CONFIRMATION}"
            )
    asyncio.run(run(args.apply))


if __name__ == "__main__":
    main()
