export function getTheme(): string {
  return localStorage.getItem('theme') || 'Light';
}

export function setTheme(theme: string) {
  localStorage.setItem('theme', theme);
  applyTheme(theme);
}

export function applyTheme(theme: string) {
  if (theme === 'Dark') {
    document.documentElement.classList.add('dark');
  } else if (theme === 'Light') {
    document.documentElement.classList.remove('dark');
  } else {
    // System Default
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}

export function initTheme() {
  applyTheme(getTheme());
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getTheme() === 'System Default') {
      applyTheme('System Default');
    }
  });
}
