import re

with open("src/lib/exportUtils.ts", "r") as f:
    content = f.read()

old_pdf_func = """export const exportToPDF = async (title: string, htmlContent: string) => {
  // Using html2pdf for this is easier. But we must lazily import it because it requires window
  const html2pdf = (await import('html2pdf.js')).default;
  
  const element = document.createElement('div');
  element.innerHTML = `
    <div style="padding: 20px; font-family: 'Times New Roman', Times, serif; color: #000; line-height: 1.6;">
      <h1 style="text-align: center; color: #111; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">${title}</h1>
      <p style="text-align: right; color: #555; margin-bottom: 30px;">Date: ${new Date().toLocaleDateString()}</p>
      <div style="font-size: 14px;">
        ${htmlContent}
      </div>
      <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #000; text-align: center;">
        <p style="margin: 0; font-weight: bold; font-size: 14px;">Legal Advisories</p>
        <p style="margin: 0; font-style: italic; font-size: 12px; color: #555;">AI-assisted legal drafting</p>
      </div>
    </div>
  `;
  
  const opt: any = {
    margin:       [15, 15, 15, 15],
    filename:     `${title.replace(/\s+/g, '_')}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  
  html2pdf().set(opt).from(element).save();
};"""

new_pdf_func = """export const exportToPDF = async (title: string, htmlContent: string) => {
  const html2pdf = (await import('html2pdf.js')).default;
  
  const element = document.createElement('div');
  element.innerHTML = `
    <style>
      .pdf-content { padding: 20px; font-family: 'Times New Roman', Times, serif; color: #000; line-height: 1.6; }
      .pdf-header h1 { text-align: center; color: #111; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; font-size: 24px; }
      .pdf-header p { text-align: right; color: #555; margin-bottom: 30px; font-size: 14px; }
      .markdown-content { font-size: 14px; text-align: justify; text-justify: inter-word; }
      .markdown-content h1, .markdown-content h2, .markdown-content h3 { margin-top: 1.5em; margin-bottom: 0.5em; font-weight: bold; page-break-after: avoid; }
      .markdown-content h1 { font-size: 20px; }
      .markdown-content h2 { font-size: 18px; }
      .markdown-content h3 { font-size: 16px; }
      .markdown-content p { margin-bottom: 1em; widows: 3; orphans: 3; }
      .markdown-content ul, .markdown-content ol { margin-bottom: 1em; padding-left: 2em; }
      .markdown-content ul { list-style-type: disc; }
      .markdown-content ol { list-style-type: decimal; }
      .markdown-content li { margin-bottom: 0.5em; page-break-inside: avoid; }
      .markdown-content table { width: 100%; border-collapse: collapse; margin-bottom: 1em; page-break-inside: auto; }
      .markdown-content tr { page-break-inside: avoid; page-break-after: auto; }
      .markdown-content th, .markdown-content td { border: 1px solid #ccc; padding: 8px; text-align: left; }
      .markdown-content th { background-color: #f5f5f5; font-weight: bold; }
      .markdown-content blockquote { border-left: 4px solid #ccc; margin: 1em 0; padding-left: 1em; color: #555; page-break-inside: avoid; }
      .markdown-content pre { background-color: #f5f5f5; padding: 1em; overflow-x: auto; font-family: monospace; white-space: pre-wrap; word-wrap: break-word; page-break-inside: avoid; }
      .markdown-content code { background-color: #f5f5f5; padding: 0.2em 0.4em; font-family: monospace; font-size: 90%; }
      .pdf-footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #000; text-align: center; page-break-inside: avoid; }
      .pdf-footer .brand { margin: 0; font-weight: bold; font-size: 14px; }
      .pdf-footer .tagline { margin: 0; font-style: italic; font-size: 12px; color: #555; }
    </style>
    <div class="pdf-content">
      <div class="pdf-header">
        <h1>${title}</h1>
        <p>Date: ${new Date().toLocaleDateString()}</p>
      </div>
      <div class="markdown-content">
        ${htmlContent}
      </div>
      <div class="pdf-footer">
        <p class="brand">Legal Advisories</p>
        <p class="tagline">AI-assisted legal drafting</p>
      </div>
    </div>
  `;
  
  const opt: any = {
    margin:       [15, 15, 15, 15],
    filename:     `${title.replace(/\\s+/g, '_')}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak:    { mode: ['css', 'legacy'] }
  };
  
  html2pdf().set(opt).from(element).save();
};"""

if old_pdf_func in content:
    content = content.replace(old_pdf_func, new_pdf_func)
else:
    print("Could not find old pdf func")

with open("src/lib/exportUtils.ts", "w") as f:
    f.write(content)
