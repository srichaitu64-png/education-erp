# Database Schema Architecture: PostgreSQL 16

## 1. Tenant & Institutional Domain

### `tenants`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique tenant identifier |
| `name` | VARCHAR(255) | NOT NULL | Institution or group name |
| `code` | VARCHAR(64) | UNIQUE, NOT NULL | School code (e.g. `akshara`) |
| `institution_type` | VARCHAR(64) | NOT NULL | `school`, `pu_college`, `degree_college` |
| `status` | VARCHAR(32) | NOT NULL | `active`, `trial`, `suspended`, `expired` |
| `primary_color` | VARCHAR(16) | NOT NULL | White-label brand primary hex |
| `secondary_color` | VARCHAR(16) | NOT NULL | White-label brand secondary hex |
| `logo_url` | VARCHAR(1000) | NULL | Institution logo URI |
| `subdomain` | VARCHAR(64) | UNIQUE, NULL | Subdomain prefix (e.g. `schoola`) |
| `custom_domain` | VARCHAR(255) | UNIQUE, NULL | Custom CNAME domain |
| `created_at` | TIMESTAMPTZ | NOT NULL | Record creation timestamp |

### `campuses` (RLS Forced)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique campus ID |
| `tenant_id` | UUID | FK -> `tenants.id` | Owning tenant |
| `name` | VARCHAR(255) | NOT NULL | Campus / branch name |
| `code` | VARCHAR(64) | NOT NULL | Unique per tenant |
| `is_main` | BOOLEAN | NOT NULL | Primary campus indicator |

---

## 2. Identity & RBAC Domain

### `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | User UUID |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Login email |
| `hashed_password` | VARCHAR(255) | NOT NULL | Argon2id hash |
| `full_name` | VARCHAR(255) | NOT NULL | User display name |
| `is_active` | BOOLEAN | NOT NULL | Account state |
| `is_superadmin` | BOOLEAN | NOT NULL | Platform Super Admin flag |

### `roles`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Role UUID |
| `tenant_id` | UUID | FK -> `tenants.id` NULL | NULL for system template roles |
| `name` | VARCHAR(100) | NOT NULL | Display name |
| `code` | VARCHAR(64) | NOT NULL | Unique code (e.g. `PRINCIPAL`) |
| `is_system` | BOOLEAN | NOT NULL | Immutable system role |

### `permissions`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Permission UUID |
| `code` | VARCHAR(100) | UNIQUE, NOT NULL | e.g. `students.create`, `fees.collect` |
| `name` | VARCHAR(255) | NOT NULL | Descriptive name |
| `module` | VARCHAR(64) | NOT NULL | Target module |

---

## 3. Subscriptions & Feature Entitlements Domain

### `subscription_plans`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Plan UUID |
| `code` | VARCHAR(64) | UNIQUE, NOT NULL | `TRIAL`, `STARTER`, `STANDARD`, `PRO`, `PREMIUM`, `ENTERPRISE` |
| `name` | VARCHAR(100) | NOT NULL | Plan name |
| `tier` | INTEGER | NOT NULL | Tier level (0 to 5) |
| `price_monthly_inr` | NUMERIC(12,2) | NOT NULL | Monthly subscription fee |
| `price_annual_inr` | NUMERIC(12,2) | NOT NULL | Annual subscription fee |
| `max_students` | INTEGER | NOT NULL | Student quota limit |
| `max_staff` | INTEGER | NOT NULL | Staff quota limit |
| `max_campuses` | INTEGER | NOT NULL | Allowed branch campuses |
| `max_storage_mb` | INTEGER | NOT NULL | Storage quota limit |

### `feature_catalog`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(100) | PRIMARY KEY | e.g. `analytics.ai_reports` |
| `name` | VARCHAR(150) | NOT NULL | Feature title |
| `module` | VARCHAR(64) | NOT NULL | Functional module |
| `category` | VARCHAR(64) | NOT NULL | Categorization |
| `min_plan_tier` | INTEGER | NOT NULL | Minimum tier required for access |

### `tenant_feature_overrides` (RLS Forced)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Override UUID |
| `tenant_id` | UUID | FK -> `tenants.id` | Target institution |
| `feature_id` | VARCHAR(100) | FK -> `feature_catalog.id` | Target feature |
| `override_status` | VARCHAR(16) | NOT NULL | `ALLOW` or `DENY` |
| `reason` | VARCHAR(500) | NOT NULL | Administrative reason |
| `starts_at` | TIMESTAMPTZ | NOT NULL | Validity start date |
| `expires_at` | TIMESTAMPTZ | NULL | Validity end date (NULL = perpetual) |
| `is_active` | BOOLEAN | NOT NULL | Active state flag |
