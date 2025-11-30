# Receipt Bulk Print

A Next.js web application for bulk printing receipts/invoices. Runs 100% client-side without server API.

## ✨ Features

- ✅ Upload multiple files at once (JPG/PNG/PDF)
- ✅ Drag & drop upload
- ✅ A4 layout preview before printing
- ✅ Choose number of images per page (1, 2, 3, 4, 6, 8, 9, 12, 15, 16)
- ✅ Crop PDF with Cropper.js
- ✅ Auto-crop PDFs from top-left corner
- ✅ Manual crop option for precise control
- ✅ Print-ready with accurate physical size (A4)
- ✅ Dark/Light mode toggle
- ✅ Responsive design
- ✅ 100% client-side processing (no API server)

## 🛠️ Tech Stack

- **Next.js 14+** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **pdf.js** (PDF rendering)
- **Cropper.js** (PDF cropping)
- **react-to-print** (Print functionality)

## 🚀 Getting Started

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

This application is 100% client-side and does not require server API or environment variables.

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
- Image size: 430×430px (1:1 ratio) - auto-fit
- Print resolution: High quality
- Print media query for accurate size

## 🔧 Project Structure

```
├── app/
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
│   └── ThemeToggle.tsx     # Dark/light mode toggle
├── utils/
│   └── pdfAutoCrop.ts      # PDF auto-crop utility
└── types/
    └── index.ts            # TypeScript types
```

## 📦 Dependencies

- `next` - Next.js framework
- `react` & `react-dom` - React library
- `pdfjs-dist` - PDF rendering
- `cropperjs` - Image cropping
- `react-cropper` - React wrapper for Cropper.js
- `react-to-print` - Print functionality
- `tailwindcss` - CSS framework
- `phosphor-react` - Icons

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

