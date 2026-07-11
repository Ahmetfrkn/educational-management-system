<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * INBOX
     * List received messages for the authenticated user (paginated, searchable)
     */
    public function inbox(Request $request)
    {
        $user = $request->user();

        $query = Message::inbox($user->id)
            ->with('sender:id,name,email')
            ->orderBy('created_at', 'desc');

        // Search filter
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                  ->orWhere('body', 'like', "%{$search}%")
                  ->orWhereHas('sender', function ($sq) use ($search) {
                      $sq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $messages = $query->paginate(15);

        return response()->json($messages);
    }

    /**
     * SENT
     * List sent messages for the authenticated user (paginated, searchable)
     */
    public function sent(Request $request)
    {
        $user = $request->user();

        $query = Message::sent($user->id)
            ->with('receiver:id,name,email')
            ->orderBy('created_at', 'desc');

        // Search filter
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                  ->orWhere('body', 'like', "%{$search}%")
                  ->orWhereHas('receiver', function ($rq) use ($search) {
                      $rq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $messages = $query->paginate(15);

        return response()->json($messages);
    }

    /**
     * SHOW
     * View a single message (marks as read if the auth user is the receiver)
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();

        $message = Message::with(['sender:id,name,email', 'receiver:id,name,email'])
            ->findOrFail($id);

        // Authorization: only sender or receiver can view
        if ($message->sender_id !== $user->id && $message->receiver_id !== $user->id) {
            return response()->json(['error' => 'You do not have permission to view this message.'], 403);
        }

        // Check if the message was deleted for this user
        if ($message->sender_id === $user->id && $message->sender_deleted_at !== null) {
            return response()->json(['error' => 'Message not found.'], 404);
        }
        if ($message->receiver_id === $user->id && $message->receiver_deleted_at !== null) {
            return response()->json(['error' => 'Message not found.'], 404);
        }

        // Mark as read if the auth user is the receiver and it's unread
        if ($message->receiver_id === $user->id && !$message->is_read) {
            $message->update(['is_read' => true]);
        }

        return response()->json($message);
    }

    /**
     * STORE
     * Send a new message with role-based recipient validation
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'subject' => 'required|string|max:255',
            'body' => 'required|string|max:5000',
        ]);

        $receiver = User::findOrFail($request->receiver_id);

        // Prevent messaging yourself
        if ($receiver->id === $user->id) {
            return response()->json(['error' => 'You cannot send a message to yourself.'], 422);
        }

        // Role-based messaging rules
        // Student (3) can only message Instructors (2)
        if ($user->role_id == 3 && $receiver->role_id != 2) {
            return response()->json(['error' => 'Students can only send messages to instructors.'], 403);
        }

        // Instructor (2) can only message Students (3)
        if ($user->role_id == 2 && $receiver->role_id != 3) {
            return response()->json(['error' => 'Instructors can only send messages to students.'], 403);
        }

        // Admin (1) can message Students (3) and Instructors (2)
        if ($user->role_id == 1 && $receiver->role_id == 1) {
            return response()->json(['error' => 'Admins cannot send messages to other admins.'], 403);
        }

        $message = Message::create([
            'sender_id' => $user->id,
            'receiver_id' => $request->receiver_id,
            'subject' => $request->subject,
            'body' => $request->body,
        ]);

        $message->load(['sender:id,name,email', 'receiver:id,name,email']);

        return response()->json($message, 201);
    }

    /**
     * DESTROY
     * Soft-delete a message for the authenticated user only
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        $message = Message::findOrFail($id);

        // Authorization: only sender or receiver can delete
        if ($message->sender_id !== $user->id && $message->receiver_id !== $user->id) {
            return response()->json(['error' => 'You do not have permission to delete this message.'], 403);
        }

        // Soft-delete for the appropriate side
        if ($message->receiver_id === $user->id) {
            $message->update(['receiver_deleted_at' => now()]);
        }

        if ($message->sender_id === $user->id) {
            $message->update(['sender_deleted_at' => now()]);
        }

        return response()->json(['message' => 'Message deleted successfully.']);
    }

    /**
     * UNREAD COUNT
     * Returns the number of unread inbox messages for the authenticated user
     */
    public function unreadCount(Request $request)
    {
        $user = $request->user();

        $count = Message::inbox($user->id)
            ->where('is_read', false)
            ->count();

        return response()->json(['unread_count' => $count]);
    }

    /**
     * RECIPIENTS
     * Returns eligible recipients based on the authenticated user's role
     */
    public function recipients(Request $request)
    {
        $user = $request->user();
        $search = $request->query('search');

        // Student (3) → can message Instructors (2)
        // Instructor (2) → can message Students (3)
        // Admin (1) → can message Instructors (2) and Students (3)
        if ($user->role_id == 3) {
            $targetRoleIds = [2]; // Instructors
        } elseif ($user->role_id == 2) {
            $targetRoleIds = [3]; // Students
        } elseif ($user->role_id == 1) {
            $targetRoleIds = [2, 3]; // Instructors + Students
        } else {
            return response()->json([]);
        }

        $query = User::whereIn('role_id', $targetRoleIds)
            ->select('id', 'name', 'email', 'role_id');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $recipients = $query->orderBy('name')->limit(50)->get();

        return response()->json($recipients);
    }
}
