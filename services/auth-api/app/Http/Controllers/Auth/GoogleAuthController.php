<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\GoogleAuthService;
use App\Support\AuthRedirect;
use App\Support\DesktopAuthCode;
use App\Support\OAuthBridgeToken;
use App\Support\OAuthIntent;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;
use Throwable;

class GoogleAuthController extends Controller
{
    public function redirect(Request $request): RedirectResponse
    {
        $callback = AuthRedirect::resolve(AuthRedirect::callbackFromRequest($request));
        $request->session()->put('auth_callback', $callback);

        if ($request->query('popup') === '1') {
            $request->session()->put('auth_popup', true);
        }

        if ($request->query('bridge') === '1') {
            $request->session()->put('auth_bridge', true);
        }

        if ($request->query('desktop') === '1') {
            $request->session()->put('auth_desktop', true);
        }

        // Cookie backup if AIPASS_SESSION is dropped before Google returns.
        OAuthIntent::remember($request);

        return Socialite::driver('google')
            ->scopes(['openid', 'email', 'profile'])
            ->with(['prompt' => 'select_account'])
            ->redirect();
    }

    public function callback(Request $request, GoogleAuthService $googleAuth): RedirectResponse|View
    {
        // Read intent before regenerating session / forgetting cookies.
        $isPopup = OAuthIntent::isPopup($request);
        $isDesktop = OAuthIntent::isDesktop($request);
        $isBridge = OAuthIntent::isBridge($request);
        $callback = OAuthIntent::callback($request);

        try {
            $googleUser = $this->resolveGoogleUser($request);
            $user = $googleAuth->findOrCreate($googleUser);
            $user->touchLastLogin();

            Auth::login($user, true);
            $request->session()->regenerate();
            OAuthIntent::forget($request);

            if ($isDesktop) {
                $code = DesktopAuthCode::issue($user->getKey());

                return redirect()->route('auth.desktop.complete', ['code' => $code]);
            }

            if ($isPopup) {
                return view('auth.google-popup-close', ['success' => true]);
            }

            $destination = AuthRedirect::resolve($callback);

            if ($isBridge && AuthRedirect::isTrustedExternal($destination)) {
                $token = OAuthBridgeToken::issue(
                    (string) $googleUser->getId(),
                    (string) $googleUser->getEmail(),
                    $googleUser->getName(),
                    $googleUser->getAvatar(),
                );
                $separator = str_contains($destination, '?') ? '&' : '?';

                return redirect()->to($destination.$separator.'bridge_token='.urlencode($token));
            }

            return redirect()->to($destination);
        } catch (Throwable $e) {
            Log::warning('Google OAuth callback failed', [
                'type' => $e instanceof InvalidStateException ? 'invalid_state' : class_basename($e),
                'message' => $e->getMessage(),
            ]);
            report($e);
            OAuthIntent::forget($request);

            if ($isPopup) {
                return view('auth.google-popup-close', ['success' => false]);
            }

            $error = $e instanceof InvalidStateException ? 'google_state' : 'google_failed';
            $frontendLogin = rtrim((string) config('aipass.frontend_url', config('app.url')), '/').'/login';

            return redirect()->to($frontendLogin.'?error='.urlencode($error));
        }
    }

    /**
     * Prefer stateful Socialite (CSRF state). If the session was lost but Google
     * still returned an auth code, fall back to stateless token exchange.
     */
    private function resolveGoogleUser(Request $request): \Laravel\Socialite\Contracts\User
    {
        try {
            return Socialite::driver('google')->user();
        } catch (InvalidStateException $e) {
            if (! $request->filled('code')) {
                throw $e;
            }

            Log::notice('Google OAuth falling back to stateless user() after InvalidStateException');

            return Socialite::driver('google')->stateless()->user();
        }
    }
}
