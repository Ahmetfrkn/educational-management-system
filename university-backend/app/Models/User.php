<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // 👈 1. BU SATIRI EKLE

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable; // 👈 2. BURAYA HasApiTokens EKLE

    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function role()
    {

        return $this->belongsTo(Role::class, 'role_id', 'role_id');
    
    }

}