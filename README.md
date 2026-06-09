# Jewelry Brand CRM

Custom CRM for a gold and jewelry brand that keeps Zoho Books as the accounting, tax, payment, estimate, and invoice system while the CRM owns customers, leads, catalog enrichment, reservations, quotations, after-sales, reports, and sync logs.

## What is included

- `backend/`: Django + Django REST Framework API with domain apps for accounts, customers, leads, tasks, products, reservations, quotations, after-sales, Zoho integration, reports, audit logs, and imports.
- `frontend/`: Next.js + Tailwind CRM interface with dashboard, customers, leads, products, CSV import, reservations, quotations, after-sales, reports, and settings screens.
- `docker-compose.yml`: local PostgreSQL, Redis, backend, Celery worker, and frontend services.
- Zoho Books stays the final system for invoices, estimates, taxes, and payments. WhatsApp and SMS integrations are intentionally excluded.

## Backend modules

- `accounts`: custom user model and CRM roles.
- `customers`: customer preferences and Zoho contact reference.
- `leads`: pipeline stages, product shortlist, activities, won/lost flow.
- `tasks_app`: follow-up tasks and completion notes.
- `products`: jewelry catalog, product images, certificates, CSV import normalization.
- `reservations`: product locking rules, expiry release behavior, conversion status.
- `quotations`: quotation header/items, Zoho estimate/invoice references.
- `after_sales`: repair/resize/polish/return workflows with before/after images.
- `zoho_integration`: sync logs, webhook logs, Celery tasks, Zoho client wrapper.
- `reports`: dashboard and inventory summary endpoints.
- `audit_logs`: important action log table.
- `imports`: import summaries and row-level import errors.

## Local setup

```bash
docker compose up --build
```

Then open:

- Frontend: `http://localhost:3000`
- API: `http://localhost:8000/api`
- Swagger: `http://localhost:8000/api/docs/`

Create an admin user:

```bash
docker compose exec backend python manage.py createsuperuser
```

## Environment

Copy `backend/.env.example` and `frontend/.env.example` for non-Docker local development. Production secrets should be stored in Google Secret Manager and injected into Cloud Run.

Required production variables:

- `DJANGO_SECRET_KEY`
- `DATABASE_URL`
- `REDIS_URL`
- `GCP_STORAGE_BUCKET`
- `ZOHO_CLIENT_ID`
- `ZOHO_CLIENT_SECRET`
- `ZOHO_REFRESH_TOKEN`
- `ZOHO_ORGANIZATION_ID`
- `ZOHO_API_DOMAIN`
- `FRONTEND_URL`
- `BACKEND_URL`

## MVP business rules implemented

- Product inventory status is owned by the CRM and does not rely only on Zoho active/inactive status.
- CSV import normalizes Zoho item export fields including `CF.Inventory`, `CF.Certification present?`, and `CF.Product Type`.
- Reservations can only be created for `Available` products.
- Creating an active reservation locks the product as `Reserved`.
- Cancelling or expiring a reservation releases the product back to `Available`.
- Quotation conversion can store Zoho estimate/invoice IDs and mark products sold after invoice conversion.
- Zoho API requests, webhook payloads, failed syncs, and retry attempts have database log models.

## GCP deployment target

- Frontend: Cloud Run service from `frontend/Dockerfile`
- Backend API: Cloud Run service from `backend/Dockerfile`
- Worker: Cloud Run worker/job using the backend image and Celery command
- Database: Cloud SQL PostgreSQL
- Queue: Memorystore Redis
- Files: Cloud Storage
- Secrets: Secret Manager
- Scheduler: Cloud Scheduler hitting backend endpoints or Cloud Run jobs for daily Zoho sync, hourly reservation expiry, daily follow-up status checks, and sync error summaries
