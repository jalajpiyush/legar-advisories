import re

with open("src/lib/exportUtils.ts", "r") as f:
    content = f.read()

old_export_fn_match = re.search(r'export const exportToPDF = async \(title: string, htmlContent: string\) => \{.*?html2pdf\(\)\.set\(opt\)\.from\(element\)\.save\(\);\n\};', content, re.DOTALL)

if old_export_fn_match:
    old_export_fn = old_export_fn_match.group(0)
    
    new_export_fn = """export const exportToPDF = async (title: string, htmlContent: string) => {
  const html2pdf = (await import('html2pdf.js')).default;
  
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
      .markdown-content h1, .markdown-content h2, .markdown-content h3 { font-weight: bold; page-break-after: avoid; color: #000; margin-top: 18pt; margin-bottom: 12pt; }
      .markdown-content h1 { font-size: 12pt; text-align: center; text-transform: uppercase; } /* Court headings are not oversized */
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
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30pt; border: none;">
        <tr>
          <td style="text-align: left; vertical-align: top; padding: 0; border: none;">
            <div style="width: 45px; height: 45px;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
                <rect width="100" height="100" fill="black" rx="16" />
                <path d="M 28.69 23.36 L 56 23.36 L 46 33 L 46 63.36 L 62 63.36 L 70.39 55 L 70.39 73.36 L 28.69 73.36 L 38 63.36 L 38 33 Z" fill="white" />
              </svg>
            </div>
          </td>
          <td style="text-align: right; vertical-align: top; padding: 0; border: none;">
            <p style="color: #000; font-size: 11pt; margin: 0; font-family: 'Times New Roman', Times, serif;">Date: ${new Date().toLocaleDateString()}</p>
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
    filename:     `${title.replace(/\s+/g, '_')}.pdf`,
    image:        { type: 'jpeg', quality: 1.0 },
    html2canvas:  { scale: 2, useCORS: true, letterRendering: true, windowWidth: 800 },
    jsPDF:        { unit: 'mm', format: 'letter', orientation: 'portrait' }, // Letter size is standard for US courts
    pagebreak:    { mode: ['css', 'legacy'] }
  };
  
  html2pdf().set(opt).from(element).save();
};"""
    
    content = content.replace(old_export_fn, new_export_fn)
    with open("src/lib/exportUtils.ts", "w") as f:
        f.write(content)
    print("Updated exportUtils.ts successfully!")
else:
    print("Failed to find exportToPDF function")
