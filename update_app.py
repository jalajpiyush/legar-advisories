import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Add theme initialization effect
init_effect = '''  React.useEffect(() => {
    const handleNavigate = (e: any) => {
      const page = e.detail;
      if (['terms', 'privacy', 'disclaimer'].includes(page)) {
        setCurrentPage(page);
      }
    };
    window.addEventListener('navigate', handleNavigate);
    
    // Initialize theme
    const theme = localStorage.getItem("legal_advisories_theme") || "System Default";
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
    
    // Listen for OS theme changes if System Default
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem("legal_advisories_theme") === "System Default" || !localStorage.getItem("legal_advisories_theme")) {
        if (e.matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      window.removeEventListener('navigate', handleNavigate);
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);'''

# Replace the existing navigate effect with our new combined effect
content = re.sub(
    r"  React\.useEffect\(\(\) => \{\n    const handleNavigate = \(e: any\) => \{.*?\n    return \(\) => window\.removeEventListener\('navigate', handleNavigate\);\n  \}, \[\]\);", 
    init_effect, 
    content, 
    flags=re.DOTALL
)

with open("src/App.tsx", "w") as f:
    f.write(content)
