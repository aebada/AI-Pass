<?php

declare(strict_types=1);

$authLibDir = __DIR__;

require_once $authLibDir . '/vendor/autoload.php';

use AiPass\Auth\Config;
use AiPass\Auth\SessionAuth;
use Dotenv\Dotenv;

$envFile = $authLibDir . '/.env';
if (is_readable($envFile)) {
    Dotenv::createImmutable($authLibDir)->safeLoad();
}

$config = Config::fromEnvironment();
SessionAuth::start($config);
