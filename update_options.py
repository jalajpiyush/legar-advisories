import re

with open("src/pages/Options.tsx", "r") as f:
    content = f.read()

# Update theme state initialization
new_theme_state = '''  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("legal_advisories_theme") || "System Default";
  });
  
  React.useEffect(() => {
    localStorage.setItem("legal_advisories_theme", theme);
    if (theme === "Dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "Light") {
      document.documentElement.classList.remove("dark");
    } else {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme]);'''

content = re.sub(r'  const \[theme, setTheme\] = useState\("System Default"\);', new_theme_state, content)

with open("src/pages/Options.tsx", "w") as f:
    f.write(content)
