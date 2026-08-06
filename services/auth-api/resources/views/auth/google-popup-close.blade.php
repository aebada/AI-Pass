@php
  $frontendUrl = rtrim((string) config('aipass.frontend_url', config('app.url')), '/');
  $parsed = parse_url($frontendUrl);
  $targetOrigin = ($parsed['scheme'] ?? 'https').'://'.($parsed['host'] ?? 'localhost');
  if (isset($parsed['port'])) {
      $targetOrigin .= ':'.$parsed['port'];
  }
  $payload = $success
      ? ['type' => 'AIPASS_AUTH_SUCCESS']
      : ['type' => 'AIPASS_AUTH_ERROR'];
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{{ $success ? 'Signed in' : 'Sign-in failed' }} — AI-Pass</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #0f1117;
      color: #e8eaed;
    }
    p { margin: 0; font-size: 0.95rem; opacity: 0.85; }
  </style>
</head>
<body>
  <p>{{ $success ? 'Signed in — closing…' : 'Sign-in failed — closing…' }}</p>
  <script>
    (function () {
      var payload = @json($payload);
      var targetOrigin = @json($targetOrigin);
      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(payload, targetOrigin);
        }
      } catch (e) {}
      window.close();
      setTimeout(function () {
        document.body.innerHTML = '<p>You can close this window.</p>';
      }, 800);
    })();
  </script>
</body>
</html>
