const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');

// Create public directory if it doesn't exist
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copy PDF.js worker to public directory
const workerSrc = path.join(
  __dirname,
  '../node_modules/pdfjs-dist/build/pdf.worker.min.mjs'
);
const workerDest = path.join(publicDir, 'pdf.worker.min.mjs');

const workerSrcAlt = path.join(
  __dirname,
  '../node_modules/pdfjs-dist/build/pdf.worker.min.js'
);
const workerDestAlt = path.join(publicDir, 'pdf.worker.min.js');

// Try to copy .mjs first, fallback to .js
if (fs.existsSync(workerSrc)) {
  fs.copyFileSync(workerSrc, workerDest);
  console.log('✅ Copied PDF.js worker (.mjs) to public folder');
} else if (fs.existsSync(workerSrcAlt)) {
  fs.copyFileSync(workerSrcAlt, workerDestAlt);
  console.log('✅ Copied PDF.js worker (.js) to public folder');
} else {
  console.warn('⚠️  PDF.js worker file not found. Will use CDN fallback.');
  console.warn('   Expected location:', workerSrc);
}

