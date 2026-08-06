<?php
/**
 * One-time Laravel migrate (no SSH). Remove after success.
 * Usage: /laravel-auth/public/setup.php?token=SETUP_TOKEN
 */
declare(strict_types=1);

$token = (string) ($_GET['token'] ?? '');
if ($token === '') {
    http_response_code(404);
    exit('Not found');
}

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$expected = (string) env('SETUP_TOKEN', '');
if ($expected === '' || ! hash_equals($expected, $token)) {
    http_response_code(404);
    exit('Not found');
}

$laravelRoot = dirname(__DIR__);
foreach (['storage/framework/cache', 'storage/framework/sessions', 'storage/framework/views', 'storage/logs', 'bootstrap/cache'] as $dir) {
    $path = $laravelRoot . '/' . $dir;
    if (! is_dir($path)) {
        mkdir($path, 0755, true);
    }
}

header('Content-Type: text/plain; charset=UTF-8');

try {
    $status = \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
    $output = trim(\Illuminate\Support\Facades\Artisan::output());
    echo "migrate --force (exit {$status})\n{$output}\n";

    if ($status === 0) {
        @unlink(__FILE__);
        echo "\nOK — setup.php removed. Remove SETUP_TOKEN from .env.\n";
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo 'Error: ' . $e->getMessage() . "\n";
    if (str_contains($e->getMessage(), 'Access denied') || str_contains($e->getMessage(), 'SQLSTATE')) {
        echo "\nHint: verify DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD in laravel-auth/.env (hPanel → Databases).\n";
    }
}
