import re

with open("src/lib/exportUtils.ts", "r") as f:
    content = f.read()

# Make the L mathematically identical to the screenshot
old_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
                  <rect width="100" height="100" fill="black" rx="12" />
                  <path d="M 28.69 23.36 L 55 23.36 L 45 34.36 L 45 62 L 60 62 L 72 50 L 72 73.36 L 28.69 73.36 L 40 62 L 40 34.36 Z" fill="white" />
                </svg>"""

new_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
                  <rect width="100" height="100" fill="black" rx="12" />
                  <path d="M 28.69 23.36 L 56 23.36 L 46 33 L 46 63.36 L 62 63.36 L 70.39 55 L 70.39 73.36 L 28.69 73.36 L 38 63.36 L 38 33 Z" fill="white" />
                </svg>"""

content = content.replace(old_svg, new_svg)

with open("src/lib/exportUtils.ts", "w") as f:
    f.write(content)
print("Updated exportUtils.ts successfully!")
