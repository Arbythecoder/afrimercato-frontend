# AFRIMERCATO — System Requirements Specification (SRS)

Version: 1.1
Prepared by: Efezino Success Omorobe
Date: 01/10/2024

---

## Revision History

| Name | Date | Reason for Change | Version |
|---|---:|---|---:|
| Efezino Success Omorobe | 01/10/2024 | Initial creation / consolidation | 1.0 -> 1.1 |

---

## Document Approval

Printed Name: ____________________

Title: ___________________________

Date: ___________________________

---

**1. Overview**

**Client:** Success Efezino Omorobe

**Project Manager:** Success Omorobe

**Project Name:** Afrimercato

**Technology Developer:** (assigned team)

**Quality Assurance / Test Team:** ZeeTech Academy Team

**Target Users / Stakeholders:** Admin, Store Vendors, Riders, Pickers, Customers (end-users)

**Timeline:** (project timeline and milestones to be attached separately)

**Purpose:**
This SRS documents the functional and non-functional requirements for Afrimercato — an online marketplace for African vendors across the UK offering store discovery, ordering, checkout, delivery tracking, and operations for vendors, pickers, and riders.

**Scope:**
A responsive web application with mobile-friendly design and APIs for integrations (payment, geolocation, delivery tracking, real-time chat). Initial market: UK (English only). Includes admin portal and vendor dashboards.

**Product Overview:**
- Vendors manage inventory, pricing, orders, reports.
- Customers discover stores by location, browse products, checkout using integrated payment gateways, track deliveries, and chat with delivery agents.
- Riders and Pickers register, accept tasks, provide delivery/picking services; can have dual roles.
- Admins manage accounts, audit, and reports.

---

**2. System Requirements**

### 2.1 Functional Requirements (FRs)
(Each FR below should be assigned an ID and an acceptance criterion for traceability — sample acceptance criteria are provided.)

FR-1: User Accounts
- FR-1.1: Users (customer, vendor, rider, picker, admin) can register, verify email, and sign in (OAuth 2.0 + optional MFA).
  - Acceptance: Registration creates user record; email verification link must activate account.

FR-2: Vendor Onboarding & Management
- FR-2.1: Vendors can create store profiles, add images, business hours, categories.
- FR-2.2: Vendors can add, edit, delete products with SKU, price, stock, unit, images, specifications.
- FR-2.3: Vendors receive orders, update order status (accepted, preparing, ready, dispatched, delivered), and view order history.
- FR-2.4: Vendors can generate inventory, delivery, and revenue reports (daily/weekly/monthly).
  - Acceptance: Reports show correct aggregates for a vendor's orders.

FR-3: Customer Experience
- FR-3.1: Customers can search stores by location (geolocation, postcode, city), browse products, add to cart, edit cart, and checkout.
- FR-3.2: Multiple payment options: cards (via gateway), Apple/Google Pay, PayPal, etc.
- FR-3.3: Email and in-app order confirmations and receipts.
- FR-3.4: Real-time order tracking with map updates and ETAs.
- FR-3.5: In-app chat between customer and rider while order is out for delivery.
- FR-3.6: Customers can rate/review stores, products, and riders.
  - Acceptance: Customers can complete purchase flow end-to-end and view order status updates in under 5 seconds latency for updates.

FR-4: Picker & Rider Functionality
- FR-4.1: Pickers register and connect to nearby stores that request picking.
- FR-4.2: Pickers manage picking tasks, mark items as picked or report issues, and complete picking workflows.
- FR-4.3: Riders register, accept delivery tasks, view route and ETAs, update delivery status, and chat with customers.
- FR-4.4: Users can register as dual role (picker + rider); role toggling available.
  - Acceptance: Pick/dispatch flows produce correct status transitions in the order lifecycle.

FR-5: Delivery Tracking Sync
- FR-5.1: The system ingests tracking updates from rider device / carrier APIs and updates order ETAs and histories.
- FR-5.2: The system calculates average delivery timelines per store and per rider (daily/weekly/monthly).
  - Acceptance: Tracking updates reflected in UI within sync SLA (see NFRs).

FR-6: Payments & Refunds
- FR-6.1: Integrate payment gateway(s) to authorise payments, capture funds, and support refunds.
- FR-6.2: Support 2FA/OTP for payment confirmation where required.
  - Acceptance: Successful payment flows produce payment tokens and receipts and support reversal/refund operations via admin.

FR-7: Admin Portal
- FR-7.1: Admins can create/update/delete user accounts (vendors, riders, pickers, customers).
- FR-7.2: Admins can view activity logs, audit trails, and generate platform-wide reports.
- FR-7.3: Admins can manage vendor approvals and suspend accounts.
  - Acceptance: Admin actions recorded in audit log with timestamp and actor ID.

