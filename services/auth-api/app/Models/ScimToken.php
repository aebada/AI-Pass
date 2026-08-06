<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class ScimToken extends Model
{
    use HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'organization_id',
        'name',
        'token_hash',
        'token_hint',
        'enabled',
        'last_used_at',
    ];

    protected $hidden = [
        'token_hash',
    ];

    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
            'last_used_at' => 'datetime',
        ];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public static function hashToken(string $plain): string
    {
        return hash('sha256', $plain);
    }

    public static function issue(Organization $org, string $name = 'default'): array
    {
        $plain = 'scim_'.Str::random(48);
        $token = static::query()->create([
            'organization_id' => $org->id,
            'name' => $name,
            'token_hash' => static::hashToken($plain),
            'token_hint' => substr($plain, 0, 8).'…',
            'enabled' => true,
        ]);

        return ['model' => $token, 'plain' => $plain];
    }

    public function matches(string $plain): bool
    {
        return hash_equals($this->token_hash, static::hashToken($plain));
    }
}
