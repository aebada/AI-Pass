<?php

use App\Http\Controllers\Api\AiChatController;
use App\Http\Controllers\Api\AiModelsController;
use App\Http\Controllers\Api\IntegrationsController;
use App\Http\Controllers\Api\OrgGovernanceController;
use App\Http\Controllers\Api\ScimConfigController;
use App\Http\Controllers\Api\TwinChatController;
use App\Http\Controllers\Scim\ScimController;
use App\Http\Middleware\AuthenticateScimToken;
use Illuminate\Support\Facades\Route;

/*
| AI + Digital Twin API — proxied from public_html/.htaccess on static hosting.
| Uses web middleware (session cookies) so Laravel auth works from the browser.
*/

Route::prefix('api/v1')->group(function (): void {
    Route::get('ai/models', [AiModelsController::class, 'index']);

    // External ecosystem deployments (Invoice AI, Carbon, Sovra AI). Server-side
    // only — the remotes send no CORS headers and hold no session for this origin.
    Route::get('integrations', [IntegrationsController::class, 'index']);
    Route::get('integrations/{id}/{endpoint}', [IntegrationsController::class, 'show']);
    Route::post('ai/chat', [AiChatController::class, 'chat']);

    Route::post('twin/chat', [TwinChatController::class, 'chat']);

    Route::match(['get', 'post'], 'twin/memory', function () {
        if (request()->isMethod('post')) {
            return response()->json(['entry' => request()->all()]);
        }

        return response()->json([
            'entries' => [],
            'limits' => ['monthlyMessages' => 50, 'speech' => false],
            'usage' => ['messagesThisMonth' => 0],
        ]);
    });

    Route::get('twin/calendar/events', function () {
        return response()->json([
            'date' => now()->toDateString(),
            'events' => [],
            'connections' => [],
            'googleOAuthUrl' => url('/api/v1/twin/calendar/oauth/google'),
        ]);
    });

    Route::get('twin/calendar/oauth/google', function () {
        return response()->json([
            'status' => 'stub',
            'message' => 'Google Calendar OAuth — configure GOOGLE_CALENDAR_CLIENT_ID in Laravel .env',
            'roadmap' => 'docs/DIGITAL-TWIN.md#calendar-oauth',
        ]);
    });

    // Workspace people / groups / governance (session auth)
    Route::middleware('auth')->group(function (): void {
        Route::get('governance/capabilities', [OrgGovernanceController::class, 'capabilities']);

        Route::get('orgs/{org}/members', [OrgGovernanceController::class, 'members']);
        Route::post('orgs/{org}/members', [OrgGovernanceController::class, 'inviteMember']);
        Route::patch('orgs/{org}/members/{userId}', [OrgGovernanceController::class, 'updateMember']);

        Route::get('orgs/{org}/groups', [OrgGovernanceController::class, 'groups']);
        Route::post('orgs/{org}/groups', [OrgGovernanceController::class, 'createGroup']);
        Route::patch('orgs/{org}/groups/{groupId}', [OrgGovernanceController::class, 'updateGroup']);
        Route::delete('orgs/{org}/groups/{groupId}', [OrgGovernanceController::class, 'deleteGroup']);

        Route::get('orgs/{org}/scim', [ScimConfigController::class, 'show']);
        Route::post('orgs/{org}/scim/enable', [ScimConfigController::class, 'enable']);
        Route::post('orgs/{org}/scim/disable', [ScimConfigController::class, 'disable']);
    });
});

// SCIM 2.0 — bearer token auth (no CSRF / session)
Route::prefix('scim/v2')->middleware(AuthenticateScimToken::class)->group(function (): void {
    Route::get('ServiceProviderConfig', [ScimController::class, 'serviceProviderConfig']);
    Route::get('Schemas', [ScimController::class, 'schemas']);

    Route::get('Users', [ScimController::class, 'listUsers']);
    Route::get('Users/{id}', [ScimController::class, 'getUser']);
    Route::post('Users', [ScimController::class, 'createUser']);
    Route::put('Users/{id}', [ScimController::class, 'replaceUser']);
    Route::delete('Users/{id}', [ScimController::class, 'deleteUser']);

    Route::get('Groups', [ScimController::class, 'listGroups']);
    Route::get('Groups/{id}', [ScimController::class, 'getGroup']);
    Route::post('Groups', [ScimController::class, 'createGroup']);
    Route::put('Groups/{id}', [ScimController::class, 'replaceGroup']);
    Route::delete('Groups/{id}', [ScimController::class, 'deleteGroup']);
});
