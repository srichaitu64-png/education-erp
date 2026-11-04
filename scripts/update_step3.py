import sys

path = 'apps/web/src/store/demoStore.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update initialRolePermissions
old_init_perms = """const initialRolePermissions: Record<UserRoleType, Record<FineGrainedAction, boolean>> = {
  SUPER_ADMIN: {
    view: true, create: true, edit: true, delete: true, archive: true, submit: true,
    verify: true, approve: true, reject: true, publish: true, export: true, print: true,
    assign: true, collect: true, refund: true, reconcile: true, configure: true,
    manage_users: true, manage_permissions: true
  },"""

new_init_perms = """const initialRolePermissions: Record<UserRoleType, Record<FineGrainedAction, boolean>> = {
  SUPER_ADMIN: {
    view: true, create: true, edit: true, delete: true, archive: true, submit: true,
    verify: true, approve: true, reject: true, publish: true, export: true, print: true,
    assign: true, collect: true, refund: true, reconcile: true, configure: true,
    manage_users: true, manage_permissions: true
  },
  CHAIRMAN_DIRECTOR: {
    view: true, create: true, edit: true, delete: true, archive: true, submit: true,
    verify: true, approve: true, reject: true, publish: true, export: true, print: true,
    assign: true, collect: true, refund: true, reconcile: true, configure: true,
    manage_users: true, manage_permissions: true
  },
  DIRECTOR: {
    view: true, create: true, edit: true, delete: false, archive: true, submit: true,
    verify: true, approve: true, reject: true, publish: true, export: true, print: true,
    assign: true, collect: true, refund: true, reconcile: true, configure: true,
    manage_users: true, manage_permissions: true
  },
  MANAGING_DIRECTOR: {
    view: true, create: true, edit: true, delete: false, archive: true, submit: true,
    verify: true, approve: true, reject: true, publish: true, export: true, print: true,
    assign: true, collect: true, refund: true, reconcile: true, configure: true,
    manage_users: true, manage_permissions: true
  },
  TRUSTEE: {
    view: true, create: false, edit: false, delete: false, archive: false, submit: false,
    verify: true, approve: true, reject: false, publish: false, export: true, print: true,
    assign: false, collect: false, refund: false, reconcile: true, configure: false,
    manage_users: false, manage_permissions: false
  },"""

content = content.replace(old_init_perms, new_init_perms)

old_init_perms_end = """  TRANSPORT_MANAGER: {
    view: true, create: true, edit: true, delete: false, archive: false, submit: true,
    verify: true, approve: false, reject: false, publish: false, export: true, print: true,
    assign: true, collect: false, refund: false, reconcile: false, configure: true,
    manage_users: false, manage_permissions: false
  },
};"""

new_init_perms_end = """  TRANSPORT_MANAGER: {
    view: true, create: true, edit: true, delete: false, archive: false, submit: true,
    verify: true, approve: false, reject: false, publish: false, export: true, print: true,
    assign: true, collect: false, refund: false, reconcile: false, configure: true,
    manage_users: false, manage_permissions: false
  },
  ADMISSION_OFFICER: {
    view: true, create: true, edit: true, delete: false, archive: false, submit: true,
    verify: true, approve: true, reject: true, publish: false, export: true, print: true,
    assign: false, collect: false, refund: false, reconcile: false, configure: false,
    manage_users: false, manage_permissions: false
  },
  HR_MANAGER: {
    view: true, create: true, edit: true, delete: false, archive: true, submit: true,
    verify: true, approve: true, reject: false, publish: false, export: true, print: true,
    assign: true, collect: false, refund: false, reconcile: false, configure: false,
    manage_users: true, manage_permissions: false
  },
  LECTURER: {
    view: true, create: false, edit: true, delete: false, archive: false, submit: true,
    verify: false, approve: false, reject: false, publish: false, export: false, print: true,
    assign: false, collect: false, refund: false, reconcile: false, configure: false,
    manage_users: false, manage_permissions: false
  },
  LIBRARIAN: {
    view: true, create: true, edit: true, delete: false, archive: false, submit: true,
    verify: true, approve: false, reject: false, publish: false, export: true, print: true,
    assign: false, collect: false, refund: false, reconcile: false, configure: false,
    manage_users: false, manage_permissions: false
  },
  HOSTEL_WARDEN: {
    view: true, create: true, edit: true, delete: false, archive: false, submit: true,
    verify: true, approve: true, reject: true, publish: false, export: true, print: true,
    assign: false, collect: false, refund: false, reconcile: false, configure: false,
    manage_users: false, manage_permissions: false
  },
  DRIVER: {
    view: true, create: false, edit: true, delete: false, archive: false, submit: true,
    verify: false, approve: false, reject: false, publish: false, export: false, print: false,
    assign: false, collect: false, refund: false, reconcile: false, configure: false,
    manage_users: false, manage_permissions: false
  },
};"""

content = content.replace(old_init_perms_end, new_init_perms_end)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Step 3 perms done.")

