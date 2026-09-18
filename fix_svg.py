import re

with open("src/lib/exportUtils.ts", "r") as f:
    content = f.read()

# Replace the incorrect SVG path with one matching the provided icon
old_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
                  <rect width="100" height="100" fill="black" rx="16" />
                  <path d="M 36.31 23.36 L 68.65 23.36 L 68.65 31.5 L 63.2 31.5 C 59.65 31.5 58.46 32.56 58.46 36.12 L 58.46 70.8 C 58.46 73.99 59.29 74.58 65.8 74.58 L 72.65 74.58 L 72.65 82.61 L 28.69 82.61 L 28.69 74.58 L 33.06 74.58 C 38.39 74.58 39.81 73.52 39.81 69.97 L 39.81 35.53 C 39.81 32.34 38.86 31.5 34.72 31.5 L 30 31.5 L 30 23.36 L 36.31 23.36 Z" fill="white" />
                </svg>"""

new_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
                  <rect width="100" height="100" fill="black" rx="16" />
                  <path d="M 28.69 23.36 L 53.69 23.36 L 53.69 28.36 L 46.69 34.36 L 46.69 66.36 L 60.69 66.36 L 70.69 57.36 L 70.69 73.36 L 28.69 73.36 L 37.69 64.36 L 37.69 32.36 L 28.69 23.36 Z" fill="white" />
                </svg>"""

content = content.replace(old_svg, new_svg)

with open("src/lib/exportUtils.ts", "w") as f:
    f.write(content)
print("Updated exportUtils.ts successfully!")
