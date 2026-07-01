<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\AuthRedirect;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class RegisterController extends Controller
{
    public function show(Request $request): View|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->to(AuthRedirect::resolve($request->query('callback')));
        }

        return view('auth.register', [
            'callback' => $request->query('callback', '/workspace'),
        ]);
    }

    public function register(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $callback = AuthRedirect::resolve($request->input('callback'));

        $user = User::query()->create([
            'name' => $validated['name'] ?? null,
            'email' => strtolower(trim($validated['email'])),
            'password_hash' => $validated['password'],
            'auth_provider' => 'email',
            'last_login_at' => now(),
        ]);

        event(new Registered($user));

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('verification.notice')->with('callback', $callback);
    }
}
