<?php

/*
|--------------------------------------------------------------------------
| External AI-Pass ecosystem deployments
|--------------------------------------------------------------------------
|
| Each entry mirrors packages/platform-core/src/integrations.ts. Requests are
| made server-side from this service: none of these deployments send CORS
| headers, and aipass.space ships as a static export, so the browser cannot
| reach them directly.
|
| Leave a key unset to keep that integration read-blocked — /health still
| reports liveness, but data endpoints return 503 rather than calling out.
|
*/

return [

    'timeout' => (int) env('INTEGRATIONS_TIMEOUT', 8),

    'services' => [

        'invoice-ai' => [
            'label' => 'Invoice AI',
            'base_url' => rtrim((string) env('INVOICE_AI_URL', 'https://invoice.ehopn.com'), '/').'/api/v1',
            'api_key' => env('INVOICE_AI_API_KEY'),
            'endpoints' => ['stats', 'invoices'],
        ],

        'carbon' => [
            'label' => 'Carbon',
            'base_url' => rtrim((string) env('CARBON_URL', 'https://carbon.ehopn.com'), '/').'/api/v1',
            'api_key' => env('CARBON_API_KEY'),
            'endpoints' => ['styles'],
        ],

        'sovra-ai' => [
            'label' => 'Sovra AI',
            'base_url' => rtrim((string) env('SOVRA_AI_URL', 'https://sovraai.de'), '/').'/api/v1',
            'api_key' => env('SOVRA_AI_API_KEY'),
            'endpoints' => ['stats', 'orders'],
        ],

    ],

];
