<?php

namespace App\Support;

use Illuminate\Http\Request;

final class AuthRedirect
{
    public static function callbackFromRequest(Request $request): string
    {
        $callback = $request->query('callback')
            ?? $request->query('returnUrl')
            ?? $request->query('callbackUrl')
            ?? $request->input('callback')
            ?? $request->input('returnUrl')
            ?? $request->input('callbackUrl');

        return is_string($callback) && $callback !== '' ? $callback : '/workspace';
    }

    public static function resolve(?string $callback): string
    {
        $frontend = rtrim((string) config('aipass.frontend_url', config('app.url')), '/');
        $defaultPath = (string) config('aipass.login_success_path', '/workspace');
        $default = $frontend.$defaultPath;

        if ($callback === null || $callback === '') {
            return $default;
        }

        if (str_starts_with($callback, '/') && ! str_starts_with($callback, '//')) {
            return $frontend.$callback;
        }

        $parsed = parse_url($callback);
        $frontendHost = parse_url($frontend, PHP_URL_HOST);

        if (is_array($parsed) && isset($parsed['host'])) {
            if (self::isTrustedExternal($callback)) {
                $scheme = $parsed['scheme'] ?? 'https';
                $path = $parsed['path'] ?? '/';
                $query = isset($parsed['query']) ? '?'.$parsed['query'] : '';

                return $scheme.'://'.$parsed['host'].$path.$query;
            }

            if ($parsed['host'] === $frontendHost) {
                $path = $parsed['path'] ?? '/';
                $query = isset($parsed['query']) ? '?'.$parsed['query'] : '';

                return $frontend.$path.$query;
            }
        }

        return $default;
    }

    public static function isTrustedExternal(string $callback): bool
    {
        $parsed = parse_url($callback);

        if (! is_array($parsed) || empty($parsed['host'])) {
            return false;
        }

        /** @var list<string> $trusted */
        $trusted = config('aipass.trusted_callback_hosts', []);

        return in_array($parsed['host'], $trusted, true);
    }
}
