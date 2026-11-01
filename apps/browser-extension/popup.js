document.getElementById('capture').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const payload = { url: tab?.url || '', title: tab?.title || '', capturedAt: new Date().toISOString() };
  await chrome.storage.local.set({ lastCapture: payload });
  const btn = document.getElementById('capture');
  btn.textContent = 'Captured';
  setTimeout(() => { btn.textContent = 'Capture this page'; }, 1200);
});
