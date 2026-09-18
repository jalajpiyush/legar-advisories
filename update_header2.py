import re

with open("src/lib/exportUtils.ts", "r") as f:
    content = f.read()

old_header_match = re.search(r'<!-- Failsafe Table Layout for Header -->.*?</style>', content, re.DOTALL) # wait, the </style> is before the table

old_header_match = re.search(r'<!-- Failsafe Table Layout for Header -->.*?<hr style="border: none; border-top: 1px solid #000; margin-bottom: 24pt;" />', content, re.DOTALL)

if old_header_match:
    old_header = old_header_match.group(0)
    
    new_header = """<!-- Failsafe Table Layout for Header -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24pt; border: none;">
        <tr>
          <td style="text-align: left; vertical-align: middle; padding: 0; border: none; width: 60px;">
            <div style="width: 45px; height: 45px;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
                <rect width="100" height="100" fill="black" rx="16" />
                <path d="M 28.69 23.36 L 56 23.36 L 46 33 L 46 63.36 L 62 63.36 L 70.39 55 L 70.39 73.36 L 28.69 73.36 L 38 63.36 L 38 33 Z" fill="white" />
              </svg>
            </div>
          </td>
          <td style="text-align: left; vertical-align: middle; padding: 0; border: none; padding-left: 10pt;">
            <h2 style="margin: 0; font-size: 14pt; font-weight: bold; text-transform: uppercase; color: #000; border: none; padding: 0; text-decoration: none;">${title}</h2>
          </td>
          <td style="text-align: right; vertical-align: middle; padding: 0; border: none; width: 120px;">
            <p style="color: #000; font-size: 11pt; margin: 0; font-family: 'Times New Roman', Times, serif; font-weight: bold;">Date: ${new Date().toLocaleDateString()}</p>
          </td>
        </tr>
      </table>"""
    
    content = content.replace(old_header, new_header)
    with open("src/lib/exportUtils.ts", "w") as f:
        f.write(content)
    print("Updated header successfully!")
else:
    print("Failed to find header to update")
