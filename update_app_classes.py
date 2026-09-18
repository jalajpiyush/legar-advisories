import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Update global wrapper
old_wrapper = 'className="flex h-screen bg-[#F9F9FA] text-gray-900 overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900"'
new_wrapper = 'className="flex h-screen bg-[#F9F9FA] dark:bg-neutral-950 text-gray-900 dark:text-neutral-100 overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900"'
content = content.replace(old_wrapper, new_wrapper)

# Update main area
old_main = 'className="flex-1 flex flex-col min-w-0 bg-white relative overflow-hidden shadow-[-4px_0_24px_rgb(0,0,0,0.02)]"'
new_main = 'className="flex-1 flex flex-col min-w-0 bg-white dark:bg-neutral-950 relative overflow-hidden shadow-[-4px_0_24px_rgb(0,0,0,0.02)] dark:shadow-none border-l dark:border-neutral-800 border-transparent"'
content = content.replace(old_main, new_main)

# Update menu button
old_menu = 'className="md:hidden absolute top-4 left-4 z-[60] p-2 text-gray-600 hover:text-gray-900 bg-white/90 backdrop-blur rounded-xl shadow-sm border border-gray-100"'
new_menu = 'className="md:hidden absolute top-4 left-4 z-[60] p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-white/90 dark:bg-neutral-900/90 backdrop-blur rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800"'
content = content.replace(old_menu, new_menu)

with open("src/App.tsx", "w") as f:
    f.write(content)

