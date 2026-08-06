<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Support\AuthRedirect;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LogoutController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        $redirect = $request->query('redirect');

        return redirect()->away(
            $redirect !== null && $redirect !== ''
                ? AuthRedirect::resolve($redirect)
                : rtrim((string) config('aipass.frontend_url'), '/').'/'
        );
    }
}
