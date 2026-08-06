<?php
declare(strict_types=1);

header('Content-Type: text/plain; charset=UTF-8');

$root = dirname(__DIR__);
$checks = [];

try {
    require $root . '/vendor/autoload.php';
    $checks[] = 'vendor: ok';
} catch (Throwable $e) {
    http_response_code(500);
    echo "vendor: FAIL\n" . $e->getMessage() . "\n";
    exit(1);
}

try {
    $app = require $root . '/bootstrap/app.php';
    $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
    $checks[] = 'bootstrap: ok';
} catch (Throwable $e) {
    http_response_code(500);
    echo "bootstrap: FAIL\n" . $e->getMessage() . "\n";
    exit(1);
}

$checks[] = 'APP_KEY: ' . (env('APP_KEY') ? 'set' : 'MISSING');
$checks[] = 'GOOGLE_CLIENT_ID: ' . (env('GOOGLE_CLIENT_ID') ? 'set' : 'MISSING');
$checks[] = 'GOOGLE_CLIENT_SECRET: ' . (env('GOOGLE_CLIENT_SECRET') ? 'set' : 'MISSING');
$checks[] = 'SESSION_DRIVER: ' . (string) env('SESSION_DRIVER', '?');
$checks[] = 'CACHE_STORE: ' . (string) env('CACHE_STORE', '?');

$sessions = $root . '/storage/framework/sessions';
$checks[] = 'sessions writable: ' . (is_writable($sessions) ? 'yes' : 'NO');

$cachedConfig = $root . '/bootstrap/cache/config.php';
$checks[] = 'cached config: ' . (is_file($cachedConfig) ? 'present (may be stale)' : 'none');

echo implode("\n", $checks) . "\n";
