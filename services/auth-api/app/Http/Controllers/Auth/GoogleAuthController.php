<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\GoogleAuthService;
use App\Support\AuthRedirect;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class GoogleAuthController extends Controller
{
    public function redirect(Request $request): RedirectResponse
    {
        $callback = AuthRedirect::resolve($request->query('callback'));
        $request->session()->put('auth_callback', $callback);

        return Socialite::driver('google')
            ->scopes(['openid', 'email', 'profile'])
            ->with(['prompt' => 'select_account'])
            ->redirect();
    }

    public function callback(Request $request, GoogleAuthService $googleAuth): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();
            $user = $googleAuth->findOrCreate($googleUser);
            $user->touchLastLogin();

            Auth::login($user, true);
            $request->session()->regenerate();

            $destination = AuthRedirect::resolve($request->session()->pull('auth_callback'));

            return redirect()->to($destination);
        } catch (Throwable $e) {
            report($e);

            return redirect()
                ->route('auth.login', ['error' => 'google_failed'])
                ->withErrors(['email' => 'Google sign-in failed. Please try again.']);
        }
    }
}
