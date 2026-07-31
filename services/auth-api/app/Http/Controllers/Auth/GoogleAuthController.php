<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\GoogleAuthService;
use App\Support\AuthRedirect;
use App\Support\DesktopAuthCode;
use App\Support\OAuthIntent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class GoogleAuthController extends Controller
{
    public function redirect(Request $request): RedirectResponse
    {
        $callback = AuthRedirect::resolve(OAuthIntent::resolveCallback($request) ?? $request->query('callback'));
        $request->session()->put('auth_callback', $callback);

        if (OAuthIntent::wantsDesktop($request)) {
            $request->session()->put('oauth_desktop', true);
        }

        OAuthIntent::rememberFromRequest($request);

        return Socialite::driver('google')
            ->scopes(['openid', 'email', 'profile'])
            ->with(['prompt' => 'select_account'])
            ->redirect();
    }

    public function callback(Request $request, GoogleAuthService $googleAuth): Response
    {
        try {
            try {
                $googleUser = Socialite::driver('google')->user();
            } catch (InvalidStateException $stateError) {
                // Session state often lost across Electron ↔ system-browser handoffs.
                // If Google still returned a code, exchange it without state (stateless fallback).
                if (! $request->filled('code')) {
                    throw $stateError;
                }

                $googleUser = Socialite::driver('google')->stateless()->user();
            }

            $user = $googleAuth->findOrCreate($googleUser);
            $user->touchLastLogin();

            Auth::login($user, true);
            $request->session()->regenerate();

            $destination = AuthRedirect::resolve(
                $request->session()->pull('auth_callback')
                    ?? OAuthIntent::resolveCallback($request)
            );

            $wantsDesktop = OAuthIntent::wantsDesktop($request);
            OAuthIntent::clear($request);

            if ($wantsDesktop) {
                $code = DesktopAuthCode::issue($user, $destination);

                // Prefer HTTPS interstitial so browsers that block custom-scheme 302s still work.
                return redirect()->route('auth.desktop.complete', ['code' => $code]);
            }

            return redirect()->to($destination);
        } catch (InvalidStateException $e) {
            report($e);
            OAuthIntent::clear($request);

            return redirect()->to(AuthRedirect::loginError('google_state'));
        } catch (Throwable $e) {
            report($e);
            OAuthIntent::clear($request);

            return redirect()->to(AuthRedirect::loginError('google_failed'));
        }
    }
}
