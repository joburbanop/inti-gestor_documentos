<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'permissions',
        'is_active'
    ];

    protected $casts = [
        'permissions' => 'array',
        'is_active' => 'boolean',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function hasPermission($permission): bool
    {
        return in_array($permission, $this->permissions ?? []);
    }

    public function hasAnyPermission($permissions): bool
    {
        if (!is_array($permissions)) {
            $permissions = [$permissions];
        }

        return !empty(array_intersect($permissions, $this->permissions ?? []));
    }

    public function hasAllPermissions($permissions): bool
    {
        if (!is_array($permissions)) {
            $permissions = [$permissions];
        }

        return empty(array_diff($permissions, $this->permissions ?? []));
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
} 