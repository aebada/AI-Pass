<?php

declare(strict_types=1);

namespace AiPass\Auth;

use Google\Client as GoogleClient;
use Google\Service\Oauth2;

final class GoogleOAuth
{
    public function __construct(private readonly Config $config)
    {
    }

    public function client(): GoogleClient
    {
        if ($this->config->googleClientId === '' || $this->config->googleClientSecret === '') {
            throw new \RuntimeException('Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
        }

        $client = new GoogleClient();
        $client->setClientId($this->config->googleClientId);
        $client->setClientSecret($this->config->googleClientSecret);
        $client->setRedirectUri($this->config->googleRedirectUri);
        $client->setAccessType('online');
        $client->setPrompt('select_account');
        $client->setScopes(['openid', 'email', 'profile']);

        return $client;
    }

    public function authorizationUrl(string $state): string
    {
        $client = $this->client();
        $client->setState($state);

        return $client->createAuthUrl();
    }

    /**
     * @return array{google_id: string, email: string, name: ?string, avatar_url: ?string}
     */
    public function fetchUserFromCode(string $code): array
    {
        $client = $this->client();
        $token = $client->fetchAccessTokenWithAuthCode($code);

        if (isset($token['error'])) {
            throw new \RuntimeException('Google token error: ' . ($token['error_description'] ?? $token['error']));
        }

        $client->setAccessToken($token);
        $oauth2 = new Oauth2($client);
        $googleUser = $oauth2->userinfo->get();

        $email = $googleUser->getEmail();
        $googleId = $googleUser->getId();

        if ($email === null || $googleId === null) {
            throw new \RuntimeException('Google did not return required profile fields.');
        }

        return [
            'google_id' => (string) $googleId,
            'email' => strtolower((string) $email),
            'name' => $googleUser->getName(),
            'avatar_url' => $googleUser->getPicture(),
        ];
    }
}
