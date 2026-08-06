<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Lang;

class ResetPasswordNotification extends ResetPassword
{
    /**
     * Build the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     */
    public function toMail($notifiable): MailMessage
    {
        if (static::$toMailCallback) {
            return call_user_func(static::$toMailCallback, $notifiable, $this->token);
        }

        return $this->buildMailMessage($this->resetUrl($notifiable));
    }

    /**
     * @param  string  $url
     */
    protected function buildMailMessage($url): MailMessage
    {
        return (new MailMessage)
            ->subject(Lang::get('Reset your AI-Pass password'))
            ->greeting(Lang::get('Hello!'))
            ->line(Lang::get('You are receiving this email because we received a password reset request for your AI-Pass account.'))
            ->action(Lang::get('Reset Password'), $url)
            ->line(Lang::get('This password reset link will expire in :count minutes.', [
                'count' => config('auth.passwords.'.config('auth.defaults.passwords').'.expire'),
            ]))
            ->line(Lang::get('If you did not request a password reset, no further action is required.'));
    }

    /**
     * Always build absolute https://aipass.space links (never localhost).
     *
     * @param  mixed  $notifiable
     */
    protected function resetUrl($notifiable): string
    {
        if (static::$createUrlCallback) {
            return call_user_func(static::$createUrlCallback, $notifiable, $this->token);
        }

        $base = rtrim((string) config('app.url'), '/');

        return $base.'/auth/reset-password/'.$this->token
            .'?email='.urlencode($notifiable->getEmailForPasswordReset());
    }
}
