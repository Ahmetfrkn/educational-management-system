<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Assignment;
use App\Models\AuditLog;
use App\Models\Submission;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $role = $user->role_id;

        if ($role == 1) { // Admin
            return response()->json([
                'total_students' => User::where('role_id', 3)->count(),
                'active_courses' => Course::count(),
                'total_logs' => AuditLog::count(),
                'system_uptime' => '99.9%',
                'security_status' => 'Secure'
            ]);
        } elseif ($role == 2) { // Instructor
            return response()->json([
                'my_students_count' => Enrollment::whereIn('course_id', function($query) use ($user) {
                    $query->select('course_id')->from('courses')->where('instructor_id', $user->id);
                })->distinct('student_id')->count(),
                'my_courses_count' => Course::where('instructor_id', $user->id)->count(),
                'pending_assignments' => Submission::whereIn('assignment_id', function($query) use ($user) {
                    $query->select('assignment_id')->from('assignments')->whereIn('course_id', function($q) use ($user) {
                        $q->select('course_id')->from('courses')->where('instructor_id', $user->id);
                    });
                })->whereNull('grade')->count(),
                'success_rate' => '88%'
            ]);
        } elseif ($role == 3) { // Student
            return response()->json([
                'enrolled_courses_count' => Enrollment::where('student_id', $user->id)->count(),
                'total_assignments' => Assignment::whereIn('course_id', function($query) use ($user) {
                    $query->select('course_id')->from('enrollments')->where('student_id', $user->id);
                })->count(),
                'completed_tasks' => Submission::where('student_id', $user->id)->count()
            ]);
        }

        return response()->json(['error' => 'Invalid role'], 400);
    }
}
