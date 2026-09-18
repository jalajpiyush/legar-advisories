with open("src/components/Sidebar.tsx", "r") as f:
    content = f.read()

old_span = 'className="text-[16px] font-bold text-[#0F172A] tracking-tight whitespace-nowrap truncate max-w-[140px]"'
new_span = 'className="text-[16px] font-bold text-[#0F172A] dark:text-neutral-100 tracking-tight whitespace-nowrap truncate max-w-[140px]"'

if old_span in content:
    content = content.replace(old_span, new_span)
    with open("src/components/Sidebar.tsx", "w") as f:
        f.write(content)
    print("Fixed text color in Sidebar.tsx")
else:
    print("Could not find exact match. Manual replace needed.")

