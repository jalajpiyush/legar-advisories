import re

with open("src/pages/Generator.tsx", "r") as f:
    content = f.read()

# Add import
if "ExportMenu" not in content:
    content = content.replace("import ReactMarkdown", "import { ExportMenu } from '../components/ExportMenu';\nimport ReactMarkdown")

# Replace Export button
old_export_button = """              <div className="relative group">
                <button className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                  <Download className="h-4 w-4" /> Export
                </button>
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-gray-100 dark:border-neutral-800 py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <button onClick={downloadAsPdf} className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">PDF (Print)</button>
                  <button onClick={downloadAsDocx} className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">DOCX</button>
                  <button onClick={downloadAsTxt} className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">TXT</button>
                </div>
              </div>"""

new_export_button = """              <ExportMenu title={docTitle || 'Generated Document'} content={generatedContent} buttonVariant="outline" />"""
content = content.replace(old_export_button, new_export_button)

# Since we might have mock download functions, let's just leave them or remove them.
# The code should compile even if they are unused, or we can replace them if they cause TS warnings.
# But TS won't complain about unused variables if we don't strictly enforce it in the build sometimes, let's see.

with open("src/pages/Generator.tsx", "w") as f:
    f.write(content)

