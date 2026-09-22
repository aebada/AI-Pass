<?php

declare(strict_types=1);

namespace AiPass\Auth;

final class Config
{
    public function __construct(
        public readonly string $appUrl,
        public readonly string $appEnv,
        public readonly string $dbHost,
        public readonly int $dbPort,
        public readonly string $dbName,
        public readonly string $dbUser,
        public readonly string $dbPass,
        public readonly string $googleClientId,
        public readonly string $googleClientSecret,
        public readonly string $googleRedirectUri,
        public readonly string $sessionSecret,
        public readonly string $loginSuccessUrl,
    ) {
    }

    public static function fromEnvironment(): self
    {
        return new self(
            appUrl: rtrim(self::env('APP_URL', 'http://localhost'), '/'),
            appEnv: self::env('APP_ENV', 'production'),
            dbHost: self::env('DB_HOST', 'localhost'),
            dbPort: (int) self::env('DB_PORT', '3306'),
            dbName: self::env('DB_NAME', ''),
            dbUser: self::env('DB_USER', ''),
            dbPass: self::env('DB_PASS', ''),
            googleClientId: self::env('GOOGLE_CLIENT_ID', ''),
            googleClientSecret: self::env('GOOGLE_CLIENT_SECRET', ''),
            googleRedirectUri: self::env('GOOGLE_REDIRECT_URI', ''),
            sessionSecret: self::env('SESSION_SECRET', ''),
            loginSuccessUrl: self::env('LOGIN_SUCCESS_URL', '/workspace'),
        );
    }

    public function isProduction(): bool
    {
        return $this->appEnv === 'production';
    }

    private static function env(string $key, string $default = ''): string
    {
        $value = $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key);
        if ($value === false || $value === null || $value === '') {
            return $default;
        }

        return (string) $value;
    }
}
