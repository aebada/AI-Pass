<?php

namespace App\Support;

final class OAuthBridgeToken
{
    public static function issue(string $googleId, string $email, ?string $name, ?string $avatar): string
    {
        $payload = [
            'sub' => $googleId,
            'email' => strtolower(trim($email)),
            'name' => $name,
            'avatar' => $avatar,
            'exp' => time() + 300,
            'nonce' => bin2hex(random_bytes(8)),
        ];

        $body = self::base64UrlEncode(json_encode($payload, JSON_THROW_ON_ERROR));
        $signature = self::base64UrlEncode(hash_hmac('sha256', $body, self::secret(), true));

        return $body.'.'.$signature;
    }

    /**
     * @return array{sub: string, email: string, name: ?string, avatar: ?string}
     */
    public static function verify(string $token): array
    {
        $parts = explode('.', $token, 2);
        if (count($parts) !== 2) {
            throw new \InvalidArgumentException('Invalid bridge token.');
        }

        [$body, $signature] = $parts;
        $expected = self::base64UrlEncode(hash_hmac('sha256', $body, self::secret(), true));

        if (! hash_equals($expected, $signature)) {
            throw new \InvalidArgumentException('Invalid bridge token signature.');
        }

        /** @var array<string, mixed> $payload */
        $payload = json_decode(self::base64UrlDecode($body), true, 512, JSON_THROW_ON_ERROR);

        if (($payload['exp'] ?? 0) < time()) {
            throw new \InvalidArgumentException('Bridge token expired.');
        }

        $email = strtolower(trim((string) ($payload['email'] ?? '')));
        $googleId = (string) ($payload['sub'] ?? '');

        if ($email === '' || $googleId === '') {
            throw new \InvalidArgumentException('Bridge token missing profile fields.');
        }

        return [
            'sub' => $googleId,
            'email' => $email,
            'name' => isset($payload['name']) ? (string) $payload['name'] : null,
            'avatar' => isset($payload['avatar']) ? (string) $payload['avatar'] : null,
        ];
    }

    private static function secret(): string
    {
        $secret = (string) config('aipass.oauth_bridge_secret', config('services.google.client_secret'));

        if ($secret === '') {
            throw new \RuntimeException('OAuth bridge secret is not configured.');
        }

        return $secret;
    }

    private static function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $value): string
    {
        $padding = strlen($value) % 4;
        if ($padding > 0) {
            $value .= str_repeat('=', 4 - $padding);
        }

        return base64_decode(strtr($value, '-_', '+/'), true) ?: '';
    }
}
