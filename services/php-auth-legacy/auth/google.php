<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/auth-lib/bootstrap.php';

use AiPass\Auth\Config;
use AiPass\Auth\Csrf;
use AiPass\Auth\GoogleOAuth;
use AiPass\Auth\SessionAuth;

$config = Config::fromEnvironment();
$callback = isset($_GET['callback']) ? (string) $_GET['callback'] : '/workspace';

if ($callback !== '') {
    $_SESSION['oauth_callback'] = $callback;
}

try {
    $google = new GoogleOAuth($config);
    $state = Csrf::issueOAuthState();
    $url = $google->authorizationUrl($state);
    SessionAuth::redirect($url);
} catch (Throwable $e) {
    $message = rawurlencode($e->getMessage());
    SessionAuth::redirect('/auth/login.php?error=' . $message);
}
