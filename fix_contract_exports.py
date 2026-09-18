import re

with open("src/pages/ContractReview.tsx", "r") as f:
    content = f.read()

if "ExportMenu" not in content:
    content = content.replace("import { useState, useRef } from 'react';", "import { useState, useRef } from 'react';\nimport { ExportMenu } from '../components/ExportMenu';")

# Content string for the report
report_string = """const analysisReport = `
# Contract Review Analysis
**Document:** ${file?.name || "Master_Services_Agreement_v2.pdf"}

## Contract Risk Score
- High Risk: 2
- Medium Risk: 5
- Low Risk: 14

## Major Issues
1. One-sided termination clause
   - Only provider can terminate without cause.
2. Unlimited liability
   - No liability cap defined for intellectual property.
3. Missing dispute-resolution clause
   - No jurisdiction or arbitration method specified.
`;
"""

if "const analysisReport" not in content:
    content = content.replace("return (", f"{report_string}\n  return (")

old_header = """              <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
                <Zap className="w-5 h-5 text-indigo-400 mr-2" />
                AI Analysis Summary
              </h3>"""

new_header = """              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-100 flex items-center">
                  <Zap className="w-5 h-5 text-indigo-400 mr-2" />
                  AI Analysis Summary
                </h3>
                <ExportMenu title="Contract Review Analysis" content={analysisReport} buttonVariant="icon" />
              </div>"""

content = content.replace(old_header, new_header)

with open("src/pages/ContractReview.tsx", "w") as f:
    f.write(content)

