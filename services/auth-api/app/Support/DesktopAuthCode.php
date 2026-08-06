<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * One-time codes that move a completed Google login from the system browser
 * into the Electron IDE session (cookies are not shared across those worlds).
 */
final class DesktopAuthCode
{
    private const TTL_SECONDS = 300;

    public static function issue(int|string $userId): string
    {
        $code = Str::random(48);
        Cache::put(self::key($code), (string) $userId, self::TTL_SECONDS);

        return $code;
    }

    public static function exists(string $code): bool
    {
        $code = trim($code);
        if ($code === '' || strlen($code) < 32) {
            return false;
        }

        return Cache::has(self::key($code));
    }

    public static function consume(string $code): ?string
    {
        $code = trim($code);
        if ($code === '' || strlen($code) < 32) {
            return null;
        }

        $key = self::key($code);
        $userId = Cache::pull($key);

        return is_string($userId) && $userId !== '' ? $userId : null;
    }

    private static function key(string $code): string
    {
        return 'aipass:desktop-auth:'.hash('sha256', $code);
    }
}
