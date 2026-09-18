import re

with open("src/pages/Dashboard.tsx", "r") as f:
    content = f.read()

content = content.replace('bg-gray-300', 'bg-gray-300 dark:bg-neutral-600')
content = content.replace('hover:bg-gray-200/60', 'hover:bg-gray-200/60 dark:hover:bg-neutral-700/60')
content = content.replace('bg-black text-white', 'bg-black dark:bg-white text-white dark:text-black')
content = content.replace('hover:bg-gray-800', 'hover:bg-gray-800 dark:hover:bg-gray-200')
content = content.replace('bg-black hover:bg-gray-800 text-white', 'bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black')
content = content.replace('bg-gray-900 text-white', 'bg-gray-900 dark:bg-neutral-100 text-white dark:text-neutral-900')
content = content.replace('bg-gray-900 text-gray-100', 'bg-gray-900 dark:bg-neutral-100 text-gray-100 dark:text-neutral-900')

with open("src/pages/Dashboard.tsx", "w") as f:
    f.write(content)
