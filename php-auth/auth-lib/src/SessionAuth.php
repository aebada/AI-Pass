<?php

declare(strict_types=1);

namespace AiPass\Auth;

final class SessionAuth
{
    public const SESSION_USER_KEY = 'auth_user';

    public static function start(Config $config): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }

        $secure = $config->isProduction()
            || (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')
            || (isset($_SERVER['SERVER_PORT']) && (string) $_SERVER['SERVER_PORT'] === '443');

        session_name('AIPASS_SESSION');
        session_set_cookie_params([
            'lifetime' => 60 * 60 * 24 * 7,
            'path' => '/',
            'domain' => '',
            'secure' => $secure,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);

        // sid_bits_per_character=6 can emit commas in session IDs; some browsers
        // drop or mishandle those cookies and OAuth state validation then fails.
        // Use hex-only IDs (4 bits/char) so Set-Cookie values stay cookie-safe.
        if ($config->sessionSecret !== '') {
            ini_set('session.sid_length', '48');
            ini_set('session.sid_bits_per_character', '4');
        }

        session_start();
    }

    public static function login(array $user): void
    {
        session_regenerate_id(true);
        $_SESSION[self::SESSION_USER_KEY] = [
            'id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['name'] ?? null,
            'avatar_url' => $user['avatar_url'] ?? null,
            'auth_provider' => $user['auth_provider'] ?? 'email',
        ];
    }

    public static function user(): ?array
    {
        $user = $_SESSION[self::SESSION_USER_KEY] ?? null;

        return is_array($user) ? $user : null;
    }

    public static function check(): bool
    {
        return self::user() !== null;
    }

    public static function logout(): void
    {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', [
                'expires' => time() - 42000,
                'path' => $params['path'],
                'domain' => $params['domain'],
                'secure' => (bool) $params['secure'],
                'httponly' => (bool) $params['httponly'],
                'samesite' => $params['samesite'] ?? 'Lax',
            ]);
        }
        session_destroy();
    }

    public static function redirect(string $url): never
    {
        // Flush session before leaving so oauth_state is on disk before Google returns.
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_write_close();
        }
        header('Location: ' . $url, true, 302);
        exit;
    }

    public static function json(array $payload, int $status = 200): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        echo json_encode($payload, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);
        exit;
    }
}
