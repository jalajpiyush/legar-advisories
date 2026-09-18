import re

with open("src/pages/History.tsx", "r") as f:
    content = f.read()

if "ExportMenu" not in content:
    content = content.replace("import ReactMarkdown", "import ReactMarkdown;\nimport { ExportMenu } from '../components/ExportMenu';")

old_buttons = """                        <div className="flex items-center gap-1 self-center">
                          <button onClick={(e) => handleDelete(e, item.id)} className="p-2 text-gray-400 dark:text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete chat">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </button>"""

new_buttons = """                        <div className="flex items-center gap-1 self-center" onClick={(e) => e.stopPropagation()}>
                          {item.messages && item.messages.length > 0 && (
                            <ExportMenu title={item.title} content={item.messages.map(msg => `**${msg.role === 'user' ? 'User' : 'Legal Advisories'}**\\n\\n${msg.content}`).join('\\n\\n---\\n\\n')} />
                          )}
                          <button onClick={(e) => handleDelete(e, item.id)} className="p-2 text-gray-400 dark:text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete chat">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </button>"""

content = content.replace(old_buttons, new_buttons)

with open("src/pages/History.tsx", "w") as f:
    f.write(content)

