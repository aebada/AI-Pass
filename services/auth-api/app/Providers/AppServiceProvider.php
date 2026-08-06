<?php

namespace App\Providers;

use App\Notifications\ResetPasswordNotification;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force production reset links onto APP_URL (https://aipass.space), never localhost.
        ResetPasswordNotification::createUrlUsing(function (object $notifiable, string $token): string {
            $base = rtrim((string) config('app.url'), '/');

            return $base.'/auth/reset-password/'.$token
                .'?email='.urlencode($notifiable->getEmailForPasswordReset());
        });
    }
}
