<?php

declare(strict_types=1);

namespace AiPass\Auth;

final class AuthService
{
    public function __construct(
        private readonly UserRepository $users,
        private readonly Config $config,
    ) {
    }

    public static function make(Config $config): self
    {
        $pdo = Database::connection($config);

        return new self(new UserRepository($pdo), $config);
    }

    public function registerWithEmail(string $email, string $password, ?string $name = null): array
    {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException('Invalid email address.');
        }

        if (strlen($password) < 8) {
            throw new \InvalidArgumentException('Password must be at least 8 characters.');
        }

        if ($this->users->findByEmail($email) !== null) {
            throw new \InvalidArgumentException('An account with this email already exists. Sign in instead.');
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);

        return $this->users->createEmailUser($email, $hash, $name);
    }

    public function loginWithEmail(string $email, string $password): array
    {
        $user = $this->users->findByEmail($email);
        if ($user === null || empty($user['password_hash'])) {
            throw new \InvalidArgumentException('Invalid email or password.');
        }

        if (!password_verify($password, $user['password_hash'])) {
            throw new \InvalidArgumentException('Invalid email or password.');
        }

        $this->users->touchLogin($user['id']);

        return $this->users->findById($user['id']) ?? $user;
    }

    public function loginWithGoogleProfile(array $profile): array
    {
        return $this->users->upsertFromGoogle(
            $profile['google_id'],
            $profile['email'],
            $profile['name'] ?? null,
            $profile['avatar_url'] ?? null,
        );
    }

    public function successRedirect(?string $callback = null): string
    {
        $default = $this->config->loginSuccessUrl;
        if ($callback === null || $callback === '') {
            return $default;
        }

        if (str_starts_with($callback, '/') && !str_starts_with($callback, '//')) {
            return $callback;
        }

        $parsed = parse_url($callback);
        $appHost = parse_url($this->config->appUrl, PHP_URL_HOST);
        if (is_array($parsed) && isset($parsed['host']) && $parsed['host'] === $appHost) {
            $path = $parsed['path'] ?? '/';
            $query = isset($parsed['query']) ? '?' . $parsed['query'] : '';

            return $path . $query;
        }

        return $default;
    }
}
