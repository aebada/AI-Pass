<?php

declare(strict_types=1);

namespace AiPass\Auth;

final class Csrf
{
    private const SESSION_KEY = 'csrf_token';
    private const OAUTH_COOKIE = 'AIPASS_OAUTH_STATE';
    private const OAUTH_COOKIE_TTL = 600;

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

    /**
     * OAuth state — store in session and a short-lived cookie so Google's
     * top-level return still validates when the PHP session cookie is dropped
     * (e.g. session IDs that contained commas under sid_bits_per_character=6).
     */
    public static function issueOAuthState(): string
    {
        $state = bin2hex(random_bytes(32));
        $_SESSION['oauth_state'] = $state;
        self::writeOAuthCookie($state);

        return $state;
    }

    public static function validateOAuthState(?string $state): bool
    {
        if ($state === null || $state === '') {
            return false;
        }

        $fromSession = $_SESSION['oauth_state'] ?? null;
        unset($_SESSION['oauth_state']);

        $fromCookie = $_COOKIE[self::OAUTH_COOKIE] ?? null;
        self::clearOAuthCookie();

        $okSession = is_string($fromSession) && $fromSession !== '' && hash_equals($fromSession, $state);
        $okCookie = is_string($fromCookie) && $fromCookie !== '' && hash_equals($fromCookie, $state);

        return $okSession || $okCookie;
    }

    private static function writeOAuthCookie(string $state): void
    {
        $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')
            || (isset($_SERVER['SERVER_PORT']) && (string) $_SERVER['SERVER_PORT'] === '443');

        setcookie(self::OAUTH_COOKIE, $state, [
            'expires' => time() + self::OAUTH_COOKIE_TTL,
            'path' => '/',
            'domain' => '',
            'secure' => $secure,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        $_COOKIE[self::OAUTH_COOKIE] = $state;
    }

    private static function clearOAuthCookie(): void
    {
        $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')
            || (isset($_SERVER['SERVER_PORT']) && (string) $_SERVER['SERVER_PORT'] === '443');

        setcookie(self::OAUTH_COOKIE, '', [
            'expires' => time() - 42000,
            'path' => '/',
            'domain' => '',
            'secure' => $secure,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        unset($_COOKIE[self::OAUTH_COOKIE]);
    }
}
