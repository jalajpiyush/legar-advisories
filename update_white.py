import os
import re

def update_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    orig = content
    
    # regex to replace bg-white with bg-white dark:bg-neutral-900 if dark:bg is not present right after
    content = re.sub(r'bg-white(?!\s+dark:bg-[^\s"\'`]+)', 'bg-white dark:bg-neutral-900', content)
    
    if orig != content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            update_file(os.path.join(root, file))

