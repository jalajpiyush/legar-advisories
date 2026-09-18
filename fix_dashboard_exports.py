import re

with open("src/pages/Dashboard.tsx", "r") as f:
    content = f.read()

# Add import
import_stmt = "import { ExportMenu } from '../components/ExportMenu';"
if "ExportMenu" not in content:
    content = content.replace("import ReactMarkdown", "import { ExportMenu } from '../components/ExportMenu';\nimport ReactMarkdown")

# Add Export conversation button
# Right before the Incognito button
incognito_search = """        <button
          onClick={() => {"""

export_button_code = """        {chatHistory.length > 0 && (
          <ExportMenu 
            title="Legal Advisories — Conversation Export" 
            content={chatHistory.map(msg => `**${msg.role === 'user' ? 'User' : 'Legal Advisories'}**\n\n${msg.content}`).join('\\n\\n---\\n\\n')} 
            buttonVariant="outline"
          />
        )}
        <button
          onClick={() => {"""
content = content.replace(incognito_search, export_button_code)

# Add Export to AI messages
old_model_msg = """                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-neutral-700/60">
                      <p className="text-xs font-semibold text-gray-500 dark:text-neutral-500 uppercase tracking-wider mb-2">Sources & Citations</p>
                      <div className="space-y-2">
                        {msg.citations.map((cit, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[13px] text-gray-700 dark:text-neutral-300 bg-gray-50 dark:bg-neutral-800/50 p-2 rounded-lg border border-gray-100 dark:border-neutral-800/80">
                            <span className="font-medium text-[#c6a87c]">{cit.source}</span>
                            <span className="text-gray-400 dark:text-neutral-500">→</span>
                            <span className="font-medium">{cit.act}</span>
                            <span className="text-gray-400 dark:text-neutral-500">→</span>
                            <span className="font-medium text-indigo-600 dark:text-indigo-400">{cit.section}</span>
                            <span className="text-gray-400 dark:text-neutral-500">→</span>
                            <span className="truncate">{cit.doc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>"""

new_model_msg = """                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-neutral-700/60">
                      <p className="text-xs font-semibold text-gray-500 dark:text-neutral-500 uppercase tracking-wider mb-2">Sources & Citations</p>
                      <div className="space-y-2">
                        {msg.citations.map((cit, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[13px] text-gray-700 dark:text-neutral-300 bg-gray-50 dark:bg-neutral-800/50 p-2 rounded-lg border border-gray-100 dark:border-neutral-800/80">
                            <span className="font-medium text-[#c6a87c]">{cit.source}</span>
                            <span className="text-gray-400 dark:text-neutral-500">→</span>
                            <span className="font-medium">{cit.act}</span>
                            <span className="text-gray-400 dark:text-neutral-500">→</span>
                            <span className="font-medium text-indigo-600 dark:text-indigo-400">{cit.section}</span>
                            <span className="text-gray-400 dark:text-neutral-500">→</span>
                            <span className="truncate">{cit.doc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {msg.role === 'model' && (
                    <div className="mt-3 pt-2 border-t border-gray-100 dark:border-neutral-800 flex justify-end">
                      <ExportMenu title="Legal Advisory Response" content={msg.content} />
                    </div>
                  )}
                </div>"""
content = content.replace(old_model_msg, new_model_msg)

with open("src/pages/Dashboard.tsx", "w") as f:
    f.write(content)

