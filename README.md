# Receipt Bulk Print

A Next.js web application for bulk printing receipts/invoices. Runs 100% client-side without server API.

## ✨ Features

### Receipt Bulk Print
- ✅ Upload multiple files at once (JPG/PNG/PDF)
- ✅ Drag & drop upload
- ✅ A4 layout preview before printing
- ✅ Choose number of images per page (1, 2, 3, 4, 6, 8, 9, 12, 15, 16)
- ✅ Crop PDF with Cropper.js
- ✅ Auto-crop PDFs from top-left corner
- ✅ Manual crop option for precise control
- ✅ Print-ready with accurate physical size (A4)
- ✅ 100% client-side processing (no API server)

### Debt List Management
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Record payments with automatic status updates
- ✅ Filter by name, status, date, and due date
- ✅ Complete audit log for all debt operations
- ✅ Track payment history
- ✅ Automatic calculation of remaining amounts
- ✅ Status management (pending, partial, paid, overdue)
- ✅ Dark/Light mode toggle
- ✅ Responsive design

## 🛠️ Tech Stack

- **Next.js 14+** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **pdf.js** (PDF rendering)
- **Cropper.js** (PDF cropping)
- **react-to-print** (Print functionality)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm (or npm)
- Supabase account (for backend features)

### Environment Setup

1. **Copy environment variables:**
   ```bash
   cp .env.example .env.local
   ```

2. **Get Supabase credentials:**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Create a new project or select an existing one
   - Go to Settings → API
   - Copy your Project URL and anon/public key

3. **Update `.env.local`:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up database tables:**
   - Go to Supabase Dashboard → SQL Editor
   - Run the SQL migration file: `supabase-migration.sql`
   - This will create the `debts` and `debt_logs` tables with proper indexes and triggers

### Development

```bash
# Install dependencies
npm install
# or
pnpm install

# Run development server
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
# or
pnpm build
```

### Deploy to Vercel