FR-8: Notifications
- FR-8.1: Email and push notifications for order events (placed, accepted, dispatched, delivered).
- FR-8.2: SMS optional gateway integration for critical alerts.

FR-9: Data Import / Migration
- FR-9.1: Provide import tools (CSV/JSON) for vendors to migrate legacy inventory and product data.

FR-10: Compliance
- FR-10.1: GDPR compliance controls: data deletion, export, consent recording, and secure storage.

> Note: Each functional requirement should be linked to test cases (traceability matrix). A test mapping table should be created during QA planning.


### 2.2 Non-Functional Requirements (NFRs)

NFR-1: Performance
- The app must support up to 2,000 concurrent users with an end-to-end update latency <= 5 seconds for real-time events.
- Page load: initial page load under 3s on 4G for primary landing page.

NFR-2: Availability & Reliability
- Target availability: 99.9% uptime (monthly SLA).
- Automatic retries on transient failures for external integrations.

NFR-3: Security
- TLS 1.2+ for all network traffic.
- Sensitive data encrypted at rest (AES-256) and in transit (TLS).
- OAuth 2.0 for authentication, with option for MFA (TOTP or SMS) for higher-privilege users (vendors, admins).
- PCI DSS guidance: do not store raw card numbers; use payment gateway tokenisation.

NFR-4: Privacy & Compliance
- GDPR: data subject access requests (DSAR), right to be forgotten, data export.
- Retention: account data retained 7 years after closure (per local policy) — confirm legal.

NFR-5: Usability
- Mobile-first responsive UI, accessible (WCAG AA target), and support modern browsers.

NFR-6: Localization
- English (UK) only for initial release. Localization-ready design for future languages.

NFR-7: Analytics
- Track store and user behaviour, conversion funnels, delivery KPIs, and integration with analytics platforms.

NFR-8: Scalability
- Microservice-friendly API design and horizontal scaling for backend services.


### 2.3 Interface Requirements

#### API Summary (high level)
- Authentication API (OAuth 2.0): /auth/login, /auth/logout, /auth/refresh, /auth/mfa
- Vendor API: /vendors (CRUD), /vendors/:id/products (CRUD), /vendors/:id/orders
- Product API: /products, /products/:id
- Cart & Checkout API: /cart, /checkout, /payments
- Payment Gateway Integration: external endpoints per provider (tokenize, charge, refund)
- Delivery Tracking API: /tracking/:orderId (ingest and retrieve updates)
- Real-time Chat API: WebSocket or third-party integration endpoints for chat sessions
- Data Sync API: /sync endpoints for devices to sync inventory/customer data

For each endpoint: include methods (GET/POST/PUT/DELETE), request/response examples, status codes, auth requirements — to be added to API spec (OpenAPI/Swagger) during implementation.


### 2.4 Integration Requirements

- Payment gateways: Stripe, PayPal, Apple/Google Pay, etc. Tokenize cards, use webhooks for asynchronous events.
- Geolocation: Google Maps / Mapbox for store search, reverse geocoding.
- Real-time tracking: integrate rider-device SDKs or carrier APIs for GPS updates.
- Real-time chat: use WebSocket, Firebase, or third-party chat provider.
- Email/SMS: transactional email (SendGrid/Postmark) and SMS (Twilio) integrations.


### 2.5 Database Requirements

Data stores:
- Primary: Document DB (MongoDB) or relational DB (Postgres) depending on transactional needs. Schema must include:
  - Users: users collection/table with roles, profile, verification status.
  - Vendors / Stores: store profile, business details, hours, location
  - Products: sku, name, description, price, stock, images, specifications
  - Orders: orderId, customerId, vendorId, items[], status history, payments, tracking
  - Inventory sync logs: per item sync_status, timestamps, error messages
  - Audit logs: admin and system actions

Scale and backup: daily backups, point-in-time recovery where possible.


### 2.6 Transition Requirement

- Data migration tools for CSV/JSON import mapping.
- Training resources: video tutorials, user guides, role-specific quickstart docs.

---

**3. Data Dictionary (expanded)**

| Field | Description | Type | Example |
|---|---|---:|---|
| SKU | Unique product identifier | string | SKU-0001 |
| orderId | Unique order identifier | string | ORD-20240101-0001 |
| storeId | Unique store identifier | string | VEND-123 |
| userId | Unique user id (customers/riders/pickers) | string | USER-456 |
| riderId | Unique rider id (if separate) | string | RID-789 |
| pickerId | Unique picker id (if separate) | string | PIC-012 |
| sync_status | Inventory sync status | enum(success, failure, pending) | success |
| status | Order status | enum | accepted, preparing, dispatched, delivered |
| paymentStatus | Payment status | enum | pending, authorized, captured, refunded |


