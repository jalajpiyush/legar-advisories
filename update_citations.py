import re

with open("src/pages/Dashboard.tsx", "r") as f:
    content = f.read()

old_model_msg = "const modelMsg = { role: 'model' as const, content: aiContent };"
new_model_msg = """
      let mockCitations;
      if (aiContent.includes('Section') || aiContent.includes('Act') || aiContent.includes('Article') || aiContent.includes('law')) {
        mockCitations = [
          { source: 'Indian Kanoon', act: 'Negotiable Instruments Act, 1881', section: 'Section 138', doc: 'Dishonour of cheque' }
        ];
      }
      const modelMsg = { role: 'model' as const, content: aiContent, citations: mockCitations };
"""

content = content.replace(old_model_msg, new_model_msg)

# Now update the UI where the message is rendered.
# Search for `<ReactMarkdown>{msg.content}</ReactMarkdown>`
old_render = """                  <div className="text-[15px] prose prose-gray max-w-none prose-p:leading-relaxed">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>"""

new_render = """                  <div className="text-[15px] prose prose-gray max-w-none prose-p:leading-relaxed">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  {msg.citations && msg.citations.length > 0 && (
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
                  )}"""

content = content.replace(old_render, new_render)

with open("src/pages/Dashboard.tsx", "w") as f:
    f.write(content)

