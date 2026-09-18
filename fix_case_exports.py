import re

with open("src/pages/CaseDetail.tsx", "r") as f:
    content = f.read()

if "ExportMenu" not in content:
    content = content.replace("import { cn } from '../lib/utils';", "import { cn } from '../lib/utils';\nimport { ExportMenu } from '../components/ExportMenu';")

old_header = """        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-neutral-400" />
          </button>
          <div>
            <div className="text-sm font-semibold text-[#c6a87c] tracking-wider uppercase mb-1">CASE: {caseData.caseType || 'Matter'}</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{caseData.title}</h1>
          </div>
        </div>"""

new_header = """        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-neutral-400" />
            </button>
            <div>
              <div className="text-sm font-semibold text-[#c6a87c] tracking-wider uppercase mb-1">CASE: {caseData.caseType || 'Matter'}</div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{caseData.title}</h1>
            </div>
          </div>
          <ExportMenu 
            title={`Case Summary - ${caseData.title}`} 
            content={`# Case: ${caseData.title}\n\n**Type:** ${caseData.caseType || 'Matter'}\n**Status:** ${caseData.status || 'Active'}\n\n## Description\n${caseData.description || "No description provided."}`} 
            buttonVariant="outline" 
          />
        </div>"""

content = content.replace(old_header, new_header)

with open("src/pages/CaseDetail.tsx", "w") as f:
    f.write(content)

