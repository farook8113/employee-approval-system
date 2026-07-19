# VibeFlow 10-Page Presentation PDF Manuscript

---

## PAGE 1: TITLE PAGE
* **Project Name**: VibeFlow
* **Author**: Antigravity AI pair programmer (Google DeepMind Team)
* **Title**: Production-Ready Employee Request Approval System
* **Purpose**: Vibe Coder / Rapid Prototyper Assessment
* **Date**: July 2026

---

## PAGE 2: PROBLEM STATEMENT
### The Core Challenge
In fast-paced modern organizations, operational delay in approving request folders (leaves, equipment, travel, budgets) causes structural bottlenecks.
### Key Pain Points
* **Workflow Friction**: Back-and-forth emails lead to slow approvals and missing attachments.
* **Information Asymmetry**: Employees lack a visual dashboard to track request progress or check status updates.
* **Security Exposure**: No database-enforced row level access control allows unauthorized staff to read sensitive logs.
* **Audit Blockages**: Managers have no direct way to search list tables, toggle filter sorts, or export data reports.

---

## PAGE 3: SOLUTION OVERVIEW
### How the Approval Workflow Works
VibeFlow centralizes request lifecycles into a secure, real-time approval system:
1. **Submission**: Employees fill out a validated form, choose categories and priorities, upload optional document receipts, and submit a "Pending" request.
2. **Notification**: The request appears instantly in the Manager's queue.
3. **Evaluation**: Managers open the request details modal to read the context, download attachments, select "Approve" or "Reject", write feedback comments, and submit their review.
4. **Synchronization**: Real-time websocket subscriptions refresh the employee's dashboard listing immediately, displaying the status update and manager comments on the request history timeline.

---

## PAGE 4: TECH STACK
VibeFlow is built with a modern, high-performance, single-language web stack:
* **Next.js 15 (App Router)**: Hybrid server/client rendering, type-safe API routes, and Server Actions for form processing.
* **TypeScript**: Strict compile-time type-safety across database models, Zod validation schemas, and component interfaces.
* **Tailwind CSS v4**: Utility-first CSS compiling premium dark-themed layouts, glassmorphism panel modules, and smooth keyframe animations.
* **Supabase (PostgreSQL)**: Serves as the database (custom tables, triggers, RLS), authentication mechanism, and storage provider.
* **Vercel**: High-speed edge hosting synced directly to GitHub commit pipelines.

---

## PAGE 5: SYSTEM ARCHITECTURE
### High-Level Architecture Flow
```text
  [Browser Client Component Views] 
           │
           ▼ (Zod Client Form Validation)
  [Supabase Storage Bucket API] <── (Optional Files Upload Direct)
           │
           ▼ (Invoke Async Server Actions / API Handlers)
  [Next.js Server-Side Context] (await cookies / auth.getUser)
           │
           ▼ (Enforce PostgreSQL Row Level Security Rules)
  [Supabase DB / Profiles & Requests Tables] ──┐
           ▲                                   │ (Trigger DB Event)
           │                                   ▼
  [Websocket Real-time Subscription] ◄─────────┘
```
* **Separation of Concerns**: Client views handle user state, Server Actions secure data queries, and Supabase manages state transitions.

---

## PAGE 6: DATABASE DESIGN
### Entity Schema Definition
```text
  [Profiles Table]
  - id (UUID, Primary Key, references auth.users)
  - full_name (TEXT, not null)
  - email (TEXT, not null)
  - role (TEXT, check constraint: 'employee' | 'manager')
  - created_at (TIMESTAMPTZ)
         │
         └─── (1-to-Many Relationship) ───┐
                                          ▼
                                   [Requests Table]
                                   - id (UUID, PK)
                                   - employee_id (UUID, FK -> profiles.id)
                                   - title / description (TEXT)
                                   - category / priority (TEXT)
                                   - start_date / end_date (DATE)
                                   - attachment_url (TEXT, nullable)
                                   - status (TEXT, default 'Pending')
                                   - manager_comment (TEXT, nullable)
                                   - created_at / updated_at (TIMESTAMPTZ)
```
### Security Policies (Supabase RLS)
* **Profiles**: Authenticated users can read profiles; updates are restricted to the account owner (`auth.uid() = id`).
* **Requests**: Employees read/write/delete only their own records. Managers can view and review all records.

---

## PAGE 7: SYSTEM FEATURES
### Employee Capabilities
* **Submit Requests**: Category selection, priority toggles, calendar date range bounds, and direct file uploads.
* **Modify Pending Items**: Edit request descriptions or swap file attachments on items before manager review.
* **Delete Pending Items**: Secure permanent deletion of a pending request using modal overlays.
* **History Tracker**: Timeline details panel display showing timestamps and manager justification comments.

### Manager Capabilities
* **Analytics Metrics Cards**: Real-time count of total, pending, approved, and rejected request levels.
* **Interactive Table**: Search queries, category filters, and clickable header column sort toggles.
* **Review Decision Overlay**: Toggle approve/reject status with mandatory feedback comments.
* **CSV Data Export**: Download reports of filtered request data in formatted CSV layouts.

---

## PAGE 8: APPLICATION SCREENSHOTS & WIREFRAMES
### 1. Landing Page Layout
* **Header**: Navigation bar containing app title, status indicators, and Login/Register links.
* **Hero Panel**: Features list layout + **Demo Credentials Panel** displaying quick one-click shortcuts to bypass manual logins.

### 2. Login & Registration Layout
* **Center Card**: Centered glassmorphic card presenting inputs, showing inline Zod validation warnings, and role radio toggles.

### 3. Employee Dashboard & Request Form Layout
* **Sidebar Layout**: Avatars, user details, and page links.
* **Filters Row**: Search bar and category dropdown inputs.
* **Submit Form Dialog**: Calendar date bounds and file choose button.
* **Details Dialogue**: Description text container, attachment download links, and visual audit logs timeline.

### 4. Manager Dashboard & Approval Screen Layout
* **Stats grid**: Row of four cards showing tallies of all request statuses.
* **Decision Modal**: Selection radio buttons for decision (Approve/Reject) + Review textarea.

---

## PAGE 9: DEMO & TEST ACCOUNTS
* **Production Link**: Link your deployed Vercel URL here (e.g., `https://your-project.vercel.app`).
* **Supabase Connection**: Fully linked to live PostgreSQL cluster.
* **Credentials Table**:

| Role | Email Address | Password | Quick Access |
| :--- | :--- | :--- | :--- |
| **Manager** | `manager@test.com` | `Password123` | Quick-Login button available on landing screen |
| **Employee** | `employee@test.com` | `Password123` | Quick-Login button available on landing screen |

*Note: Use the **"Seed Mock Database"** action button on the landing page first to register these accounts on the database and upload 25 mock requests.*

---

## PAGE 10: CONCLUSION & FUTURE IMPROVEMENTS
### Project Conclusion
VibeFlow is a fully functional, production-ready Request Approval prototype that compiles cleanly under Next.js 15.1.11, validates all input fields via Zod, secures files on Supabase Storage, and manages database rows with Row Level Security.
### Future Improvements
1. **Multi-Stage Approval Hierarchy**: Route requests through team leads, HR, and CFOs sequentially.
2. **Email & Push Notifications**: Connect Resend/SendGrid APIs to send email status updates to employees on reviews.
3. **Interactive Charts**: Render visual bar charts in the manager panel summarizing request categories and trends.
4. **SLA Breach Warnings**: Automated warnings if a request remains "Pending" for longer than 48 hours.
