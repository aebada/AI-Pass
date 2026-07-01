<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>@yield('title', 'AI-Pass')</title>
  <link rel="icon" href="/icon.svg" type="image/svg+xml" />
  <link rel="stylesheet" href="/css/auth.css" />
</head>
<body>
  <div class="page">
    <header class="nav">
      <a class="brand" href="/">AI-Pass</a>
      <a class="nav-link" href="/">Home</a>
    </header>
    <main class="main">
      <div class="card">
        <div class="badge">@yield('badge', 'Secure sign-in')</div>
        <h1 class="title">@yield('heading', 'Welcome to AI-Pass')</h1>
        @hasSection('subtitle')
          <p class="subtitle">@yield('subtitle')</p>
        @endif

        @if ($errors->any())
          <div class="alert error" role="alert">{{ $errors->first() }}</div>
        @endif

        @if (session('status'))
          <div class="alert success" role="status">{{ session('status') }}</div>
        @endif

        @yield('content')

        <p class="legal">By continuing, you agree to AI-Pass terms and privacy policy.</p>
      </div>
    </main>
  </div>
</body>
</html>
