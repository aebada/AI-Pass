<?php

return [

    /*
    |--------------------------------------------------------------------------
    | AI-Pass frontend integration
    |--------------------------------------------------------------------------
    */

    'frontend_url' => env('AIPASS_FRONTEND_URL', 'https://aipass.space'),

    'login_success_path' => env('AIPASS_LOGIN_SUCCESS_PATH', '/workspace'),

    /*
    | Shared HMAC secret for cross-app Google OAuth (defaults to GOOGLE_CLIENT_SECRET).
    | Trusted hosts may receive a short-lived bridge_token after Google sign-in.
    */
    'oauth_bridge_secret' => env('AIPASS_OAUTH_BRIDGE_SECRET', env('GOOGLE_CLIENT_SECRET')),

    'trusted_callback_hosts' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env('AIPASS_TRUSTED_CALLBACK_HOSTS', 'aipass.space,oktoberhub.de,127.0.0.1,localhost'))
    ))),

];
