import sys
import re

path = 'apps/web/src/store/demoStore.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update UserRoleType
role_old = """export type UserRoleType =
  | 'SUPER_ADMIN'
  | 'BACKUP_SUPER_ADMIN'
  | 'DEVELOPER'
  | 'INSTITUTION_ADMIN'
  | 'PRINCIPAL'
  | 'VICE_PRINCIPAL'
  | 'ACCOUNTANT'
  | 'EXAM_CONTROLLER'
  | 'TEACHER'
  | 'PARENT'
  | 'STUDENT'
  | 'TRANSPORT_MANAGER';"""

role_new = """export type UserRoleType =
  | 'SUPER_ADMIN'
  | 'BACKUP_SUPER_ADMIN'
  | 'DEVELOPER'
  | 'CHAIRMAN_DIRECTOR'
  | 'DIRECTOR'
  | 'MANAGING_DIRECTOR'
  | 'TRUSTEE'
  | 'INSTITUTION_ADMIN'
  | 'PRINCIPAL'
  | 'VICE_PRINCIPAL'
  | 'ACCOUNTANT'
  | 'EXAM_CONTROLLER'
  | 'ADMISSION_OFFICER'
  | 'HR_MANAGER'
  | 'TEACHER'
  | 'LECTURER'
  | 'LIBRARIAN'
  | 'HOSTEL_WARDEN'
  | 'TRANSPORT_MANAGER'
  | 'DRIVER'
  | 'PARENT'
  | 'STUDENT';"""

if role_old in content:
    content = content.replace(role_old, role_new)
    print("UserRoleType updated.")
else:
    print("UserRoleType not found or already updated.")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Step 1 done.")

