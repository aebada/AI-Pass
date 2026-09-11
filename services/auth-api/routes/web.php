<?php

use App\Http\Controllers\Auth\DesktopAuthController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\MeController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('/login');
});

Route::prefix('auth')->group(function (): void {
    Route::get('google', [GoogleAuthController::class, 'redirect'])->name('auth.google');
    Route::get('google/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');

    Route::get('google/desktop-complete', [DesktopAuthController::class, 'complete'])->name('auth.desktop.complete');
    Route::get('google/desktop-exchange', [DesktopAuthController::class, 'exchange'])->name('auth.desktop.exchange');

    Route::get('login', [LoginController::class, 'show'])->name('auth.login');
    Route::post('login', [LoginController::class, 'login'])->name('auth.login.submit');

    Route::get('register', [RegisterController::class, 'show'])->name('auth.register');
    Route::post('register', [RegisterController::class, 'register'])->name('auth.register.submit');

    Route::match(['get', 'post'], 'logout', LogoutController::class)->name('auth.logout');

    Route::get('me', MeController::class)->name('auth.me');

    Route::get('forgot-password', [ForgotPasswordController::class, 'show'])->name('password.request');
    Route::post('forgot-password', [ForgotPasswordController::class, 'send'])->name('password.email');

    Route::get('reset-password/{token}', [ResetPasswordController::class, 'show'])->name('password.reset');
    Route::post('reset-password', [ResetPasswordController::class, 'reset'])->name('password.update');

    Route::get('verify-email', [VerifyEmailController::class, 'notice'])
        ->middleware('auth')
        ->name('verification.notice');
    Route::get('verify-email/{id}/{hash}', [VerifyEmailController::class, 'verify'])
        ->middleware(['auth', 'signed'])
        ->name('verification.verify');
    Route::post('email/verification-notification', [VerifyEmailController::class, 'resend'])
        ->middleware(['auth', 'throttle:6,1'])
        ->name('verification.send');
});

// Legacy php-auth URLs (keep until php-auth/ is removed from deploy)
Route::redirect('/auth/google.php', '/auth/google');
Route::redirect('/auth/google-callback.php', '/auth/google/callback');
Route::redirect('/auth/login.php', '/auth/login');
Route::redirect('/auth/register.php', '/auth/register');
Route::redirect('/auth/logout.php', '/auth/logout');
Route::redirect('/auth/me.php', '/auth/me');
