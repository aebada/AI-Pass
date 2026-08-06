<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Safe upgrade path when php-auth users table already exists in production.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('users')) {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'email_verified_at')) {
                $table->timestamp('email_verified_at')->nullable()->after('auth_provider');
            }
            if (! Schema::hasColumn('users', 'remember_token')) {
                $table->rememberToken();
            }
            if (! Schema::hasColumn('users', 'last_login_at')) {
                $table->timestamp('last_login_at')->nullable()->after('updated_at');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('users')) {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $columns = ['email_verified_at', 'remember_token', 'last_login_at'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('users', $column)) {
                    if ($column === 'remember_token') {
                        $table->dropRememberToken();
                    } else {
                        $table->dropColumn($column);
                    }
                }
            }
        });
    }
};
