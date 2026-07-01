<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Renames legacy `password` column to `password_hash` when present.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('users')) {
            return;
        }

        if (Schema::hasColumn('users', 'password') && ! Schema::hasColumn('users', 'password_hash')) {
            $driver = Schema::getConnection()->getDriverName();

            if ($driver === 'sqlite') {
                DB::statement('ALTER TABLE users RENAME COLUMN password TO password_hash');
            } else {
                Schema::table('users', function (Blueprint $table) {
                    $table->renameColumn('password', 'password_hash');
                });
            }
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('users')) {
            return;
        }

        if (Schema::hasColumn('users', 'password_hash') && ! Schema::hasColumn('users', 'password')) {
            $driver = Schema::getConnection()->getDriverName();

            if ($driver === 'sqlite') {
                DB::statement('ALTER TABLE users RENAME COLUMN password_hash TO password');
            } else {
                Schema::table('users', function (Blueprint $table) {
                    $table->renameColumn('password_hash', 'password');
                });
            }
        }
    }
};
