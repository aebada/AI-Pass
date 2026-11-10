<?php

declare(strict_types=1);

/** @var array<string, mixed> $page */
function auth_render_page(array $page): void
{
    $title = htmlspecialchars((string) ($page['title'] ?? 'AI-Pass'), ENT_QUOTES, 'UTF-8');
    $badge = htmlspecialchars((string) ($page['badge'] ?? 'Secure sign-in'), ENT_QUOTES, 'UTF-8');
    $heading = htmlspecialchars((string) ($page['heading'] ?? 'Welcome to AI-Pass'), ENT_QUOTES, 'UTF-8');
    $subtitle = htmlspecialchars((string) ($page['subtitle'] ?? ''), ENT_QUOTES, 'UTF-8');
    $error = $page['error'] ?? null;
    $success = $page['success'] ?? null;
    $body = $page['body'] ?? '';
    $footer = $page['footer'] ?? '';
    ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title><?= $title ?></title>
  <link rel="icon" href="/icon.svg" type="image/svg+xml" />
  <link rel="stylesheet" href="/auth/styles.css" />
</head>
<body>
  <div class="page">
    <header class="nav">
      <a class="brand" href="/">AI-Pass</a>
      <a class="nav-link" href="/">Home</a>
    </header>
    <main class="main">
      <div class="card">
        <div class="badge"><?= $badge ?></div>
        <h1 class="title"><?= $heading ?></h1>
        <?php if ($subtitle !== ''): ?>
          <p class="subtitle"><?= $subtitle ?></p>
        <?php endif; ?>

        <?php if ($error): ?>
          <div class="alert error" role="alert"><?= htmlspecialchars((string) $error, ENT_QUOTES, 'UTF-8') ?></div>
        <?php endif; ?>
        <?php if ($success): ?>
          <div class="alert success" role="status"><?= htmlspecialchars((string) $success, ENT_QUOTES, 'UTF-8') ?></div>
        <?php endif; ?>

        <?= $body ?>

        <p class="legal">By continuing, you agree to AI-Pass terms and privacy policy.</p>
        <?= $footer ?>
      </div>
    </main>
  </div>
</body>
</html>
    <?php
}

function auth_google_button(string $callbackUrl = ''): string
{
    $href = '/auth/google.php';
    if ($callbackUrl !== '') {
        $href .= '?callback=' . rawurlencode($callbackUrl);
    }

    return '<a class="google-btn" href="' . htmlspecialchars($href, ENT_QUOTES, 'UTF-8') . '">'
        . '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">'
        . '<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>'
        . '<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>'
        . '<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>'
        . '<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>'
        . '</svg>'
        . 'Continue with Google'
        . '</a>';
}
