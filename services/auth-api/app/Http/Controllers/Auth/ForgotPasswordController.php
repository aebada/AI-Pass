<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\View\View;
use Throwable;

class ForgotPasswordController extends Controller
{
    public function show(): View
    {
        return view('auth.forgot-password');
    }

    public function send(Request $request): RedirectResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        $mailer = (string) config('mail.default');
        if (in_array($mailer, ['log', 'array'], true) && app()->environment('production')) {
            Log::error('Password reset blocked: MAIL_MAILER is '.$mailer.' in production. Configure Hostinger SMTP.');

            return back()->withErrors([
                'email' => 'Email delivery is not configured. Please contact support at info@aipass.space.',
            ]);
        }

        try {
            $status = Password::sendResetLink($request->only('email'));
        } catch (Throwable $e) {
            Log::error('Password reset mail failed: '.$e->getMessage(), [
                'exception' => $e::class,
            ]);

            return back()->withErrors([
                'email' => 'We could not send the reset email. Please try again later or contact info@aipass.space.',
            ]);
        }

        return $status === Password::RESET_LINK_SENT
            ? back()->with('status', __($status))
            : back()->withErrors(['email' => __($status)]);
    }
}
