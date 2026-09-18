import re

with open("src/lib/exportUtils.ts", "r") as f:
    content = f.read()

# Add a CSS rule to hide the first h1 if it's the title, or we can just hide all h1s since the title is in the header.
# Actually, the markdown-content h1 is the title. Let's just hide the first h1.
new_css = ".markdown-content h1:first-of-type { display: none; }"

if new_css not in content:
    content = content.replace('.markdown-content { font-size: 12pt; text-align: justify; text-justify: inter-word; color: #000; }', 
                              '.markdown-content { font-size: 12pt; text-align: justify; text-justify: inter-word; color: #000; }\n      ' + new_css)
    with open("src/lib/exportUtils.ts", "w") as f:
        f.write(content)
    print("CSS updated!")
