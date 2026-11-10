<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/auth-lib/bootstrap.php';

// Transition: set LARAVEL_AUTH_URL in php-auth .env to forward users to Laravel login.
$laravelAuthUrl = getenv('LARAVEL_AUTH_URL') ?: ($_ENV['LARAVEL_AUTH_URL'] ?? '');
if (is_string($laravelAuthUrl) && $laravelAuthUrl !== '') {
    $callback = isset($_GET['callback']) ? (string) $_GET['callback'] : '/workspace';
    $target = rtrim($laravelAuthUrl, '/') . '/login';
    if ($callback !== '/workspace') {
        $target .= '?callback=' . rawurlencode($callback);
    }
    header('Location: ' . $target, true, 302);
    exit;
}

require_once __DIR__ . '/_layout.php';

use AiPass\Auth\AuthService;
use AiPass\Auth\Csrf;
use AiPass\Auth\SessionAuth;

$config = AiPass\Auth\Config::fromEnvironment();
$callback = isset($_GET['callback']) ? (string) $_GET['callback'] : '/workspace';

if (SessionAuth::check()) {
    SessionAuth::redirect(AuthService::make($config)->successRedirect($callback));
}

$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['csrf_token'] ?? null;
    if (!Csrf::validate($token)) {
        $error = 'Invalid form submission. Please try again.';
    } else {
        try {
            $auth = AuthService::make($config);
            $user = $auth->loginWithEmail(
                (string) ($_POST['email'] ?? ''),
                (string) ($_POST['password'] ?? ''),
            );
            SessionAuth::login($user);
            SessionAuth::redirect($auth->successRedirect($callback));
        } catch (Throwable $e) {
            $error = $e->getMessage();
        }
    }
}

$csrf = Csrf::token();

ob_start();
?>
<?= auth_google_button($callback) ?>

<div class="divider">or sign in with email</div>

<form class="form" method="post" action="/auth/login.php<?= $callback !== '/workspace' ? '?callback=' . rawurlencode($callback) : '' ?>">
  <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf, ENT_QUOTES, 'UTF-8') ?>" />
  <label class="label">
    Email
    <input class="input" type="email" name="email" required autocomplete="email" value="<?= htmlspecialchars((string) ($_POST['email'] ?? ''), ENT_QUOTES, 'UTF-8') ?>" />
  </label>
  <label class="label">
    Password
    <input class="input" type="password" name="password" required autocomplete="current-password" />
  </label>
  <button class="submit-btn" type="submit">Sign in</button>
</form>

<p class="hint">No account? <a href="/auth/register.php">Create one</a></p>
<?php
$body = ob_get_clean() ?: '';

auth_render_page([
    'title' => 'Sign in — AI-Pass',
    'heading' => 'Welcome to AI-Pass',
    'subtitle' => 'Sign in with Google or email to access the AI Playground.',
    'error' => $error ?? (isset($_GET['error']) ? rawurldecode((string) $_GET['error']) : null),
    'body' => $body,
]);
