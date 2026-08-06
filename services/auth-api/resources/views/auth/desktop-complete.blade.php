<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Return to AI-Pass IDE</title>
  <style>
    :root {
      --bg: #0d1117;
      --fg: #e6edf3;
      --muted: #8b949e;
      --accent: #3b82f6;
      --card: #161b22;
      --border: #30363d;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
      background:
        radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.25), transparent),
        var(--bg);
      color: var(--fg);
      padding: 1.5rem;
    }
    .panel {
      width: min(420px, 100%);
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 2rem 1.75rem;
      text-align: center;
    }
    h1 {
      margin: 0 0 0.5rem;
      font-size: 1.35rem;
      font-weight: 650;
    }
    p {
      margin: 0 0 1.25rem;
      color: var(--muted);
      font-size: 0.95rem;
      line-height: 1.5;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.85rem 1rem;
      border: 0;
      border-radius: 8px;
      background: var(--accent);
      color: #fff;
      font-size: 0.95rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
    }
    .btn:hover { filter: brightness(1.08); }
    .secondary {
      margin-top: 0.75rem;
      display: block;
      color: var(--muted);
      font-size: 0.85rem;
    }
    .status {
      margin-top: 1rem;
      font-size: 0.8rem;
      color: var(--muted);
    }
  </style>
</head>
<body>
  <div class="panel">
    <h1>Signed in with Google</h1>
    <p>Opening AI-Pass IDE to finish sign-in. If nothing happens, click the button below.</p>
    <a class="btn" id="openIde" href="{{ $deepLink }}">Open AI-Pass IDE</a>
    <a class="secondary" href="{{ $workspaceUrl }}">Continue in this browser instead</a>
    <p class="status" id="status">Waiting for the desktop app…</p>
  </div>
  <script>
    (function () {
      var deepLink = @json($deepLink);
      var statusEl = document.getElementById('status');
      try {
        window.location.href = deepLink;
        if (statusEl) statusEl.textContent = 'Launching AI-Pass IDE…';
      } catch (e) {
        if (statusEl) statusEl.textContent = 'Click “Open AI-Pass IDE” to continue.';
      }
      setTimeout(function () {
        if (statusEl) statusEl.textContent = 'Still here? Use the button above to open the IDE.';
      }, 2500);
    })();
  </script>
</body>
</html>
