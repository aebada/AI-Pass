<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Opening AI-Pass IDE…</title>
  <link rel="icon" href="/icon.svg" type="image/svg+xml" />
  <link rel="stylesheet" href="/css/auth.css" />
  <meta http-equiv="refresh" content="0;url={{ $deepLink }}" />
</head>
<body>
  <div class="page">
    <main class="main">
      <div class="card">
        <div class="badge">Desktop sign-in</div>
        <h1 class="title">Return to AI-Pass IDE</h1>
        <p class="subtitle">
          Google sign-in succeeded. Opening the AI-Pass IDE to finish signing you in.
        </p>
        <p class="subtitle">
          If the app does not open automatically,
          <a href="{{ $deepLink }}">click here to continue</a>.
        </p>
      </div>
    </main>
  </div>
  <script>
    try { window.location.href = @json($deepLink); } catch (e) {}
  </script>
</body>
</html>
