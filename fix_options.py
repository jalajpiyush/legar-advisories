import re

with open("src/pages/Options.tsx", "r") as f:
    content = f.read()

old_plan = '<div className="text-3xl font-bold text-blue-600 mb-2">{dashboardData.plan}</div>'
new_plan = '<div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{dashboardData.plan}</div>'

old_btn = '<button onClick={() => setActiveTab(\'plan\')} className="text-sm text-blue-500 hover:underline">Manage Subscription</button>'
new_btn = '<button onClick={() => setActiveTab(\'plan\')} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Manage Subscription</button>'

content = content.replace(old_plan, new_plan)
content = content.replace(old_btn, new_btn)

with open("src/pages/Options.tsx", "w") as f:
    f.write(content)

print("Fixed colors in Options.tsx")
