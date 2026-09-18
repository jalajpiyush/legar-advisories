import re

with open("src/pages/Dashboard.tsx", "r") as f:
    content = f.read()

# Make typical background replacements
content = content.replace('bg-white', 'bg-white dark:bg-neutral-900')
content = content.replace('text-gray-900', 'text-gray-900 dark:text-neutral-100')
content = content.replace('text-gray-800', 'text-gray-800 dark:text-neutral-200')
content = content.replace('text-gray-700', 'text-gray-700 dark:text-neutral-300')
content = content.replace('text-gray-600', 'text-gray-600 dark:text-neutral-400')
content = content.replace('text-gray-500', 'text-gray-500 dark:text-neutral-400')
content = content.replace('border-gray-100', 'border-gray-100 dark:border-neutral-800')
content = content.replace('border-gray-200', 'border-gray-200 dark:border-neutral-800')
content = content.replace('border-gray-300', 'border-gray-300 dark:border-neutral-700')
content = content.replace('bg-gray-50', 'bg-gray-50 dark:bg-neutral-800')
content = content.replace('bg-gray-100', 'bg-gray-100 dark:bg-neutral-800')

with open("src/pages/Dashboard.tsx", "w") as f:
    f.write(content)

