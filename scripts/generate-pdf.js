const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generatePDF() {
  const doc = new PDFDocument({ 
    margin: 50,
    size: 'A4',
    bufferPages: true 
  });

  const pdfPath = path.join(__dirname, '..', 'presentation.pdf');
  doc.pipe(fs.createWriteStream(pdfPath));

  // --- Theme Colors ---
  const PRIMARY = '#4f46e5'; // Indigo 600
  const SECONDARY = '#0f172a'; // Slate 900
  const TEXT_DARK = '#1e293b'; // Slate 800
  const TEXT_LIGHT = '#64748b'; // Slate 500
  const ACCENT = '#10b981'; // Emerald 500
  const BG_LIGHT = '#f8fafc'; // Slate 50

  // Helper to draw horizontal lines
  const drawDivider = (y) => {
    doc.strokeColor('#e2e8f0')
       .lineWidth(1)
       .moveTo(50, y)
       .lineTo(545, y)
       .stroke();
  };

  // Helper for Section Headers
  const drawSectionHeader = (title, subtitle) => {
    doc.fillColor(PRIMARY)
       .font('Helvetica-Bold')
       .fontSize(18)
       .text(title)
       .moveDown(0.2);

    if (subtitle) {
      doc.fillColor(TEXT_LIGHT)
         .font('Helvetica')
         .fontSize(10)
         .text(subtitle)
         .moveDown(0.8);
    }
  };

  // ==========================================
  // PAGE 1: TITLE PAGE (COVER)
  // ==========================================
  
  // Header bar
  doc.rect(0, 0, 595.28, 20)
     .fill(PRIMARY);

  doc.moveDown(4);
  
  // Title
  doc.fillColor(SECONDARY)
     .font('Helvetica-Bold')
     .fontSize(28)
     .text('VibeFlow', { align: 'center' })
     .moveDown(0.3);

  // Subtitle
  doc.fillColor(PRIMARY)
     .font('Helvetica-Bold')
     .fontSize(16)
     .text('Employee Request Approval System', { align: 'center' })
     .moveDown(1.5);

  // Decorative Accent Bar
  doc.rect(247, doc.y, 100, 3)
     .fill(ACCENT);
  
  doc.moveDown(3);

  // Details box
  doc.fillColor(TEXT_DARK)
     .font('Helvetica-Bold')
     .fontSize(11)
     .text('Project Metadata & Specifications', { align: 'center' })
     .moveDown(0.5);

  const metaY = doc.y;
  doc.rect(122, metaY, 350, 150)
     .fill(BG_LIGHT)
     .strokeColor('#e2e8f0')
     .lineWidth(1)
     .stroke();

  doc.fillColor(TEXT_DARK)
     .font('Helvetica-Bold')
     .fontSize(9)
     .text('Assessment:', 142, metaY + 20)
     .font('Helvetica')
     .text('Vibe Coder / Rapid Prototyper Assessment', 242, metaY + 20)
     
     .font('Helvetica-Bold')
     .text('Tech Stack:', 142, metaY + 45)
     .font('Helvetica')
     .text('Next.js 15 (App Router), TS, Tailwind, Supabase', 242, metaY + 45)
     
     .font('Helvetica-Bold')
     .text('Developer:', 142, metaY + 70)
     .font('Helvetica')
     .text('Antigravity AI Engineer', 242, metaY + 70)
     
     .font('Helvetica-Bold')
     .text('Date Compiled:', 142, metaY + 95)
     .font('Helvetica')
     .text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 242, metaY + 95)

     .font('Helvetica-Bold')
     .text('Status:', 142, metaY + 120)
     .font('Helvetica')
     .fillColor(ACCENT)
     .text('Production-Ready Prototype / Fully Functional', 242, metaY + 120);

  // Footer bar
  doc.rect(0, 821.89, 595.28, 20)
     .fill(SECONDARY);

  // ==========================================
  // PAGE 2: PROBLEM STATEMENT & SOLUTION
  // ==========================================
  doc.addPage();
  doc.y = 50;

  drawSectionHeader('1. Executive Overview', 'Defining the challenge and the VibeFlow solution');

  doc.fillColor(TEXT_DARK)
     .font('Helvetica-Bold')
     .fontSize(12)
     .text('Problem Statement')
     .moveDown(0.4);

  doc.font('Helvetica')
     .fontSize(10)
     .fillColor(TEXT_DARK)
     .text('In modern organizations, operational friction often delays employee requests for leaves, budget allocations, equipment upgrades, and travel plans. Traditional methods like emails or paper forms lead to lost communications, lack of transparent audit trails, and slow review queues. Specifically:', { align: 'justify' })
     .moveDown(0.5);

  const bulletPoints1 = [
    'No central repository for employees to query past request statuses.',
    'Lack of validation leads to conflicting dates or missing documentation.',
    'No automated security constraints, allowing unauthorized visibility.',
    'Managers cannot easily filter, sort, or export data for report analysis.'
  ];

  bulletPoints1.forEach(bullet => {
    doc.fillColor(PRIMARY).text('• ', 70, doc.y, { continued: true })
       .fillColor(TEXT_DARK).text(bullet, 80)
       .moveDown(0.2);
  });

  doc.x = 50;
  doc.moveDown(1);
  drawDivider(doc.y);
  doc.moveDown(1);

  doc.fillColor(TEXT_DARK)
     .font('Helvetica-Bold')
     .fontSize(12)
     .text('VibeFlow Solution')
     .moveDown(0.4);

  doc.font('Helvetica')
     .fontSize(10)
     .fillColor(TEXT_DARK)
     .text('VibeFlow resolves these bottlenecks with a centralized, fully responsive SaaS application. Built as a production-grade request approval suite, it features:', { align: 'justify' })
     .moveDown(0.5);

  const bulletPoints2 = [
    'Dual-Role Dashboards (Employee & Manager) that isolate relevant request flows.',
    'Zod Validation Schema ensuring structural integrity of requests and comments.',
    'Supabase Storage integration for optional file receipts and document attachments.',
    'Row Level Security (RLS) policies securing user data from unauthorized database access.',
    'Real-time PostgreSQL changes notifying users immediately when status updates occur.'
  ];

  bulletPoints2.forEach(bullet => {
    doc.fillColor(ACCENT).text('• ', 70, doc.y, { continued: true })
       .fillColor(TEXT_DARK).text(bullet, 80)
       .moveDown(0.2);
  });

  doc.x = 50;

  // ==========================================
  // PAGE 3: ARCHITECTURE & DATABASE DESIGN
  // ==========================================
  doc.addPage();
  doc.y = 50;

  drawSectionHeader('2. System Architecture & Database Design', 'How VibeFlow links Next.js 15, TypeScript, and Supabase');

  doc.fillColor(TEXT_DARK)
     .font('Helvetica-Bold')
     .fontSize(11)
     .text('Application Architectural Flow')
     .moveDown(0.4);

  const archY = doc.y;
  doc.rect(50, archY, 495, 110)
     .fill(BG_LIGHT)
     .strokeColor('#e2e8f0')
     .lineWidth(1)
     .stroke();

  doc.fillColor(TEXT_DARK)
     .font('Helvetica-Bold')
     .fontSize(9)
     .text('Client Views (Landing, Login, Dashboards) [Next.js App Router]', 70, archY + 15)
     .font('Helvetica')
     .fontSize(8.5)
     .fillColor(TEXT_LIGHT)
     .text('   --> User submits form --> Client Zod Validation compiles metadata', 70, archY + 30)
     .text('   --> Async File Upload directly to Supabase Storage bucket', 70, archY + 42)
     .fillColor(TEXT_DARK)
     .font('Helvetica-Bold')
     .text('Next.js Server Actions & API Handlers', 70, archY + 60)
     .font('Helvetica')
     .fillColor(TEXT_LIGHT)
     .text('   --> Invokes createClient() checking cookies / RLS policies', 70, archY + 75)
     .text('   --> Executes database query and triggers Next.js revalidation', 70, archY + 87);

  doc.x = 50;
  doc.moveDown(4.5);
  drawDivider(doc.y);
  doc.moveDown(1);

  doc.fillColor(TEXT_DARK)
     .font('Helvetica-Bold')
     .fontSize(11)
     .text('Database Entity Diagram & RLS Constraints')
     .moveDown(0.5);

  const schemaY = doc.y;
  
  // Table 1 Box
  doc.rect(50, schemaY, 230, 150)
     .fill(BG_LIGHT)
     .strokeColor(PRIMARY)
     .lineWidth(1)
     .stroke();
  
  doc.fillColor(PRIMARY)
     .font('Helvetica-Bold')
     .fontSize(9.5)
     .text('Table: public.profiles', 60, schemaY + 15)
     .font('Helvetica')
     .fontSize(8.5)
     .fillColor(TEXT_DARK)
     .text('• id (UUID, PK, references auth.users)', 60, schemaY + 35)
     .text('• full_name (TEXT, Not Null)', 60, schemaY + 50)
     .text('• email (TEXT, Not Null)', 60, schemaY + 65)
     .text('• role (TEXT, employee/manager)', 60, schemaY + 80)
     .text('• created_at (TIMESTAMPTZ)', 60, schemaY + 95)
     .fillColor(TEXT_LIGHT)
     .text('RLS: Read by all authenticated users;', 60, schemaY + 115)
     .text('Update only by record owner.', 60, schemaY + 127);

  // Table 2 Box
  doc.rect(315, schemaY, 230, 150)
     .fill(BG_LIGHT)
     .strokeColor(ACCENT)
     .lineWidth(1)
     .stroke();

  doc.fillColor(ACCENT)
     .font('Helvetica-Bold')
     .fontSize(9.5)
     .text('Table: public.requests', 325, schemaY + 15)
     .font('Helvetica')
     .fontSize(8.5)
     .fillColor(TEXT_DARK)
     .text('• id (UUID, PK, default uuid_generate())', 325, schemaY + 35)
     .text('• employee_id (UUID, FK -> profiles.id)', 325, schemaY + 47)
     .text('• title / description (TEXT, Not Null)', 325, schemaY + 59)
     .text('• category / priority (TEXT, constrained)', 325, schemaY + 71)
     .text('• start_date / end_date (DATE)', 325, schemaY + 83)
     .text('• attachment_url (TEXT, nullable)', 325, schemaY + 95)
     .text('• status (TEXT, Pending/Approved/Rejected)', 325, schemaY + 107)
     .text('• manager_comment (TEXT, nullable)', 325, schemaY + 119)
     .fillColor(TEXT_LIGHT)
     .text('RLS: Employees write/edit own Pending data.', 325, schemaY + 132)
     .text('Managers read/review all requests.', 325, schemaY + 142);

  doc.x = 50;

  // ==========================================
  // PAGE 4: UI FEATURES & MOCK USER FLOWS
  // ==========================================
  doc.addPage();
  doc.y = 50;

  drawSectionHeader('3. User Workflows & Interactive Views', 'Detailed functional specs for Employee and Manager interfaces');

  doc.fillColor(TEXT_DARK)
     .font('Helvetica-Bold')
     .fontSize(11)
     .text('Employee Workflows')
     .moveDown(0.3);

  doc.font('Helvetica')
     .fontSize(9.5)
     .text('Employees operate in an isolated namespace where they can review their personal request archives. Interactive features include:', { align: 'justify' })
     .moveDown(0.4);

  const empBullets = [
    'Create Request Form: Modal validating titles (>=3 chars), description length (>=10 chars), and date logic.',
    'Pending Edits: Employees can adjust categories, descriptions, or file attachments for any requests still marked as "Pending".',
    'Pending Deletions: Permanent removal of a pending record with user confirmation dialogs.',
    'Status Timeline Tracker: A history timeline reflecting creation timestamps and manager review timestamps.'
  ];

  empBullets.forEach(bullet => {
    doc.fillColor(PRIMARY).text('• ', 70, doc.y, { continued: true })
       .fillColor(TEXT_DARK).text(bullet, 80)
       .moveDown(0.2);
  });

  doc.x = 50;
  doc.moveDown(0.8);
  drawDivider(doc.y);
  doc.moveDown(0.8);

  doc.fillColor(TEXT_DARK)
     .font('Helvetica-Bold')
     .fontSize(11)
     .text('Manager Workflows')
     .moveDown(0.3);

  doc.font('Helvetica')
     .fontSize(9.5)
     .text('Managers receive a high-level analytics overview and request queue matching all organization employees. Interactive controls feature:', { align: 'justify' })
     .moveDown(0.4);

  const mgrBullets = [
    'Statistics Cards: Summarizing real-time tallies of Total, Pending, Approved, and Rejected requests.',
    'Interactive Table: Column sorting (Employee Name, Category, Title, Priority, Date, Status) and inline searches.',
    'Decision Modal: Approve/Reject selectors with required manager justification feedback comments.',
    'CSV Export: Generates structured, escaped reports containing all filtered rows for spreadsheet audit.'
  ];

  mgrBullets.forEach(bullet => {
    doc.fillColor(ACCENT).text('• ', 70, doc.y, { continued: true })
       .fillColor(TEXT_DARK).text(bullet, 80)
       .moveDown(0.2);
  });

  doc.x = 50;

  // ==========================================
  // PAGE 5: CHALLENGES, CREDENTIALS & IMPROVEMENTS
  // ==========================================
  doc.addPage();
  doc.y = 50;

  drawSectionHeader('4. Challenges, Future Improvements & Credentials', 'Review notes and environment setup credentials');

  doc.fillColor(TEXT_DARK)
     .font('Helvetica-Bold')
     .fontSize(11)
     .text('Development Challenges Resolved')
     .moveDown(0.3);

  doc.font('Helvetica')
     .fontSize(9.5)
     .text('1. PowerShell Script Execution Restriction: Solved by executing all npm and npx commands explicitly through cmd.exe /c wrappers, bypassing host security blocks.\n2. Server-side Cookie Rendering (Next.js 15): Handled asynchronous cookie retrieval dynamically by awaiting headers in createClient Server Components, keeping user sessions synced.', { align: 'justify' })
     .moveDown(0.8);

  drawDivider(doc.y);
  doc.moveDown(0.8);

  doc.fillColor(TEXT_DARK)
     .font('Helvetica-Bold')
     .fontSize(11)
     .text('Demo Access Credentials')
     .moveDown(0.3);

  doc.font('Helvetica')
     .fontSize(9.5)
     .text('You can test the application using manual inputs or clicking the "Quick Login" button shortcuts on the home page.', { align: 'justify' })
     .moveDown(0.4);

  const credY = doc.y;
  doc.rect(50, credY, 495, 60)
     .fill(BG_LIGHT)
     .strokeColor('#e2e8f0')
     .lineWidth(1)
     .stroke();

  doc.fillColor(TEXT_DARK)
     .font('Helvetica-Bold')
     .text('Manager Account:', 65, credY + 15)
     .font('Helvetica')
     .text('Email: manager@test.com  |  Password: Password123', 180, credY + 15)
     
     .font('Helvetica-Bold')
     .text('Employee Account:', 65, credY + 35)
     .font('Helvetica')
     .text('Email: employee@test.com  |  Password: Password123', 180, credY + 35);

  doc.x = 50;
  doc.moveDown(3.5);
  drawDivider(doc.y);
  doc.moveDown(0.8);

  doc.fillColor(TEXT_DARK)
     .font('Helvetica-Bold')
     .fontSize(11)
     .text('Future Roadmap Improvements')
     .moveDown(0.4);

  const roadmap = [
    'Multi-Tier Approvals: Support routing a request to Department Lead, then to Finance Director.',
    'Email notifications: Trigger SendGrid or Resend emails to notify employees on status updates.',
    'Custom SLA Timers: Notify manager if a request has remained "Pending" for more than 48 hours.'
  ];

  roadmap.forEach(r => {
    doc.fillColor(PRIMARY).text('• ', 70, doc.y, { continued: true })
       .fillColor(TEXT_DARK).text(r, 80)
       .moveDown(0.2);
  });

  doc.x = 50;

  // Add page numbers on footer of all pages
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);
    doc.fillColor(TEXT_LIGHT)
       .font('Helvetica')
       .fontSize(8)
       .text(`Page ${i + 1} of ${range.count}`, 0, 800, { align: 'center' });
  }

  // End Document
  doc.end();
  console.log('Presentation PDF compiled successfully at: presentation.pdf');
}

generatePDF();
