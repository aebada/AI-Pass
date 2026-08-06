<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MigrateFromLegacyAuth extends Command
{
    protected $signature = 'auth:migrate-from-legacy
                            {--connection=legacy : Database connection name for php-auth source}
                            {--dry-run : Report actions without writing}
                            {--force : Overwrite conflicting rows by email}';

    protected $description = 'Import users from legacy php-auth MySQL table without data loss';

    public function handle(): int
    {
        $connection = (string) $this->option('connection');
        $dryRun = (bool) $this->option('dry-run');
        $force = (bool) $this->option('force');

        if (! config("database.connections.{$connection}")) {
            $this->error("Database connection [{$connection}] is not configured.");

            return self::FAILURE;
        }

        if (! Schema::connection($connection)->hasTable('users')) {
            $this->error("Legacy connection [{$connection}] has no users table.");

            return self::FAILURE;
        }

        $legacyUsers = DB::connection($connection)->table('users')->orderBy('created_at')->get();
        $this->info('Found '.$legacyUsers->count().' legacy user(s).');

        $created = 0;
        $updated = 0;
        $skipped = 0;

        foreach ($legacyUsers as $legacy) {
            $email = strtolower(trim((string) $legacy->email));
            $existing = User::query()->where('email', $email)->first();

            if ($existing !== null && ! $force) {
                $this->line("  skip  {$email} (already exists)");
                $skipped++;

                continue;
            }

            $payload = [
                'id' => (string) ($legacy->id ?: User::newUuid()),
                'email' => $email,
                'password_hash' => $legacy->password_hash,
                'name' => $legacy->name,
                'google_id' => $legacy->google_id,
                'avatar_url' => $legacy->avatar_url,
                'auth_provider' => $legacy->auth_provider ?? 'email',
                'email_verified_at' => $legacy->google_id !== null ? ($legacy->email_verified_at ?? $legacy->created_at) : null,
                'last_login_at' => $legacy->last_login_at,
                'created_at' => $legacy->created_at,
                'updated_at' => $legacy->updated_at,
            ];

            if ($dryRun) {
                $this->line('  dry   '.($existing ? 'update' : 'create')." {$email}");
                $existing ? $updated++ : $created++;

                continue;
            }

            if ($existing !== null) {
                $existing->forceFill(collect($payload)->except(['id', 'created_at'])->all())->save();
                $this->line("  update {$email}");
                $updated++;
            } else {
                User::query()->create($payload);
                $this->line("  create {$email}");
                $created++;
            }
        }

        $this->newLine();
        $this->table(
            ['Metric', 'Count'],
            [
                ['Created', $created],
                ['Updated', $updated],
                ['Skipped', $skipped],
            ]
        );

        if ($dryRun) {
            $this->warn('Dry run only — no rows written.');
        }

        return self::SUCCESS;
    }
}
