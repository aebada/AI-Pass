<?php
/**
 * One-time Laravel migrate (no SSH). Remove this file after success.
 * Usage: /auth/run-migrate.php?token=SETUP_TOKEN
 */
declare(strict_types=1);

$token = (string) ($_GET['token'] ?? '');
if ($token === '') {
    http_response_code(404);
    exit('Not found');
}

$laravelRoot = realpath($_SERVER['DOCUMENT_ROOT'] . '/../laravel-auth');
if ($laravelRoot === false || ! is_file($laravelRoot . '/artisan')) {
    http_response_code(500);
    exit('Laravel app not found');
}

require $laravelRoot . '/vendor/autoload.php';
$app = require_once $laravelRoot . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$expected = (string) env('SETUP_TOKEN', '');
if ($expected === '' || ! hash_equals($expected, $token)) {
    http_response_code(404);
    exit('Not found');
}

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
        echo "\nOK — run-migrate.php removed. Remove SETUP_TOKEN from laravel-auth/.env.\n";
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo 'Error: ' . $e->getMessage() . "\n";
}
