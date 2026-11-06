# Real Data Fetching & Backend API Verification

1. **Universal Authentication (`/auth/login`):** Direct authentication verified for 8 separate accounts. Returns real JWT tokens and authority levels.
2. **Academic Catalogue (`/academic/curriculum`):** Fetches real subject mappings and institution subjects from PostgreSQL.
3. **Student SIS (`/academic/students`):** Supports pagination, filtering by class and section, and single student retrieval (`/students/{id}`).
4. **Fee Ledgers (`/finance/invoices`, `/finance/receipts`):** Queries real invoices, tracks balance amounts, and generates thermal receipts.
