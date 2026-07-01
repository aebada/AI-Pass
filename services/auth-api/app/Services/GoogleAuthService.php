<?php

namespace App\Services;

use App\Models\User;
use Laravel\Socialite\Contracts\User as SocialiteUser;

final class GoogleAuthService
{
    public function findOrCreate(SocialiteUser $googleUser): User
    {
        $googleId = (string) $googleUser->getId();
        $email = strtolower(trim((string) $googleUser->getEmail()));
        $name = $googleUser->getName();
        $avatar = $googleUser->getAvatar();

        if ($email === '' || $googleId === '') {
            throw new \RuntimeException('Google did not return required profile fields.');
        }

        $byGoogle = User::query()->where('google_id', $googleId)->first();
        if ($byGoogle !== null) {
            return $this->updateGoogleProfile($byGoogle, $name, $avatar);
        }

        $byEmail = User::query()->where('email', $email)->first();
        if ($byEmail !== null) {
            $byEmail->forceFill([
                'google_id' => $googleId,
                'name' => $name ?? $byEmail->name,
                'avatar_url' => $avatar ?? $byEmail->avatar_url,
                'auth_provider' => $byEmail->hasPassword() ? 'linked' : 'google',
                'email_verified_at' => $byEmail->email_verified_at ?? now(),
            ])->save();

            return $byEmail->fresh() ?? $byEmail;
        }

        return User::query()->create([
            'email' => $email,
            'name' => $name,
            'google_id' => $googleId,
            'avatar_url' => $avatar,
            'auth_provider' => 'google',
            'email_verified_at' => now(),
            'last_login_at' => now(),
        ]);
    }

    private function updateGoogleProfile(User $user, ?string $name, ?string $avatar): User
    {
        $user->forceFill([
            'name' => $name ?? $user->name,
            'avatar_url' => $avatar ?? $user->avatar_url,
            'last_login_at' => now(),
        ])->save();

        return $user->fresh() ?? $user;
    }
}
