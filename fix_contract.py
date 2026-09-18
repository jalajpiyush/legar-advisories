import os
import re

with open("src/pages/ContractReview.tsx", "r") as f:
    content = f.read()

# Replace the AI Analysis Summary section
old_summary = """              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-800 dark:border-neutral-200 pb-2">
                  <span className="text-sm text-gray-400 dark:text-neutral-500">Document Type</span>
                  <span className="text-sm font-medium text-gray-200">Services Agreement</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-800 dark:border-neutral-200 pb-2">
                  <span className="text-sm text-gray-400 dark:text-neutral-500">Risk Score</span>
                  <span className="text-sm font-bold text-amber-500">Medium / 64%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400 dark:text-neutral-500">Missing Clauses</span>
                  <span className="text-sm font-medium text-red-400">Data Privacy (GDPR)</span>
                </div>
              </div>"""

new_summary = """              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Contract Risk Score</h4>
                <div className="h-px w-full bg-gray-800 dark:bg-neutral-200 my-2"></div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-sm font-medium text-red-400">High Risk</span>
                  </div>
                  <span className="text-sm font-bold text-white">2</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-sm font-medium text-amber-400">Medium Risk</span>
                  </div>
                  <span className="text-sm font-bold text-white">5</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium text-green-400">Low Risk</span>
                  </div>
                  <span className="text-sm font-bold text-white">14</span>
                </div>
              </div>"""

content = content.replace(old_summary, new_summary)


# Replace the Detected Issues section
old_issues = """              <h3 className="text-sm font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-4">Detected Issues</h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <div className="ml-2">
                      <p className="text-sm font-medium text-red-200">Unenforceable Non-Compete</p>
                      <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1">Section 8 specifies a 5-year term.</p>
                      <button className="text-xs text-indigo-400 mt-2 font-medium hover:text-indigo-300">Draft counter-proposal</button>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <div className="ml-2">
                      <p className="text-sm font-medium text-amber-200">Low Liability Cap</p>
                      <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1">Section 3 limits liability to 12 months fees.</p>
                      <button className="text-xs text-indigo-400 mt-2 font-medium hover:text-indigo-300">Draft counter-proposal</button>
                    </div>
                  </div>
                </div>
              </div>"""


new_issues = """              <h3 className="text-sm font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-4">Major Issues</h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-start">
                    <span className="text-red-400 font-bold mr-2">1.</span>
                    <div className="ml-1">
                      <p className="text-sm font-medium text-red-200">One-sided termination clause</p>
                      <p className="text-xs text-gray-400 mt-1">Only provider can terminate without cause.</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-start">
                    <span className="text-red-400 font-bold mr-2">2.</span>
                    <div className="ml-1">
                      <p className="text-sm font-medium text-red-200">Unlimited liability</p>
                      <p className="text-xs text-gray-400 mt-1">No liability cap defined for intellectual property.</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <div className="flex items-start">
                    <span className="text-amber-400 font-bold mr-2">3.</span>
                    <div className="ml-1">
                      <p className="text-sm font-medium text-amber-200">Missing dispute-resolution clause</p>
                      <p className="text-xs text-gray-400 mt-1">No jurisdiction or arbitration method specified.</p>
                    </div>
                  </div>
                </div>
              </div>"""

content = content.replace(old_issues, new_issues)

with open("src/pages/ContractReview.tsx", "w") as f:
    f.write(content)

