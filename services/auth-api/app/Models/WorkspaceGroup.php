<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class WorkspaceGroup extends Model
{
    use HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'organization_id',
        'name',
        'slug',
        'description',
        'source',
        'external_id',
        'capabilities',
    ];

    protected function casts(): array
    {
        return [
            'capabilities' => 'array',
        ];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'workspace_group_members', 'group_id', 'user_id')
            ->withTimestamps();
    }
}
