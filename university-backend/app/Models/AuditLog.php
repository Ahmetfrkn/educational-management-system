<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    protected $primaryKey = 'audit_id';

    protected $fillable = [
        'actor_user_id',
        'action_type',
        'entity_type',
        'entity_id',
        'before_json',
        'after_json',
        'ip_address',
    ];

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }
}