**4. Project Risks**
- Data Security: mitigation: TLS, encryption, regular pentests
- Integration Risk: mitigate via sandbox testing and adapter layers
- Adoption Risk: user training, simplified onboarding
- Connectivity Risk: offline support for cart draft; retry/sync strategies
- Compliance Risk: legal review and privacy-by-design
- Refunds/Disputes: defined refund policy and support workflows


**5. Project Dependencies**
- Third-party APIs: geolocation, payment, tracking
- Legal/compliance sign-off for data retention policy
- Internet connectivity for users


**6. Project Issues (known)**
- Sync delays in low-connectivity areas: implement local caching and reconciliation
- Training required for onboarding vendors and riders


**7. Project Constraints**
- Budget and time (targeted 3 months for MVP)
- Regulatory requirements (UK GDPR)


**8. Project Assumptions**
- Integrating APIs are available and documented
- Users have reasonably stable internet access
- Single-market (UK) release with English language


**9. Traceability & Test Mapping (placeholder)**
- A traceability matrix will map each FR (e.g., FR-2.1) to design modules, code components (service names and `src` paths), and test cases. QA to create and maintain this matrix (recommended format: CSV/Excel or test-management tool).


**10. Glossary**
- API, DSAR, GDPR, SKU, ETAs, MFA, OAuth, PCI DSS — definitions aligned to the provided glossary in the original draft.

---

## AI-Generated Onboarding Video — Carousel Spec (for Marketing / In-App)

Purpose: short carousel-style onboarding video (3–7 slides) to introduce vendors/riders/pickers/customers to Afrimercato features. Deliverables: script, visual frames, durations, captions, suggested AI-video prompts and audio (voiceover) script.

High-level requirements:
- Duration per slide: 4–8 seconds (total 20–40s)
- Aspect ratios: 16:9 (web/YouTube), 1:1 for social, and 9:16 for mobile Stories
- Include branded colors, logo, short captions, and CTA

Suggested carousel frames and voiceover (example for vendor onboarding):

1) Frame 1 — Welcome (3–4s)
- Visual: Afrimercato logo, friendly background with grocery imagery
- Caption: "Welcome to Afrimercato — Grow your store online"
- Voiceover: "Welcome to Afrimercato — reach customers across the UK."

2) Frame 2 — Easy Onboarding (5s)
- Visual: Animated form fields filling in (store name, hours, images)
- Caption: "Set up your store in minutes"
- Voiceover: "Create your store, upload products, and manage inventory in minutes."

3) Frame 3 — Orders & Fulfilment (5s)
- Visual: Order flow animation: customer -> vendor -> picker -> rider -> delivered
- Caption: "Process orders, assign pickers & riders"
- Voiceover: "Accept orders, assign pickers, and track deliveries in real-time."

4) Frame 4 — Payments & Reports (5s)
- Visual: Dashboard snapshot with graphs and payments icons
- Caption: "Secure payments & performance reports"
- Voiceover: "Secure payment options and easy-to-use sales and delivery reports."

5) Frame 5 — Get Started (4–6s)
- Visual: CTA button style with URL and onboarding link
- Caption: "Sign up today — Start selling locally"
- Voiceover: "Sign up now and start reaching more customers today."

Technical prompts for AI video generator (example):
- "Create a 25-second vertical onboarding video for a grocery marketplace brand 'Afrimercato'. Use brand colors green and yellow, include animated icons for store setup, orders, delivery tracking, and payments. Smooth transitions, friendly female voiceover in British English. Add background music: upbeat, light acoustic. Export MP4 1080x1920."

Storyboard / assets checklist:
- Logo in PNG & SVG
- Brand color hex codes (primary/secondary)
- Product photography or stock grocery images
- Short captions and final CTA URL

CTA & distribution:
- Add link to vendor signup page (example `/register?vendor=true`)
- Add video to `Marketing` pages and the `Vendor Onboarding` flow inside the app (add route in `src/App.jsx` if desired).

---

## Next Steps & Recommendations

- Convert this SRS into canonical project artifact: add to repo at `SRS_AFRIMERCATO_v1.1.md` (this file).
- Create an OpenAPI (Swagger) spec for all APIs listed and store it in `docs/openapi.yaml`.
- Create traceability matrix linking FRs → code → tests in `docs/traceability.csv`.
- QA: create test cases for each FR and map to automated tests.
- Marketing: use the carousel spec prompts and assets to generate AI video variations; produce 16:9 and 9:16 variants.

---

If you want, I can now:
- (A) Commit this file into the repo (already created here),
- (B) Generate an initial OpenAPI skeleton from the FRs,
- (C) Produce the small onboarding video assets (AI prompts + rendered JSON for a video service), or
- (D) Produce the traceability CSV mapping FR IDs to files and tests.

Tell me which option to do next.
