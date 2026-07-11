<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'subject',
        'body',
        'is_read',
        'sender_deleted_at',
        'receiver_deleted_at',
    ];

    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
            'sender_deleted_at' => 'datetime',
            'receiver_deleted_at' => 'datetime',
        ];
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    /**
     * Scope: Inbox messages for a given user (not deleted by receiver)
     */
    public function scopeInbox($query, $userId)
    {
        return $query->where('receiver_id', $userId)
                     ->whereNull('receiver_deleted_at');
    }

    /**
     * Scope: Sent messages for a given user (not deleted by sender)
     */
    public function scopeSent($query, $userId)
    {
        return $query->where('sender_id', $userId)
                     ->whereNull('sender_deleted_at');
    }
}
