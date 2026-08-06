<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Organization extends Model
{
    use HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'slug',
        'plan',
    ];

    public function members(): HasMany
    {
        return $this->hasMany(OrganizationMember::class);
    }

    public function groups(): HasMany
    {
        return $this->hasMany(WorkspaceGroup::class);
    }

    public function scimTokens(): HasMany
    {
        return $this->hasMany(ScimToken::class);
    }
}
