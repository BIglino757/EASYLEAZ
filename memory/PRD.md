# EasyLeaz - PRD

## Problem Statement
Premium automotive leasing landing page + CRM for EasyLeaz, Geneva. Ultra-premium dark theme with admin panel, vehicle management, global CMS, and full CRM system.

## Architecture
- **Frontend**: React + Tailwind + Framer Motion + Shadcn UI
- **Backend**: FastAPI + MongoDB
- **Auth**: JWT (PyJWT + bcrypt)
- **File Storage**: Local (/app/backend/uploads/)
- **Theme**: Dark premium (#071A1F, #22D3EE cyan, #E6F7FF text)
- **Fonts**: Cinzel (headings), Inter (body)

## What's Been Implemented (March 2026)

### Landing Page
- Hero with parallax, Vehicles slider, Process steps, Extended leasing form, Appointment section, Contact, Footer

### CRM System (NEW)
- JWT authentication (email + password)
- Extended leasing form: 15+ fields + file uploads (identity doc, salary slips)
- Leads API: POST, GET, GET/:id, PATCH, DELETE
- CRM Dashboard with stats (total, pending, approved, rejected)
- Lead management: table, search, filters, detail view, status updates
- Document downloads from admin panel
- Email notification system (SMTP configurable)
- Backward compatibility with legacy auth

### Admin Panel (/admin)
- JWT login (admin@easyleaz.ch / easyleaz2024)
- 4 tabs: Dashboard, Leads, Vehicles, CMS
- Vehicle CRUD
- CMS global content editor

## Prioritized Backlog
- P0: Calendly integration
- P0: Real vehicle images
- P1: Typeform integration
- P1: Configure SMTP for email notifications
- P2: Multi-language (FR/EN)
- P2: Lead export (CSV)
- P2: Analytics charts in dashboard

## Next Tasks
1. Configure SMTP for email notifications
2. Integrate Calendly when URL provided
3. Replace stock images with client photos
4. Add lead CSV export
