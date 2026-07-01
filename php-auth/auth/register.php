<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/auth-lib/bootstrap.php';
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
$success = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['csrf_token'] ?? null;
    if (!Csrf::validate($token)) {
        $error = 'Invalid form submission. Please try again.';
    } else {
        try {
            $auth = AuthService::make($config);
            $user = $auth->registerWithEmail(
                (string) ($_POST['email'] ?? ''),
                (string) ($_POST['password'] ?? ''),
                trim((string) ($_POST['name'] ?? '')) ?: null,
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

<div class="divider">or register with email</div>

<form class="form" method="post" action="/auth/register.php<?= $callback !== '/workspace' ? '?callback=' . rawurlencode($callback) : '' ?>">
  <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf, ENT_QUOTES, 'UTF-8') ?>" />
  <label class="label">
    Name
    <input class="input" type="text" name="name" autocomplete="name" value="<?= htmlspecialchars((string) ($_POST['name'] ?? ''), ENT_QUOTES, 'UTF-8') ?>" />
  </label>
  <label class="label">
    Email
    <input class="input" type="email" name="email" required autocomplete="email" value="<?= htmlspecialchars((string) ($_POST['email'] ?? ''), ENT_QUOTES, 'UTF-8') ?>" />
  </label>
  <label class="label">
    Password
    <input class="input" type="password" name="password" required autocomplete="new-password" minlength="8" />
  </label>
  <button class="submit-btn" type="submit">Create account</button>
</form>

<p class="hint">Already have an account? <a href="/auth/login.php">Sign in</a></p>
<?php
$body = ob_get_clean() ?: '';

auth_render_page([
    'title' => 'Register — AI-Pass',
    'badge' => 'Create account',
    'heading' => 'Join AI-Pass',
    'subtitle' => 'Get 500 free credits and access the AI Playground.',
    'error' => $error,
    'success' => $success,
    'body' => $body,
]);
