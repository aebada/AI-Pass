<?php

use App\Http\Controllers\Api\AiChatController;
use App\Http\Controllers\Api\AiModelsController;
use Illuminate\Support\Facades\Route;

/*
| AI API — proxied from public_html/.htaccess on static hosting.
| Uses web middleware (session cookies) so Laravel auth works from the browser.
*/

Route::middleware('web')->prefix('api/v1')->group(function (): void {
    Route::get('ai/models', [AiModelsController::class, 'index']);
    Route::post('ai/chat', [AiChatController::class, 'chat']);
});
