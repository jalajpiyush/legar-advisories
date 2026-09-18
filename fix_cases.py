import re

with open("src/pages/Cases.tsx", "r") as f:
    content = f.read()

# Make card clickable
content = content.replace(
    '<div key={c.id} className="group relative rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 p-5 transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">',
    '<div key={c.id} onClick={() => setSelectedCase(c)} className="group relative rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 p-5 transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 cursor-pointer">'
)

# Stop propagation on inner buttons
content = content.replace('onClick={() => togglePin(c)}', 'onClick={(e) => { e.stopPropagation(); togglePin(c); }}')
content = content.replace('onClick={() => openEditModal(c)}', 'onClick={(e) => { e.stopPropagation(); openEditModal(c); }}')
content = content.replace('onClick={() => deleteCase(c.id)}', 'onClick={(e) => { e.stopPropagation(); deleteCase(c.id); }}')

with open("src/pages/Cases.tsx", "w") as f:
    f.write(content)

