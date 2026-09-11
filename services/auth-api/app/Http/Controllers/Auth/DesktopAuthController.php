<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\AuthRedirect;
use App\Support\DesktopAuthCode;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class DesktopAuthController extends Controller
{
    /**
     * HTTPS interstitial after Google OAuth in the system browser.
     * Validates the one-time code still exists, then deep-links into the IDE.
     */
    public function complete(Request $request): Response|View
    {
        $code = (string) $request->query('code', '');
        if ($code === '' || DesktopAuthCode::peek($code) === null) {
            // Live Hostinger build redirects exchange/complete failures to Laravel /auth/login.
            return redirect()->route('auth.login', ['error' => 'google_failed']);
        }

        $deepLink = DesktopAuthCode::deepLink($code);

        if ($request->boolean('redirect')) {
            return redirect()->away($deepLink);
        }

        return view('auth.desktop-complete', [
            'deepLink' => $deepLink,
            'code' => $code,
            'exchangeUrl' => route('auth.desktop.exchange', ['code' => $code]),
        ]);
    }

    /**
     * Consumed by Electron after aipass://auth/desktop?code=… — establishes
     * the session cookie inside the persist:aipass partition.
     */
    public function exchange(Request $request): RedirectResponse
    {
        $code = (string) $request->query('code', '');
        $payload = $code !== '' ? DesktopAuthCode::consume($code) : null;

        if ($payload === null || empty($payload['user_id'])) {
            return redirect()->route('auth.login', ['error' => 'google_failed']);
        }

        $user = User::query()->find($payload['user_id']);
        if ($user === null) {
            return redirect()->route('auth.login', ['error' => 'google_failed']);
        }

        Auth::login($user, true);
        $request->session()->regenerate();

        $destination = AuthRedirect::resolve(
            is_string($payload['callback'] ?? null) ? $payload['callback'] : null
        );

        return redirect()->to($destination);
    }
}
