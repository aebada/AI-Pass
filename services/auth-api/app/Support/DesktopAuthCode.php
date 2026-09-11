<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * One-time codes that hand an authenticated browser OAuth session to the Electron IDE.
 *
 * System-browser cookies never sync into Electron's persist:aipass partition, so after
 * Google OAuth Laravel issues a short-lived code, redirects to aipass://auth/desktop?code=…,
 * and the IDE exchanges it at /auth/google/desktop-exchange inside its own cookie jar.
 */
final class DesktopAuthCode
{
    private const TTL_SECONDS = 300;

    public static function issue(User $user, ?string $callback = null): string
    {
        $code = Str::random(64);

        Cache::put(self::cacheKey($code), [
            'user_id' => $user->getAuthIdentifier(),
            'callback' => $callback,
            'issued_at' => now()->toIso8601String(),
        ], now()->addSeconds(self::TTL_SECONDS));

        return $code;
    }

    /**
     * @return array{user_id: mixed, callback: ?string, issued_at?: string}|null
     */
    public static function peek(string $code): ?array
    {
        $payload = Cache::get(self::cacheKey($code));

        return is_array($payload) ? $payload : null;
    }

    /**
     * Consume (single-use) a desktop auth code.
     *
     * @return array{user_id: mixed, callback: ?string, issued_at?: string}|null
     */
    public static function consume(string $code): ?array
    {
        $key = self::cacheKey($code);
        $payload = Cache::pull($key);

        return is_array($payload) ? $payload : null;
    }

    public static function deepLink(string $code): string
    {
        return 'aipass://auth/desktop?code='.rawurlencode($code);
    }

    private static function cacheKey(string $code): string
    {
        return 'aipass:desktop-auth:'.hash('sha256', $code);
    }
}
