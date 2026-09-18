import re

with open("src/lib/exportUtils.ts", "r") as f:
    content = f.read()

# Replace the HTML and styles for exportToPDF
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
        line-height: 1.6;
        font-size: 11pt;
      }
      .pdf-header-table { width: 100%; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
      .pdf-header-table td { padding: 0; vertical-align: middle; border: none; }
      .pdf-logo { width: 45px; height: 45px; background-color: #000; border-radius: 8px; text-align: center; line-height: 45px; }
      .pdf-logo span { color: #fff; font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif; font-size: 26px; font-weight: bold; }
      .pdf-header-title { padding-left: 15px !important; }
      .pdf-header-title h1 { color: #000; font-size: 20pt; margin: 0 0 5px 0; border-bottom: none; padding-bottom: 0; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
      .pdf-header-title p { color: #555; font-size: 9pt; margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; text-transform: uppercase; letter-spacing: 1px; }
      
      .markdown-content { font-size: 11pt; text-align: justify; text-justify: inter-word; color: #000; }
      .markdown-content h1, .markdown-content h2, .markdown-content h3 { margin-top: 24pt; margin-bottom: 12pt; font-weight: bold; page-break-after: avoid; color: #000; }
      .markdown-content h1 { font-size: 14pt; text-align: center; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 8px; margin-top: 30pt; }
      .markdown-content h2 { font-size: 12pt; text-transform: uppercase; }
      .markdown-content h3 { font-size: 11pt; text-decoration: underline; }
      .markdown-content p { margin-bottom: 12pt; widows: 3; orphans: 3; }
      .markdown-content strong { font-weight: bold; }
      .markdown-content em { font-style: italic; }
      .markdown-content ul, .markdown-content ol { margin-bottom: 12pt; padding-left: 24pt; }
      .markdown-content li { margin-bottom: 6pt; page-break-inside: avoid; }
      .markdown-content blockquote { margin: 12pt 24pt; font-style: italic; color: #333; border-left: 3px solid #ccc; padding-left: 12pt; }
      .markdown-content p:empty { display: none; }
      .markdown-content table { width: 100%; border-collapse: collapse; margin-bottom: 12pt; page-break-inside: auto; }
      .markdown-content tr { page-break-inside: avoid; page-break-after: auto; }
      .markdown-content th, .markdown-content td { border: 1px solid #000; padding: 8pt; text-align: left; }
      .markdown-content th { background-color: #f5f5f5; font-weight: bold; }
      
      .pdf-footer { margin-top: 40pt; padding-top: 15pt; border-top: 1px solid #000; text-align: center; page-break-inside: avoid; }
      .pdf-footer .brand { margin: 0; font-weight: bold; font-size: 9pt; font-family: ui-sans-serif, system-ui, sans-serif; letter-spacing: 1.5px; text-transform: uppercase; }
      .pdf-footer .tagline { margin: 4pt 0 0 0; font-style: italic; font-size: 9pt; color: #555; }
    </style>
    <div class="pdf-content">
      <table class="pdf-header-table">
        <tr>
          <td style="width: 45px;">
            <div class="pdf-logo">
              <span>L</span>
            </div>
          </td>
          <td class="pdf-header-title">
            <h1>${title}</h1>
            <p>Official Document • Legal Advisories</p>
          </td>
          <td style="text-align: right; vertical-align: bottom;">
            <p style="color: #000; font-size: 10pt; font-weight: bold; margin: 0;">Date: ${new Date().toLocaleDateString()}</p>
          </td>
        </tr>
      </table>
      
      <div class="markdown-content">
        ${htmlContent}
      </div>
      
      <div class="pdf-footer">
        <p class="brand">Legal Advisories</p>
        <p class="tagline">Generated via AI-assisted legal drafting</p>
      </div>
    </div>
  `;
  
  const opt: any = {
    margin:       [25, 25, 25, 25],
    filename:     `${title.replace(/\s+/g, '_')}.pdf`,
    image:        { type: 'jpeg', quality: 1.0 },
    html2canvas:  { scale: 3, useCORS: true, letterRendering: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
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
