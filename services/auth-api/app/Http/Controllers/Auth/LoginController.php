<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Support\AuthRedirect;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class LoginController extends Controller
{
    public function show(Request $request): View|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->to(AuthRedirect::resolve(AuthRedirect::callbackFromRequest($request)));
        }

        return view('auth.login', [
            'callback' => AuthRedirect::callbackFromRequest($request),
        ]);
    }

    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $remember = $request->boolean('remember');
        $callback = AuthRedirect::resolve(AuthRedirect::callbackFromRequest($request));

        if (! Auth::attempt($credentials, $remember)) {
            return back()
                ->withInput($request->only('email', 'remember'))
                ->withErrors(['email' => 'Invalid email or password.']);
        }

        $user = Auth::user();
        if ($user !== null && ! $user->hasPassword()) {
            Auth::logout();

            return back()
                ->withInput($request->only('email'))
                ->withErrors(['email' => 'This account uses Google sign-in. Continue with Google instead.']);
        }

        $request->session()->regenerate();
        $user?->touchLastLogin();

        return redirect()->to($callback);
    }
}
