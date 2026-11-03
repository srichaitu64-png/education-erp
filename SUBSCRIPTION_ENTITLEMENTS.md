# Subscription Entitlements & Feature Locking Engine

## 1. Commercial Plan Catalogue

| Plan Code | Plan Name | Tier | Annual Price (INR) | Max Students | Max Campuses | Target Institutions |
|---|---|---|---|---|---|---|
| `TRIAL` | Free Trial | Tier 0 | ₹0 | 100 | 1 | 30-Day Evaluation |
| `STARTER` | Starter Plan | Tier 1 | ₹9,999 | 300 | 1 | Small Primary Schools |
| `STANDARD` | Standard Plan | Tier 2 | ₹19,999 | 750 | 1 | Secondary Schools |
| `PROFESSIONAL` | Professional Plan | Tier 3 | ₹34,999 | 1,500 | 2 | PU Colleges & Senior Secondary |
| `PREMIUM` | Premium Plan | Tier 4 | ₹59,999 | 3,000 | 5 | Composite Schools & PU Colleges |
| `ENTERPRISE` | Enterprise Plan | Tier 5 | ₹99,999 | 10,000+ | 20+ | Degree Colleges & School Groups |

*Prices and limits are fully configurable by Super Admin.*

---

## 2. Feature Registry & Minimum Tiers

| Feature ID | Feature Name | Module | Minimum Plan Required |
|---|---|---|---|
| `admissions.basic` | Basic Admissions | admissions | Starter (Tier 1) |
| `students.management` | Student Information System | students | Starter (Tier 1) |
| `fees.basic` | Basic Fee Invoicing & Receipts | fees | Starter (Tier 1) |
| `attendance.basic` | Daily Attendance | attendance | Starter (Tier 1) |
| `examinations.basic` | Examinations & Marks Entry | examinations | Starter (Tier 1) |
| `communication.email` | Email Notifications | communication | Starter (Tier 1) |
| `parent.portal` | Parent Portal & Mobile Access | portals | Standard (Tier 2) |
| `student.portal` | Student Portal & Mobile Access | portals | Standard (Tier 2) |
| `offline.sync` | Offline PWA & Sync Queue | offline | Standard (Tier 2) |
| `custom_branding` | White-Label Brand Colors & Logo | branding | Standard (Tier 2) |
| `communication.sms` | Automated SMS Alerts | communication | Standard (Tier 2) |
| `fees.advanced` | Online Payment Gateway (Razorpay/UPI) | fees | Professional (Tier 3) |
| `examinations.advanced` | University Credits, SGPA/CGPA, Backlogs | examinations | Professional (Tier 3) |
| `hr.payroll` | Staff HR & Payroll | hr | Professional (Tier 3) |
| `library.management` | Library Book Catalog & Fines | library | Professional (Tier 3) |
| `transport.management` | Transport, Bus Routes & Stops | transport | Professional (Tier 3) |
| `hostel.management` | Hostel Rooms & Bed Allocations | hostel | Professional (Tier 3) |
| `custom_domain` | Custom School Domain (CNAME) | branding | Professional (Tier 3) |
| `attendance.biometric` | Biometric Device Attendance Sync | attendance | Premium (Tier 4) |
| `communication.whatsapp`| Official WhatsApp Business API | communication | Premium (Tier 4) |
| `multi_campus` | Multi-Campus Management | tenants | Premium (Tier 4) |
| `analytics.advanced` | Multi-Campus Comparative Analytics | reports | Premium (Tier 4) |
| `analytics.ai_reports` | AI Academic Risk Forecasting | analytics | Enterprise (Tier 5) |
| `dedicated_database` | Physical Dedicated Database Isolation | infrastructure | Enterprise (Tier 5) |
| `white_label_android` | Separately Branded Play Store App | mobile | Enterprise (Tier 5) |

---

## 3. Institution-Specific Override Engine

Super Admin can apply time-bound overrides for any specific institution:
- **`ALLOW` Override:** Unlocks higher-tier modules (e.g. 30-day evaluation of `analytics.ai_reports` on a Standard plan).
- **`DENY` Override:** Restricts an institution from accessing a feature even if included in their plan (e.g. pending billing dispute or administrative review).
- **Precedence Rule:** `DENY` takes absolute precedence over plan entitlements.
