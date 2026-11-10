<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/auth-lib/bootstrap.php';

use AiPass\Auth\SessionAuth;

SessionAuth::logout();
SessionAuth::redirect('/');
