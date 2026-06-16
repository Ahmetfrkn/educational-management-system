<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * List all students (for Admin/Instructor)
     */
    public function students(Request $request)
    {
        $search = $request->query('search');

        $query = User::where('role_id', 3); // Role 3 is Student

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $students = $query->limit(10)->get(); // Limit to 10 for performance

        return response()->json($students);
    }
}
