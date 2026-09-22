<?php

declare(strict_types=1);

namespace AiPass\Auth;

use PDO;
use PDOException;

final class Database
{
    private static ?PDO $pdo = null;

    public static function connection(Config $config): PDO
    {
        if (self::$pdo instanceof PDO) {
            return self::$pdo;
        }

        if ($config->dbName === '' || $config->dbUser === '') {
            throw new \RuntimeException('Database credentials are not configured. Set DB_* in auth-lib/.env');
        }

        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
            $config->dbHost,
            $config->dbPort,
            $config->dbName,
        );

        try {
            self::$pdo = new PDO($dsn, $config->dbUser, $config->dbPass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            throw new \RuntimeException('Database connection failed: ' . $e->getMessage(), 0, $e);
        }

        return self::$pdo;
    }
}
