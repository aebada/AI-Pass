<?php

namespace App\Support;

final class AuthRedirect
{
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

        if (is_array($parsed) && isset($parsed['host']) && $parsed['host'] === $frontendHost) {
            $path = $parsed['path'] ?? '/';
            $query = isset($parsed['query']) ? '?'.$parsed['query'] : '';

            return $frontend.$path.$query;
        }

        return $default;
    }

    /** Frontend (Next) login URL used for OAuth error redirects. */
    public static function loginError(string $error, ?string $callback = null): string
    {
        $frontend = rtrim((string) config('aipass.frontend_url', config('app.url')), '/');
        $query = ['error' => $error];
        if ($callback) {
            $query['callbackUrl'] = $callback;
        }

        return $frontend.'/login?'.http_build_query($query);
    }
}
