<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/auth-lib/bootstrap.php';

use AiPass\Auth\AuthService;
use AiPass\Auth\Config;
use AiPass\Auth\Csrf;
use AiPass\Auth\GoogleOAuth;
use AiPass\Auth\SessionAuth;

$config = Config::fromEnvironment();
$state = $_GET['state'] ?? null;
$code = $_GET['code'] ?? null;
$error = $_GET['error'] ?? null;

if ($error !== null) {
    SessionAuth::redirect('/auth/login.php?error=' . rawurlencode((string) $error));
}

if (!Csrf::validateOAuthState(is_string($state) ? $state : null)) {
    SessionAuth::redirect('/auth/login.php?error=' . rawurlencode('Invalid OAuth state. Please try again.'));
}

if (!is_string($code) || $code === '') {
    SessionAuth::redirect('/auth/login.php?error=' . rawurlencode('Missing authorization code from Google.'));
}

$callback = isset($_SESSION['oauth_callback']) ? (string) $_SESSION['oauth_callback'] : '/workspace';
unset($_SESSION['oauth_callback']);

try {
    $google = new GoogleOAuth($config);
    $profile = $google->fetchUserFromCode($code);
    $auth = AuthService::make($config);
    $user = $auth->loginWithGoogleProfile($profile);
    SessionAuth::login($user);
    SessionAuth::redirect($auth->successRedirect($callback));
} catch (Throwable $e) {
    SessionAuth::redirect('/auth/login.php?error=' . rawurlencode($e->getMessage()));
}
