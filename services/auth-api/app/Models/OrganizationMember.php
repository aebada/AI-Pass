<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrganizationMember extends Model
{
    use HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'organization_id',
        'user_id',
        'roles',
        'legacy_builder',
        'status',
        'invited_at',
        'last_active_at',
    ];

    protected function casts(): array
    {
        return [
            'roles' => 'array',
            'legacy_builder' => 'boolean',
            'invited_at' => 'datetime',
            'last_active_at' => 'datetime',
        ];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
