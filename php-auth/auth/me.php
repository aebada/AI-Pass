<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/auth-lib/bootstrap.php';

use AiPass\Auth\SessionAuth;

$user = SessionAuth::user();

if ($user === null) {
    SessionAuth::json(['authenticated' => false], 401);
}

SessionAuth::json([
    'authenticated' => true,
    'user' => [
        'id' => $user['id'],
        'email' => $user['email'],
        'name' => $user['name'],
        'avatarUrl' => $user['avatar_url'] ?? null,
        'provider' => $user['auth_provider'] ?? 'email',
    ],
]);
