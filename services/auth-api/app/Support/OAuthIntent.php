<?php

namespace App\Support;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Cookie;

/**
 * Short-lived encrypted cookies that survive OAuth round-trips when the Laravel
 * session cookie/state is dropped (common across browser ↔ IDE handoffs).
 *
 * Observed live cookies on /auth/google:
 *   ?desktop=1  → aipass_oauth_desktop
 *   ?popup=1    → aipass_oauth_popup
 *   ?bridge=1   → aipass_oauth_bridge
 *   ?desktop=1&callback=… → also aipass_oauth_callback
 */
final class OAuthIntent
{
    public const COOKIE_DESKTOP = 'aipass_oauth_desktop';

    public const COOKIE_POPUP = 'aipass_oauth_popup';

    public const COOKIE_BRIDGE = 'aipass_oauth_bridge';

    public const COOKIE_CALLBACK = 'aipass_oauth_callback';

    private const TTL_MINUTES = 15;

    public static function rememberFromRequest(Request $request): void
    {
        $minutes = self::TTL_MINUTES;

        if (self::truthy($request->query('desktop'))) {
            cookie()->queue(self::make(self::COOKIE_DESKTOP, '1', $minutes));
        }

        if (self::truthy($request->query('popup'))) {
            cookie()->queue(self::make(self::COOKIE_POPUP, '1', $minutes));
        }

        if (self::truthy($request->query('bridge'))) {
            cookie()->queue(self::make(self::COOKIE_BRIDGE, '1', $minutes));
        }

        $callback = $request->query('callback');
        if (is_string($callback) && $callback !== '' && self::truthy($request->query('desktop'))) {
            cookie()->queue(self::make(self::COOKIE_CALLBACK, $callback, $minutes));
        }
    }

    public static function wantsDesktop(Request $request): bool
    {
        return self::truthy($request->query('desktop'))
            || self::truthy($request->cookie(self::COOKIE_DESKTOP))
            || (bool) $request->session()->get('oauth_desktop');
    }

    public static function resolveCallback(Request $request): ?string
    {
        $fromSession = $request->session()->get('auth_callback');
        if (is_string($fromSession) && $fromSession !== '') {
            return $fromSession;
        }

        $fromCookie = $request->cookie(self::COOKIE_CALLBACK);
        if (is_string($fromCookie) && $fromCookie !== '') {
            return $fromCookie;
        }

        $fromQuery = $request->query('callback');

        return is_string($fromQuery) && $fromQuery !== '' ? $fromQuery : null;
    }

    public static function clear(Request $request): void
    {
        $request->session()->forget(['oauth_desktop', 'oauth_popup', 'oauth_bridge', 'auth_callback']);

        foreach ([self::COOKIE_DESKTOP, self::COOKIE_POPUP, self::COOKIE_BRIDGE, self::COOKIE_CALLBACK] as $name) {
            cookie()->queue(cookie()->forget($name));
        }
    }

    private static function make(string $name, string $value, int $minutes): Cookie
    {
        return cookie(
            name: $name,
            value: $value,
            minutes: $minutes,
            path: '/',
            domain: null,
            secure: true,
            httpOnly: true,
            raw: false,
            sameSite: 'lax',
        );
    }

    private static function truthy(mixed $value): bool
    {
        if ($value === true || $value === 1 || $value === '1') {
            return true;
        }

        if (! is_string($value)) {
            return false;
        }

        return in_array(strtolower($value), ['1', 'true', 'yes', 'on'], true);
    }
}
