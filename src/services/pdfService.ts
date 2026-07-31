import { PDFDocument, StandardFonts } from 'pdf-lib';
import { adminDb, adminStorage } from '../lib/firebase-admin';

export async function generateAndStorePdf(
  userId: string,
  title: string,
  documentType: string,
  content: string
): Promise<{ downloadUrl: string, fileName: string }> {
  
  // 1. Generate PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  page.drawText(title, { x: 50, y: 750, size: 20, font });
  
  // Simple word wrapping for content
  const lines = content.split('\n');
  let y = 750;
  let currentPage = page;
  
  for (const line of lines) {
    if (y < 50) {
      currentPage = pdfDoc.addPage([600, 800]);
      y = 750;
    }
    currentPage.drawText(line, { x: 50, y, size: 12, font });
    y -= 20;
  }

  const pdfBytes = await pdfDoc.save();

  // 2. Upload to Storage
  const timestamp = Date.now();
  const fileName = `${title.replace(/\s+/g, '_')}_${timestamp}.pdf`;
  const storagePath = `documents/${userId}/${fileName}`;
  const file = adminStorage.file(storagePath);
  
  await file.save(Buffer.from(pdfBytes), {
    contentType: 'application/pdf',
  });

  const [downloadUrl] = await file.getSignedUrl({
    action: 'read',
    expires: '03-01-2500', // Long expiry
  });

  // 3. Save to Firestore
  const docRef = await adminDb.collection('documents').add({
    userId,
    title,
    documentType,
    fileName,
    downloadUrl,
    storagePath,
    createdAt: timestamp
  });

  return { downloadUrl, fileName };
}
