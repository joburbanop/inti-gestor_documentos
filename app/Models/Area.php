<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Support\Str;

class Area extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'procesos_apoyo',
        'slug',
        'code',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'procesos_apoyo' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($area) {
            if (empty($area->slug)) {
                $area->slug = Str::slug($area->name);
            }
        });
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    public function documents(): HasManyThrough
    {
        return $this->hasManyThrough(Document::class, Category::class);
    }

    public function getTotalCategoriesAttribute(): int
    {
        return $this->categories()->count();
    }

    public function getTotalDocumentsAttribute(): int
    {
        return $this->documents()->count();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('name');
    }
} 