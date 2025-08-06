<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'filename',
        'original_filename',
        'file_path',
        'file_type',
        'file_size',
        'category_id',
        'uploaded_by',
        'slug',
        'download_count'
    ];

    protected $casts = [
        'file_size' => 'integer',
        'download_count' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($document) {
            if (empty($document->slug)) {
                $document->slug = Str::slug($document->title);
            }
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function getFileSizeFormattedAttribute(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function getFileIconAttribute(): string
    {
        $extension = pathinfo($this->original_filename, PATHINFO_EXTENSION);
        $iconMap = [
            'pdf' => 'fa-file-pdf',
            'doc' => 'fa-file-word',
            'docx' => 'fa-file-word',
            'xls' => 'fa-file-excel',
            'xlsx' => 'fa-file-excel',
            'ppt' => 'fa-file-powerpoint',
            'pptx' => 'fa-file-powerpoint',
            'txt' => 'fa-file-alt',
            'jpg' => 'fa-file-image',
            'jpeg' => 'fa-file-image',
            'png' => 'fa-file-image',
            'gif' => 'fa-file-image',
            'zip' => 'fa-file-archive',
            'rar' => 'fa-file-archive'
        ];

        return $iconMap[strtolower($extension)] ?? 'fa-file';
    }

    public function incrementDownloadCount(): void
    {
        $this->increment('download_count');
    }



    public function scopeInCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%")
              ->orWhere('original_filename', 'like', "%{$search}%");
        });
    }

    public function getRouteKeyName()
    {
        return 'id';
    }
} 