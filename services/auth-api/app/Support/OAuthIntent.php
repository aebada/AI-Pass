<?php

namespace App\Support;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Cookie;

/**
 * Short-lived cookies that back up OAuth intent when the PHP session is lost
 * between /auth/google and Google's callback (CDN, cookie jar edge cases).
 */
final class OAuthIntent
{
    private const TTL_MINUTES = 15;

    public static function remember(Request $request): void
    {
        if ($request->query('desktop') === '1') {
            cookie()->queue(self::make('aipass_oauth_desktop', '1'));
        }

        if ($request->query('popup') === '1') {
            cookie()->queue(self::make('aipass_oauth_popup', '1'));
        }

        if ($request->query('bridge') === '1') {
            cookie()->queue(self::make('aipass_oauth_bridge', '1'));
        }

        $callback = AuthRedirect::callbackFromRequest($request);
        if ($callback !== '/workspace') {
            cookie()->queue(self::make('aipass_oauth_callback', $callback));
        }
    }

    public static function isDesktop(Request $request): bool
    {
        return (bool) $request->session()->pull('auth_desktop', false)
            || $request->cookie('aipass_oauth_desktop') === '1';
    }

    public static function isPopup(Request $request): bool
    {
        return (bool) $request->session()->pull('auth_popup', false)
            || $request->cookie('aipass_oauth_popup') === '1';
    }

    public static function isBridge(Request $request): bool
    {
        return (bool) $request->session()->pull('auth_bridge', false)
            || $request->cookie('aipass_oauth_bridge') === '1';
    }

    public static function callback(Request $request): ?string
    {
        $fromSession = $request->session()->pull('auth_callback');
        if (is_string($fromSession) && $fromSession !== '') {
            return $fromSession;
        }

        $fromCookie = $request->cookie('aipass_oauth_callback');

        return is_string($fromCookie) && $fromCookie !== '' ? $fromCookie : null;
    }

    public static function forget(Request $request): void
    {
        foreach (['aipass_oauth_desktop', 'aipass_oauth_popup', 'aipass_oauth_bridge', 'aipass_oauth_callback'] as $name) {
            cookie()->queue(cookie()->forget($name));
        }
    }

    private static function make(string $name, string $value): Cookie
    {
        return cookie(
            $name,
            $value,
            self::TTL_MINUTES,
            '/',
            null,
            true,
            true,
            false,
            'lax',
        );
    }
}
