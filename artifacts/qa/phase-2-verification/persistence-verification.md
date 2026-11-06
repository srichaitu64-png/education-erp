# Data Persistence & State Durability Report

- **Local State Durability:** Client state changes in `useDemoStore` persist across page reloads and tab navigations.
- **Backend Database Durability:** When authenticated with JWT tokens, student and curriculum writes persist to PostgreSQL 16.
- **Row-Level Security (RLS):** All table inserts and queries are isolated by `tenant_id` via PostgreSQL native RLS policies.
