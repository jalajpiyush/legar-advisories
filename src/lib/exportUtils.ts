import { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType, BorderStyle } from 'docx';
import { marked } from 'marked';

// Helper to save Blob
export const saveFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToText = (title: string, markdownContent: string) => {
  // Strip simple markdown for text if we want, or just leave as is.
  // For a basic text export, plain markdown is usually fine, or stripped markdown.
  let plainText = markdownContent.replace(/\*\*(.*?)\*\*/g, '$1');
  plainText = plainText.replace(/\*(.*?)\*/g, '$1');
  plainText = plainText.replace(/#(.*?)\n/g, '$1\n');
  
  const content = `${title}\n\nDate: ${new Date().toLocaleDateString()}\n\n${plainText}\n\n--------------------------------\nLegal Advisories\nAI-assisted legal drafting`;
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveFile(blob, `${title.replace(/\s+/g, '_')}.txt`);
};

export const exportToMarkdown = (title: string, markdownContent: string) => {
  const content = `# ${title}\n\n*Date: ${new Date().toLocaleDateString()}*\n\n${markdownContent}\n\n---\n*Legal Advisories - AI-assisted legal drafting*`;
  
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  saveFile(blob, `${title.replace(/\s+/g, '_')}.md`);
};

export const exportToWord = async (title: string, markdownContent: string) => {
  // A basic markdown parser for docx
  // We'll split by double newline for paragraphs, then parse bold/italic etc.
  
  const children: any[] = [];
  
  // Title
  children.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    }),
    new Paragraph({
      text: `Date: ${new Date().toLocaleDateString()}`,
      alignment: AlignmentType.RIGHT,
      spacing: { after: 400 }
    })
  );

  const blocks = markdownContent.split('\n\n');
  
  for (const block of blocks) {
    if (block.startsWith('# ')) {
      children.push(new Paragraph({ text: block.replace('# ', ''), heading: HeadingLevel.HEADING_1, spacing: { before: 240, after: 120 } }));
    } else if (block.startsWith('## ')) {
      children.push(new Paragraph({ text: block.replace('## ', ''), heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 } }));
    } else if (block.startsWith('### ')) {
      children.push(new Paragraph({ text: block.replace('### ', ''), heading: HeadingLevel.HEADING_3, spacing: { before: 240, after: 120 } }));
    } else if (block.startsWith('- ') || block.startsWith('* ')) {
      const listItems = block.split('\n');
      for (const item of listItems) {
        if (item.trim()) {
          children.push(new Paragraph({
            text: item.replace(/^[-*]\s/, ''),
            bullet: { level: 0 }
          }));
        }
      }
    } else if (block.match(/^\d+\.\s/)) {
      const listItems = block.split('\n');
      for (const item of listItems) {
        if (item.trim()) {
          children.push(new Paragraph({
            text: item.replace(/^\d+\.\s/, ''),
            numbering: { reference: "numbered-list", level: 0 }
          }));
        }
      }
    } else {
      // Basic bold parsing inside paragraph
      const runs = [];
      let currentText = "";
      let isBold = false;
      
      const parts = block.split(/(\*\*.*?\*\*)/g);
      for (const part of parts) {
        if (part.startsWith('**') && part.endsWith('**')) {
          runs.push(new TextRun({ text: part.slice(2, -2), bold: true }));
        } else {
          runs.push(new TextRun({ text: part }));
        }
      }
      
      children.push(new Paragraph({ children: runs, spacing: { after: 120 } }));
    }
  }
  
  children.push(
    new Paragraph({
      text: "",
      border: {
        top: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 }
      },
      spacing: { before: 400, after: 120 }
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Legal Advisories", bold: true })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "AI-assisted legal drafting", italics: true })]
    })
  );

  const doc = new Document({
    sections: [{
      properties: {},
      children: children
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveFile(blob, `${title.replace(/\s+/g, '_')}.docx`);
};

export const exportToPDF = async (fallbackTitle: string, htmlContent: string) => {
  const html2pdf = (await import('html2pdf.js')).default;
  
  // Extract the actual document title from the first <h1> tag in the HTML content
  const h1Match = htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/i);
  let documentTitle = fallbackTitle;
  
  if (h1Match && h1Match[1]) {
    // Strip any nested HTML tags inside the h1 to get clean text
    const cleanH1Text = h1Match[1].replace(/<[^>]+>/g, '').trim();
    if (cleanH1Text) {
      documentTitle = cleanH1Text;
    }
  }
  
  // Clean up title for filename
  const safeFilename = documentTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  
  const element = document.createElement('div');
  element.innerHTML = `
    <style>
      .pdf-content { 
        font-family: 'Times New Roman', Times, serif; 
        color: #000; 
        line-height: 1.5; /* Standard legal line spacing */
        font-size: 12pt; /* Strict court standard font size */
      }
      
      .markdown-content { font-size: 12pt; text-align: justify; text-justify: inter-word; color: #000; }
      .markdown-content h1:first-of-type { display: none; } /* Hide the original h1 since it's now in the header */
      .markdown-content h1, .markdown-content h2, .markdown-content h3 { font-weight: bold; page-break-after: avoid; color: #000; margin-top: 18pt; margin-bottom: 12pt; }
      .markdown-content h1 { font-size: 12pt; text-align: center; text-transform: uppercase; } 
      .markdown-content h2 { font-size: 12pt; text-decoration: underline; }
      .markdown-content h3 { font-size: 12pt; }
      .markdown-content p { margin-bottom: 12pt; widows: 3; orphans: 3; }
      .markdown-content strong { font-weight: bold; }
      .markdown-content em { font-style: italic; }
      .markdown-content ul, .markdown-content ol { margin-bottom: 12pt; padding-left: 36pt; }
      .markdown-content li { margin-bottom: 6pt; page-break-inside: avoid; }
      .markdown-content blockquote { margin: 12pt 36pt; font-style: italic; color: #000; }
      .markdown-content p:empty { display: none; }
      .markdown-content table { width: 100%; border-collapse: collapse; margin-bottom: 12pt; page-break-inside: auto; }
      .markdown-content tr { page-break-inside: avoid; page-break-after: auto; }
      .markdown-content th, .markdown-content td { border: 1px solid #000; padding: 8pt; text-align: left; }
      
      .pdf-footer { margin-top: 40pt; padding-top: 10pt; border-top: 1px solid #000; text-align: center; page-break-inside: avoid; }
      .pdf-footer .brand { margin: 0; font-weight: bold; font-size: 10pt; font-family: 'Times New Roman', Times, serif; text-transform: uppercase; letter-spacing: 1px; }
    </style>
    <div class="pdf-content">
      <!-- Failsafe Table Layout for Header -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24pt; border: none;">
        <tr>
          <td style="text-align: left; vertical-align: middle; padding: 0; border: none; width: 120px;">
            <div style="width: 45px; height: 45px;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
                <rect width="100" height="100" fill="black" rx="16" />
                <path d="M 28.69 23.36 L 56 23.36 L 46 33 L 46 63.36 L 62 63.36 L 70.39 55 L 70.39 73.36 L 28.69 73.36 L 38 63.36 L 38 33 Z" fill="white" />
              </svg>
            </div>
          </td>
          <td style="text-align: center; vertical-align: middle; padding: 0; border: none;">
            <h2 style="margin: 0; font-size: 14pt; font-weight: bold; text-transform: uppercase; color: #000; border: none; padding: 0; text-decoration: none;">${documentTitle}</h2>
          </td>
          <td style="text-align: right; vertical-align: middle; padding: 0; border: none; width: 120px;">
            <p style="color: #000; font-size: 11pt; margin: 0; font-family: 'Times New Roman', Times, serif; font-weight: bold;">Date: ${new Date().toLocaleDateString()}</p>
          </td>
        </tr>
      </table>
      
      <div class="markdown-content">
        ${htmlContent}
      </div>
      
      <div class="pdf-footer">
        <p class="brand">Legal Advisories</p>
      </div>
    </div>
  `;
  
  const opt: any = {
    margin:       [25.4, 25.4, 25.4, 25.4], // 1-inch margins (strict court standard)
    filename:     `${safeFilename}.pdf`,
    image:        { type: 'jpeg', quality: 1.0 },
    html2canvas:  { scale: 2, useCORS: true, letterRendering: true, windowWidth: 800 },
    jsPDF:        { unit: 'mm', format: 'letter', orientation: 'portrait' }, // Letter size is standard for US courts
    pagebreak:    { mode: ['css', 'legacy'] }
  };
  
  html2pdf().set(opt).from(element).save();
};

export const markdownToHtml = async (md: string) => {
  return marked.parse(md);
};

export const copyToClipboard = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (err) {
    console.error('Failed to copy', err);
    return false;
  }
};
