<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('plan')->default('free');
            $table->timestamps();
        });

        Schema::create('organization_members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->json('roles')->nullable();
            $table->boolean('legacy_builder')->default(false);
            $table->string('status')->default('active'); // active|invited|deactivated
            $table->timestamp('invited_at')->nullable();
            $table->timestamp('last_active_at')->nullable();
            $table->timestamps();

            $table->unique(['organization_id', 'user_id']);
        });

        Schema::create('workspace_groups', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->string('source')->default('manual'); // manual|scim
            $table->string('external_id')->nullable();
            $table->json('capabilities')->nullable();
            $table->timestamps();

            $table->unique(['organization_id', 'slug']);
            $table->index(['organization_id', 'external_id']);
        });

        Schema::create('workspace_group_members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('group_id')->constrained('workspace_groups')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['group_id', 'user_id']);
        });

        Schema::create('scim_tokens', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->string('name')->default('default');
            $table->string('token_hash');
            $table->string('token_hint')->nullable();
            $table->boolean('enabled')->default(true);
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scim_tokens');
        Schema::dropIfExists('workspace_group_members');
        Schema::dropIfExists('workspace_groups');
        Schema::dropIfExists('organization_members');
        Schema::dropIfExists('organizations');
    }
};
