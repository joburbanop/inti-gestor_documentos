<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
    ];

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    

    public function hasRole($role): bool
    {
        return $this->role && $this->role->name === $role;
    }

    public function hasPermission($permission): bool
    {
        return $this->role && $this->role->hasPermission($permission);
    }

    public function hasAnyPermission($permissions): bool
    {
        return $this->role && $this->role->hasAnyPermission($permissions);
    }

    public function hasAllPermissions($permissions): bool
    {
        return $this->role && $this->role->hasAllPermissions($permissions);
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function isUser(): bool
    {
        return $this->hasRole('user');
    }

    /**
     * Accessor para is_admin
     */
    public function getIsAdminAttribute(): bool
    {
        return $this->isAdmin();
    }
}
