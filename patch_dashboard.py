import re

with open("src/pages/Dashboard.tsx", "r") as f:
    content = f.read()

# 1. Add import
if "DynamicForm" not in content:
    content = content.replace("import { ExportMenu } from '../components/ExportMenu';", "import { ExportMenu } from '../components/ExportMenu';\nimport { DynamicForm } from '../components/DynamicForm';")

# 2. Modify rendering of model message
old_render = """                  <div className="text-[15px] prose prose-gray max-w-none prose-p:leading-relaxed">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>"""

new_render = """                  <div className="text-[15px] prose prose-gray max-w-none prose-p:leading-relaxed">
                    {(() => {
                      const formMatch = msg.content.match(/```json\\n([\\s\\S]*?)\\n```/);
                      let formSchema = null;
                      let textContent = msg.content;
                      if (formMatch) {
                        try {
                          const parsed = JSON.parse(formMatch[1]);
                          if (parsed.type === 'dynamic_form') {
                            formSchema = parsed;
                            textContent = msg.content.replace(formMatch[0], '');
                          }
                        } catch (e) {}
                      }
                      
                      return (
                        <div className="flex flex-col lg:flex-row gap-6 w-full">
                          <div className="flex-1">
                            <ReactMarkdown>{textContent}</ReactMarkdown>
                          </div>
                          {formSchema && (
                            <div className="w-full lg:w-80 shrink-0">
                              <DynamicForm 
                                schema={formSchema} 
                                disabled={idx !== chatHistory.length - 1}
                                onSubmit={(data) => handleAskLegalAdvisories(data)} 
                              />
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>"""

if old_render in content:
    content = content.replace(old_render, new_render)
    with open("src/pages/Dashboard.tsx", "w") as f:
        f.write(content)
    print("Patched Dashboard.tsx successfully")
else:
    print("Could not find old render block")
