<?php

declare(strict_types=1);

namespace AiPass\Auth;

final class Csrf
{
    private const SESSION_KEY = 'csrf_token';

    public static function token(): string
    {
        if (empty($_SESSION[self::SESSION_KEY])) {
            $_SESSION[self::SESSION_KEY] = bin2hex(random_bytes(32));
        }

        return $_SESSION[self::SESSION_KEY];
    }

    public static function validate(?string $token): bool
    {
        if ($token === null || $token === '') {
            return false;
        }

        $expected = $_SESSION[self::SESSION_KEY] ?? '';

        return $expected !== '' && hash_equals($expected, $token);
    }

    /** OAuth state parameter — single-use. */
    public static function issueOAuthState(): string
    {
        $state = bin2hex(random_bytes(32));
        $_SESSION['oauth_state'] = $state;

        return $state;
    }

    public static function validateOAuthState(?string $state): bool
    {
        if ($state === null || $state === '') {
            return false;
        }

        $expected = $_SESSION['oauth_state'] ?? null;
        unset($_SESSION['oauth_state']);

        return $expected !== null && hash_equals($expected, $state);
    }
}
