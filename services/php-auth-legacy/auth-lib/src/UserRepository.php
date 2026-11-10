<?php

declare(strict_types=1);

namespace AiPass\Auth;

use PDO;

final class UserRepository
{
    public function __construct(private readonly PDO $db)
    {
    }

    public function findById(string $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);

        $row = $stmt->fetch();

        return $row ?: null;
    }

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => strtolower(trim($email))]);

        $row = $stmt->fetch();

        return $row ?: null;
    }

    public function findByGoogleId(string $googleId): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE google_id = :google_id LIMIT 1');
        $stmt->execute(['google_id' => $googleId]);

        $row = $stmt->fetch();

        return $row ?: null;
    }

    public function createEmailUser(string $email, string $passwordHash, ?string $name = null): array
    {
        $id = self::uuid4();
        $email = strtolower(trim($email));
        $now = gmdate('Y-m-d H:i:s');

        $stmt = $this->db->prepare(
            'INSERT INTO users (id, email, password_hash, name, auth_provider, created_at, updated_at, last_login_at)
             VALUES (:id, :email, :password_hash, :name, :auth_provider, :created_at, :updated_at, :last_login_at)',
        );
        $stmt->execute([
            'id' => $id,
            'email' => $email,
            'password_hash' => $passwordHash,
            'name' => $name,
            'auth_provider' => 'email',
            'created_at' => $now,
            'updated_at' => $now,
            'last_login_at' => $now,
        ]);

        return $this->findById($id) ?? throw new \RuntimeException('Failed to create user');
    }

    /**
     * Link Google account to existing email user or create a new Google user.
     */
    public function upsertFromGoogle(string $googleId, string $email, ?string $name, ?string $avatarUrl): array
    {
        $email = strtolower(trim($email));
        $now = gmdate('Y-m-d H:i:s');

        $byGoogle = $this->findByGoogleId($googleId);
        if ($byGoogle !== null) {
            return $this->updateGoogleProfile($byGoogle['id'], $name, $avatarUrl, $now);
        }

        $byEmail = $this->findByEmail($email);
        if ($byEmail !== null) {
            $stmt = $this->db->prepare(
                'UPDATE users SET google_id = :google_id, name = COALESCE(:name, name),
                 avatar_url = COALESCE(:avatar_url, avatar_url),
                 auth_provider = CASE WHEN password_hash IS NOT NULL THEN :linked ELSE :google END,
                 updated_at = :updated_at, last_login_at = :last_login_at
                 WHERE id = :id',
            );
            $stmt->execute([
                'google_id' => $googleId,
                'name' => $name,
                'avatar_url' => $avatarUrl,
                'linked' => 'linked',
                'google' => 'google',
                'updated_at' => $now,
                'last_login_at' => $now,
                'id' => $byEmail['id'],
            ]);

            return $this->findById($byEmail['id']) ?? throw new \RuntimeException('Failed to link Google account');
        }

        $id = self::uuid4();
        $stmt = $this->db->prepare(
            'INSERT INTO users (id, email, password_hash, name, google_id, avatar_url, auth_provider, created_at, updated_at, last_login_at)
             VALUES (:id, :email, NULL, :name, :google_id, :avatar_url, :auth_provider, :created_at, :updated_at, :last_login_at)',
        );
        $stmt->execute([
            'id' => $id,
            'email' => $email,
            'name' => $name,
            'google_id' => $googleId,
            'avatar_url' => $avatarUrl,
            'auth_provider' => 'google',
            'created_at' => $now,
            'updated_at' => $now,
            'last_login_at' => $now,
        ]);

        return $this->findById($id) ?? throw new \RuntimeException('Failed to create Google user');
    }

    public function touchLogin(string $id): void
    {
        $stmt = $this->db->prepare('UPDATE users SET last_login_at = :last_login_at, updated_at = :updated_at WHERE id = :id');
        $stmt->execute([
            'last_login_at' => gmdate('Y-m-d H:i:s'),
            'updated_at' => gmdate('Y-m-d H:i:s'),
            'id' => $id,
        ]);
    }

    private function updateGoogleProfile(string $id, ?string $name, ?string $avatarUrl, string $now): array
    {
        $stmt = $this->db->prepare(
            'UPDATE users SET name = COALESCE(:name, name), avatar_url = COALESCE(:avatar_url, avatar_url),
             updated_at = :updated_at, last_login_at = :last_login_at WHERE id = :id',
        );
        $stmt->execute([
            'name' => $name,
            'avatar_url' => $avatarUrl,
            'updated_at' => $now,
            'last_login_at' => $now,
            'id' => $id,
        ]);

        return $this->findById($id) ?? throw new \RuntimeException('Failed to update Google user');
    }

    public static function uuid4(): string
    {
        $bytes = random_bytes(16);
        $bytes[6] = chr(ord($bytes[6]) & 0x0f | 0x40);
        $bytes[8] = chr(ord($bytes[8]) & 0x3f | 0x80);

        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($bytes), 4));
    }
}
