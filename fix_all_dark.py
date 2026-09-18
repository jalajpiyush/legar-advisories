import os
import re

# Map of light mode classes to their dark mode equivalents
# Notice I'm avoiding partial matches by using word boundaries in the regex later.
replacements = {
    'bg-white': 'dark:bg-neutral-900',
    'bg-gray-50': 'dark:bg-neutral-900',
    'bg-gray-100': 'dark:bg-neutral-800',
    'bg-gray-200': 'dark:bg-neutral-700',
    'bg-gray-800': 'dark:bg-gray-200',
    'bg-gray-900': 'dark:bg-gray-100',
    
    'text-gray-900': 'dark:text-neutral-100',
    'text-gray-800': 'dark:text-neutral-200',
    'text-gray-700': 'dark:text-neutral-300',
    'text-gray-600': 'dark:text-neutral-400',
    'text-gray-500': 'dark:text-neutral-400',
    'text-gray-400': 'dark:text-neutral-500',
    
    'border-gray-100': 'dark:border-neutral-800',
    'border-gray-200': 'dark:border-neutral-800',
    'border-gray-300': 'dark:border-neutral-700',
    'border-gray-800': 'dark:border-neutral-200',
    
    'ring-gray-200': 'dark:ring-neutral-800',
}

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    orig = content
    
    # We want to replace exactly the light mode class, appending the dark mode one
    # ONLY if it's not immediately followed by dark:something.
    # Actually, the safest way is to find className="...", process the string inside.
    
    def replace_classes(match):
        class_str = match.group(1)
        # Split by spaces
        classes = class_str.split()
        
        # Check what dark variants already exist
        existing_darks = [c for c in classes if c.startswith('dark:')]
        
        new_classes = []
        for c in classes:
            new_classes.append(c)
            # If this is a class we want to augment
            if c in replacements:
                dark_class = replacements[c]
                # Check if there is already a dark variant of this property
                # e.g., if c is text-gray-900, dark_class is dark:text-neutral-100
                prop_prefix = dark_class.split('-')[0] + '-' + dark_class.split('-')[1] # dark:text or dark:bg
                
                # Check if this property already has a dark variant
                has_dark_prop = any(dc.startswith(prop_prefix) for dc in existing_darks)
                
                # We also shouldn't add it if it's already in the string
                if not has_dark_prop and dark_class not in new_classes and dark_class not in existing_darks:
                    new_classes.append(dark_class)
                    
        return 'className="' + ' '.join(new_classes) + '"'

    # Match className="..." and also template literals className={`...`}
    # Wait, regexing JSX classNames is tricky because of JS expressions.
    # Let's just do a simpler token replacement.
    
    for light, dark in replacements.items():
        # Match light class not followed by dark variant of the same property
        # For example, text-gray-900 not followed by \s+dark:text-
        prop = light.split('-')[0] # 'bg', 'text', 'border'
        
        # Negative lookahead: don't match if it's followed by space(s) and dark:prop-
        # or if it's already followed by the exact dark class
        pattern = rf'\b{light}\b(?!\s+dark:{prop}-)'
        
        content = re.sub(pattern, f'{light} {dark}', content)

    if orig != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            update_file(os.path.join(root, file))

