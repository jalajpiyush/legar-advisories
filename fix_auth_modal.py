import re

with open("src/components/AuthModal.tsx", "r") as f:
    content = f.read()

# Replace blue accents and general styling logic to match Generator.tsx / global style
old_verification_icon = '''<div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">'''
new_verification_icon = '''<div className="w-16 h-16 bg-[#c6a87c]/10 text-[#c6a87c] rounded-full flex items-center justify-center mx-auto mb-6">'''
content = content.replace(old_verification_icon, new_verification_icon)

old_inputs = '''focus:border-blue-500 focus:ring-2 focus:ring-blue-100'''
new_inputs = '''focus:border-[#c6a87c] focus:ring-2 focus:ring-[#c6a87c]/20'''
content = content.replace(old_inputs, new_inputs)

old_forgot = '''className="text-[12px] font-medium text-blue-600 hover:text-blue-700"'''
new_forgot = '''className="text-[12px] font-medium text-[#c6a87c] hover:text-[#b5986c] transition-colors"'''
content = content.replace(old_forgot, new_forgot)

# Buttons fixes
old_btn = '''className="w-full py-2.5 bg-gray-900 dark:bg-gray-100 text-white rounded-xl font-medium hover:bg-gray-800 dark:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"'''
# Dark mode bg-gray-100 text-white is broken -> it should be text-black for dark mode if bg is gray-100. Let's fix that.
new_btn = '''className="w-full py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[14px] font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"'''
content = content.replace(old_btn, new_btn)

# Back to login btn
old_back = '''className="mt-6 w-full py-2.5 bg-gray-900 dark:bg-gray-100 text-white rounded-xl font-medium hover:bg-gray-800 dark:bg-gray-200 transition-colors"'''
new_back = '''className="mt-6 w-full py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[14px] font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm"'''
content = content.replace(old_back, new_back)

# Google Btn
old_google = '''className="w-full py-2.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-300 rounded-xl font-medium hover:bg-gray-50 dark:bg-neutral-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"'''
new_google = '''className="w-full py-2.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-300 rounded-xl text-[14px] font-semibold hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"'''
content = content.replace(old_google, new_google)

# Serif text
content = content.replace("text-2xl font-semibold", "text-2xl font-serif font-medium")
content = content.replace("dark:bg-neutral-900 hover:bg-gray-100 dark:bg-neutral-800", "dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700")

with open("src/components/AuthModal.tsx", "w") as f:
    f.write(content)
print("Updated AuthModal.tsx")
