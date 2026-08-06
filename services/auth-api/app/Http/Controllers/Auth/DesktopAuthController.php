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

class DesktopAuthController extends Controller
{
    /**
     * Shown in the system browser after Google OAuth succeeds with ?desktop=1.
     * Auto-opens the IDE via aipass:// deep link so Electron can exchange the code.
     */
    public function complete(Request $request): View|RedirectResponse
    {
        $code = trim((string) $request->query('code', ''));

        if (! DesktopAuthCode::exists($code)) {
            return redirect()->route('auth.login', ['error' => 'google_failed']);
        }

        $deepLink = 'aipass://auth/desktop?code='.rawurlencode($code);

        return view('auth.desktop-complete', [
            'code' => $code,
            'deepLink' => $deepLink,
            'workspaceUrl' => AuthRedirect::resolve('/workspace'),
        ]);
    }

    /**
     * Electron loads this URL in its persist:aipass partition to establish the session cookie.
     */
    public function exchange(Request $request): RedirectResponse
    {
        $code = (string) ($request->query('code') ?? $request->input('code') ?? '');
        $userId = DesktopAuthCode::consume($code);

        if ($userId === null) {
            return redirect()->route('auth.login', ['error' => 'google_failed']);
        }

        $user = User::query()->find($userId);
        if ($user === null) {
            return redirect()->route('auth.login', ['error' => 'google_failed']);
        }

        Auth::login($user, true);
        $request->session()->regenerate();
        $user->touchLastLogin();

        return redirect()->to(AuthRedirect::resolve('/workspace'));
    }
}
