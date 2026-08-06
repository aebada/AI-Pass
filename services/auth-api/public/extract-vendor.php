<?php
declare(strict_types=1);

$token = (string) ($_GET['token'] ?? '');
$envFile = dirname(__DIR__) . '/.env';
if (! is_file($envFile)) {
    http_response_code(404);
    exit('Not found');
}

$expected = '';
foreach (file($envFile, FILE_IGNORE_NEW_LINES) ?: [] as $line) {
    if (str_starts_with($line, 'SETUP_TOKEN=')) {
        $expected = substr($line, strlen('SETUP_TOKEN='));
        break;
    }
}

if ($expected === '' || ! hash_equals($expected, $token)) {
    http_response_code(404);
    exit('Not found');
}

$archive = dirname(__DIR__) . '/aipass-vendor.tar.gz';
if (! is_file($archive)) {
    http_response_code(404);
    exit('Archive not found');
}

header('Content-Type: text/plain; charset=UTF-8');

$root = dirname(__DIR__);
$cmd = sprintf('cd %s && tar xzf %s 2>&1', escapeshellarg($root), escapeshellarg($archive));
$output = shell_exec($cmd) ?? '';
@unlink($archive);
@unlink(__FILE__);

echo "vendor extract\n{$output}\nOK\n";
