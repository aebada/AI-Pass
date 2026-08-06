(function () {
  try {
    var stored = localStorage.getItem('ai-pass:theme') || 'light';
    var resolved =
      stored === 'system'
        ? window.matchMedia('(prefers-color-scheme: light)').matches
          ? 'light'
          : 'dark'
        : stored === 'dark'
          ? 'dark'
          : 'light';
    var root = document.documentElement;
    root.dataset.theme = resolved;
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);
    root.style.colorScheme = resolved;
  } catch (e) {
    document.documentElement.dataset.theme = 'light';
    document.documentElement.classList.add('light');
  }
})();
