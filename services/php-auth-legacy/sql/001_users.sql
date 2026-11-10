-- AI-Pass users table (MySQL 8+ / MariaDB 10.3+)
-- Run once in Hostinger phpMyAdmin or: mysql -u USER -p DB_NAME < 001_users.sql

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) NOT NULL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NULL COMMENT 'NULL for Google-only accounts',
  name VARCHAR(255) NULL,
  google_id VARCHAR(255) NULL,
  avatar_url VARCHAR(512) NULL,
  auth_provider ENUM('email', 'google', 'linked') NOT NULL DEFAULT 'email',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at DATETIME NULL,
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_google_id (google_id),
  KEY idx_users_email_lookup (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
