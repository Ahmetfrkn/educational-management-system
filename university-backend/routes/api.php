<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\AssignmentController;
use App\Http\Controllers\Api\SubmissionController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\StatsController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Routes defined here are automatically assigned to the "api" middleware group
| and are accessed by appending "/api" to the URL.
|*/

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

// --- 1. Public Routes (No Login Required) ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// --- 2. Protected Routes (Bearer Token/Sanctum Required) ---
Route::middleware('auth:sanctum')->group(function () {
    
    // Courses
    Route::get('/courses', [CourseController::class, 'index']);
    Route::post('/courses', [CourseController::class, 'store']);
    Route::delete('/courses/{course_id}', [CourseController::class, 'destroy']);

    // Assignments
    Route::post('/assignments', [AssignmentController::class, 'store']);
    Route::get('/courses/{course_id}/assignments', [AssignmentController::class, 'index']);

    // Enrollments
    Route::post('/enroll', [EnrollmentController::class, 'store']);
    Route::get('/student/{student_id}/courses', [EnrollmentController::class, 'studentCourses']);
    Route::get('/courses/{course_id}/students', [EnrollmentController::class, 'getCourseStudents']);
    Route::delete('/enrollments/{enrollment_id}', [EnrollmentController::class, 'destroy']);

    // Submissions
    Route::post('/submissions', [SubmissionController::class, 'store']);
    Route::post('/submissions/{submission_id}/grade', [SubmissionController::class, 'grade']);

    // Audit Logs
    Route::get('/logs', [AuditLogController::class, 'index']);

    // Users/Students
    Route::get('/students', [UserController::class, 'students']);

    // Stats
    Route::get('/stats', [StatsController::class, 'index']);
});
