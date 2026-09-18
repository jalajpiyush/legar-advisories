import re

with open("src/pages/Dashboard.tsx", "r") as f:
    content = f.read()

old_block = """                  {msg.role === 'model' && (
                    <div className="mt-3 pt-2 border-t border-gray-100 dark:border-neutral-800 flex justify-between items-center">
                      <FeedbackButtons message={msg.content} />
                      <ExportMenu title="Legal Advisory Response" content={msg.content} />
                    </div>
                  )}"""

new_block = """                  {msg.role === 'model' && (
                    <div className="mt-3 pt-2 border-t border-gray-100 dark:border-neutral-800 flex justify-between items-center">
                      <FeedbackButtons message={msg.content} />
                      {(msg.content.trim().startsWith('# ') || msg.content.trim().startsWith('## ')) && (
                        <ExportMenu title="Legal Document" content={msg.content} />
                      )}
                    </div>
                  )}"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open("src/pages/Dashboard.tsx", "w") as f:
        f.write(content)
    print("Fixed ExportMenu successfully.")
else:
    print("Could not find the exact block. Falling back to regex.")
    match = re.search(r'\{\s*msg\.role\s*===\s*\'model\'\s*&&\s*\(\s*<div\s+className=\"mt-3\s+pt-2\s+border-t\s+border-gray-100\s+dark:border-neutral-800\s+flex\s+justify-between\s+items-center\">\s*<FeedbackButtons\s+message=\{msg\.content\}\s*/>\s*<ExportMenu\s+title=\"Legal Advisory Response\"\s+content=\{msg\.content\}\s*/>\s*</div>\s*\)\s*\}', content)
    if match:
        content = content.replace(match.group(0), new_block)
        with open("src/pages/Dashboard.tsx", "w") as f:
            f.write(content)
        print("Fixed ExportMenu via regex successfully.")
    else:
        print("Could not find block via regex either.")