1. **Via CLI:**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Via GitHub:**
   - Push code to GitHub repository
   - Import project in [Vercel Dashboard](https://vercel.com)
   - Automatic deployment

## 🔌 API Routes

The application includes Next.js API routes for backend functionality:

- `GET /api/health` - Health check endpoint to verify Supabase connection
- `GET /api/example` - Example API route demonstrating Supabase usage
- `POST /api/example` - Example POST endpoint

### Using Supabase in API Routes

```typescript
import { supabase } from '@/lib/supabase/client';

// Client-side usage
const { data, error } = await supabase.from('table_name').select('*');

// Server-side usage (in API routes)
import { createServerClient } from '@/lib/supabase/server';
const supabase = createServerClient();
```

## 📊 Debt List Management

The Debt List feature provides comprehensive debt tracking with:

### Features
- **CRUD Operations**: Create, read, update, and delete debt records
- **Payment Tracking**: Record payments with automatic status updates
- **Filtering**: Filter by name, status, creation date, and due date
- **Audit Logs**: Complete history of all debt operations
- **Automatic Calculations**: Remaining amounts calculated automatically
- **Status Management**: Automatic status updates (pending → partial → paid)

### API Endpoints

- `GET /api/debts` - List all debts (with optional filters)
- `POST /api/debts` - Create new debt
- `GET /api/debts/[id]` - Get single debt
- `PUT /api/debts/[id]` - Update debt
- `DELETE /api/debts/[id]` - Delete debt
- `POST /api/debts/[id]/payment` - Record payment
- `GET /api/debts/[id]/logs` - Get debt logs

### Database Schema

The application uses two main tables:

**debts** - Main debt records
- `id` (UUID)
- `name` (VARCHAR)
- `amount` (DECIMAL)
- `paid_amount` (DECIMAL)
- `remaining_amount` (DECIMAL)
- `status` (pending/partial/paid/overdue)
- `due_date` (TIMESTAMP)
- `paid_date` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**debt_logs** - Audit trail
- `id` (UUID)
- `debt_id` (UUID, FK)
- `action` (create/update/payment/delete)
- `old_value` (JSONB)
- `new_value` (JSONB)
- `amount_paid` (DECIMAL)
- `notes` (TEXT)
- `created_at` (TIMESTAMP)

Run the SQL migration file (`supabase-migration.sql`) in your Supabase SQL Editor to create these tables.

## 📝 How to Use

1. **Upload Files**: Click the upload area or drag & drop files (JPG, PNG, PDF)
2. **Crop PDF** (if needed): 
   - When uploading PDFs, a choice modal will appear
   - Choose "Auto Crop All" to automatically crop all PDFs from top-left corner
   - Or choose "Manual Crop (One by One)" to review and crop each PDF manually
3. **Set Layout**: Select the number of images per page (1, 2, 3, 4, 6, 8, 9, 12, 15, or 16)
4. **Preview**: View the A4 layout preview before printing
5. **Print**: Click the "Print" button to print

## 🎯 Layout Options

- **1 image**: Centered on A4 paper
- **2 images**: Vertical layout (2×1)
- **3 images**: Horizontal layout (3×1)
- **4 images**: Grid 2×2
- **6 images**: Grid 2×3
- **8 images**: Grid 2×4
- **9 images**: Grid 3×3
- **12 images**: Grid 4×3
- **15 images**: Grid 5×3
- **16 images**: Grid 4×4

## 📄 Print Specifications

- Paper size: A4 (210mm × 297mm)
- Image resolution: 860×860px (2x resolution for high-quality printing)
- Display size: 430×430px (1:1 ratio) - auto-fit
- Print quality: High-resolution (2x multiplier) for crisp, clear prints
- Print media query for accurate size

## 🔧 Project Structure

```
├── app/
│   ├── api/                # API routes (Next.js server routes)
│   │   ├── health/         # Health check endpoint
│   │   ├── example/        # Example API route
│   │   └── debts/          # Debt CRUD API routes
│   │       ├── [id]/       # Individual debt operations
│   │       │   ├── payment/ # Payment recording
│   │       │   └── logs/   # Debt logs
│   │       └── route.ts   # List and create debts
│   ├── debt-list/          # Debt list management page
│   ├── receipt-bulk-print/ # Receipt bulk print page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page
│   └── globals.css         # Global styles + print styles
├── components/
│   ├── FileUploader.tsx    # Upload component with drag & drop
│   ├── FileList.tsx        # File list display
│   ├── PrintPreviewA4.tsx # A4 preview component
│   ├── PrintableContent.tsx # Printable content for react-to-print
│   ├── PdfCropperModal.tsx # PDF cropper modal
│   ├── PdfCropChoiceModal.tsx # PDF crop choice modal
│   ├── AutoCropProgressModal.tsx # Auto crop progress modal
│   ├── DebtForm.tsx        # Debt create/edit form
│   ├── DebtTable.tsx       # Debt list table with filters
│   ├── PaymentDialog.tsx   # Payment recording dialog
│   ├── DebtLogsDialog.tsx # Debt logs viewer
│   └── ThemeToggle.tsx     # Dark/light mode toggle
├── lib/
│   ├── supabase/          # Supabase client configuration
│   │   ├── client.ts      # Client-side Supabase client
│   │   └── server.ts      # Server-side Supabase client
│   └── utils.ts           # Utility functions
├── utils/
│   └── pdfAutoCrop.ts      # PDF auto-crop utility
└── types/
    └── index.ts            # TypeScript types
```

## 📦 Dependencies

- `next` - Next.js framework
- `react` & `react-dom` - React library
- `@supabase/supabase-js` - Supabase client library
- `react-hook-form` - Form management
- `@hookform/resolvers` - Form validation resolvers
- `zod` - Schema validation
- `date-fns` - Date formatting
- `pdfjs-dist` - PDF rendering
- `cropperjs` - Image cropping
- `react-cropper` - React wrapper for Cropper.js
- `react-to-print` - Print functionality
- `tailwindcss` - CSS framework
- `phosphor-react` & `lucide-react` - Icons

## ⚠️ Important Notes

- This application is **100% client-side**, all files are processed in the browser
- Files are **not saved** on the server, only in browser memory
- PDF.js worker is loaded from CDN (unpkg.com)
- For production, consider self-hosting PDF.js worker for better performance

## 🐛 Troubleshooting

**PDF cannot be loaded?**
- Make sure the PDF file is valid and not corrupted
- Check browser console for detailed errors
- If you see "worker failed" error, make sure internet connection is active (to load worker from CDN)
- PDF.js worker is loaded from unpkg.com CDN (more reliable than cdnjs)

**Print is not accurate?**
- Make sure printer settings use A4
- Check browser print preview before printing
- Disable "Fit to page" or scaling in print dialog

