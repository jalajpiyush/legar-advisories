import os
import glob

# Mapping of hardcoded light colors to add dark mode
replacements = {
    'bg-[#F9F9FA]': 'bg-[#F9F9FA] dark:bg-neutral-950',
    'bg-[#f9f9fa]': 'bg-[#f9f9fa] dark:bg-neutral-950',
    'bg-[#FAFAFA]': 'bg-[#FAFAFA] dark:bg-neutral-900',
    'bg-[#fafafa]': 'bg-[#fafafa] dark:bg-neutral-900',
    'bg-[#F9FAFB]': 'bg-[#F9FAFB] dark:bg-neutral-900',
    # And fix Dashboard one specifically if it was 'bg-[#f9f9fa]' without dark
}

# Add text/border stuff if missed
more_replacements = {
    'text-gray-900': 'text-gray-900 dark:text-neutral-100',
    'text-gray-800': 'text-gray-800 dark:text-neutral-200',
    'text-gray-700': 'text-gray-700 dark:text-neutral-300',
    'text-gray-600': 'text-gray-600 dark:text-neutral-400',
    'text-gray-500': 'text-gray-500 dark:text-neutral-400',
    'bg-gray-50': 'bg-gray-50 dark:bg-neutral-900',
    'bg-gray-100': 'bg-gray-100 dark:bg-neutral-800',
    'border-gray-100': 'border-gray-100 dark:border-neutral-800',
    'border-gray-200': 'border-gray-200 dark:border-neutral-800',
}

def update_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    orig = content
    
    # First apply specific hardcoded hex replacements
    for old, new in replacements.items():
        # Prevent double application
        if new not in content:
            content = content.replace(old, new)
            
    # Then apply some common missed classes (only if dark: isn't already there)
    # This is a bit tricky, let's just do it manually for specific files instead of blanket
    
    if orig != content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            update_file(os.path.join(root, file))

