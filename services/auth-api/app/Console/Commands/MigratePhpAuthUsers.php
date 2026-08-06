<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MigratePhpAuthUsers extends Command
{
    protected $signature = 'php-auth:migrate-users
                            {--dry-run : Report changes without writing}';

    protected $description = 'Upgrade existing php-auth users table for Laravel (keeps password_hash, UUIDs, google_id)';

    public function handle(): int
    {
        if (! Schema::hasTable('users')) {
            $this->error('users table does not exist. Run php artisan migrate first.');

            return self::FAILURE;
        }

        $dryRun = (bool) $this->option('dry-run');
        $changes = 0;

        if (Schema::hasColumn('users', 'password') && ! Schema::hasColumn('users', 'password_hash')) {
            $this->info('Renaming password → password_hash');
            if (! $dryRun) {
                $driver = Schema::getConnection()->getDriverName();
                if ($driver === 'sqlite') {
                    DB::statement('ALTER TABLE users RENAME COLUMN password TO password_hash');
                } else {
                    DB::statement('ALTER TABLE users CHANGE password password_hash VARCHAR(255) NULL');
                }
            }
            $changes++;
        }

        $columns = [
            'password_hash' => fn ($table) => $table->string('password_hash')->nullable(),
            'google_id' => fn ($table) => $table->string('google_id')->nullable()->unique(),
            'avatar_url' => fn ($table) => $table->string('avatar_url', 512)->nullable(),
            'auth_provider' => fn ($table) => $table->enum('auth_provider', ['email', 'google', 'linked'])->default('email'),
            'email_verified_at' => fn ($table) => $table->timestamp('email_verified_at')->nullable(),
            'last_login_at' => fn ($table) => $table->timestamp('last_login_at')->nullable(),
            'remember_token' => fn ($table) => $table->rememberToken(),
        ];

        foreach ($columns as $column => $definition) {
            if (! Schema::hasColumn('users', $column)) {
                $this->info("Adding missing column: {$column}");
                if (! $dryRun) {
                    Schema::table('users', $definition);
                }
                $changes++;
            }
        }

        $total = DB::table('users')->count();
        $this->info("Users in database: {$total}");
        $this->info($dryRun
            ? "Dry run complete ({$changes} schema actions would run)."
            : "Migration complete ({$changes} schema actions applied).");

        return self::SUCCESS;
    }
}
