<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Course;
use App\Models\AuditLog;
use Illuminate\Http\Request;

use OpenApi\Attributes as OA;

class EnrollmentController extends Controller
{
    /**
     * ENROLL STUDENT
     */
    #[OA\Post(
        path: '/api/enrollments',
        summary: 'Enroll a student in a course',
        tags: ['Enrollment'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['course_id', 'student_id'],
                properties: [
                    new OA\Property(property: 'course_id', type: 'integer', example: 1),
                    new OA\Property(property: 'student_id', type: 'integer', example: 1),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Enrolled successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'enrollment_id', type: 'integer', example: 1),
                        new OA\Property(property: 'course_id', type: 'integer', example: 1),
                        new OA\Property(property: 'student_id', type: 'integer', example: 1),
                        new OA\Property(property: 'enrolled_at', type: 'string', format: 'date-time'),
                    ]
                )
            ),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Already Enrolled or Validation Error')
        ]
    )]
    public function store(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'course_id' => 'required|exists:courses,course_id',
            'student_id' => 'required|exists:users,id',
        ]);

        $course_id = $request->input('course_id');
        $student_id = $request->input('student_id');

        // Check: Is Admin or the course instructor?
        // (If student is self-enrolling, this logic should be backed by frontend role checks 
        // or a student_id == user->id check here. 
        // Admin can do anything, Instructor can enroll students to their own course.)
        $course = Course::findOrFail($course_id);
        
        // If user is a student (role_id=3), they can only enroll themselves
        if ($user->role_id == 3) {
            if ($student_id != $user->id) {
                return response()->json(['error' => 'You can only enroll yourself in a course.'], 403);
            }
        } 
        // If user is an instructor (role_id=2), they can only enroll students in their own courses
        elseif ($user->role_id == 2) {
            if ($course->instructor_id != $user->id) {
                return response()->json(['error' => 'You can only enroll students in your own courses.'], 403);
            }
        }
        // Admin (role_id=1) can do anything.

        // Duplicate enrollment check
        $existing = Enrollment::where('course_id', $course_id)
            ->where('student_id', $student_id)
            ->first();

        if ($existing) {
            return response()->json(['error' => 'This student is already enrolled in this course.'], 422);
        }

        $enrollment = Enrollment::create([
            'course_id' => $course_id,
            'student_id' => $student_id,
        ]);

        // Audit Log
        AuditLog::create([
            'actor_user_id' => $user->id,
            'action_type' => 'ENROLL_STUDENT',
            'entity_type' => 'Enrollments',
            'entity_id' => $enrollment->enrollment_id,
            'before_json' => null,
            'after_json' => json_encode(['course_id' => $course_id, 'student_id' => $student_id]),
            'ip_address' => $request->ip(),
        ]);

        return response()->json($enrollment, 201);
    }

    /**
     * STUDENT COURSES
     */
    #[OA\Get(
        path: '/api/students/{student_id}/courses',
        summary: 'List courses for a specific student',
        tags: ['Enrollment'],
        parameters: [
            new OA\Parameter(
                name: 'student_id',
                in: 'path',
                required: true,
                description: 'ID of the student',
                schema: new OA\Schema(type: 'integer')
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of enrollments with course details',
                content: new OA\JsonContent(
                    type: 'array',
                    items: new OA\Items(
                        properties: [
                            new OA\Property(property: 'enrollment_id', type: 'integer', example: 1),
                            new OA\Property(property: 'course', type: 'object', properties: [
                                new OA\Property(property: 'course_id', type: 'integer', example: 1),
                                new OA\Property(property: 'title', type: 'string', example: 'Introduction to Computer Science'),
                            ]),
                            new OA\Property(property: 'enrolled_at', type: 'string', format: 'date-time'),
                        ]
                    )
                )
            )
        ]
    )]
    public function studentCourses($student_id)
    {
        $enrollments = Enrollment::with('course')
            ->where('student_id', $student_id)
            ->get();

        return response()->json($enrollments);
    }

    /**
     * LIST STUDENTS IN COURSE
     */
    #[OA\Get(
        path: '/api/courses/{course_id}/students',
        summary: 'Get list of students enrolled in a course (Admin/Instructor)',
        tags: ['Enrollment'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'course_id',
                in: 'path',
                required: true,
                description: 'ID of the course',
                schema: new OA\Schema(type: 'integer')
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of enrolled students',
                content: new OA\JsonContent(type: 'array', items: new OA\Items(properties: [
                    new OA\Property(property: 'enrollment_id', type: 'integer'),
                    new OA\Property(property: 'student', type: 'object', properties: [
                        new OA\Property(property: 'id', type: 'integer'),
                        new OA\Property(property: 'name', type: 'string'),
                        new OA\Property(property: 'email', type: 'string'),
                    ])
                ]))
            ),
            new OA\Response(response: 403, description: 'Forbidden')
        ]
    )]
    public function getCourseStudents(Request $request, $course_id)
    {
        $user = $request->user();
        $course = Course::findOrFail($course_id);

        // Check: Is Admin or the course instructor?
        if ($user->role_id != 1 && $course->instructor_id != $user->id) {
            return response()->json(['error' => 'You do not have permission to view students of this course.'], 403);
        }

        $students = Enrollment::with('student:id,name,email')
            ->where('course_id', $course_id)
            ->get();

        return response()->json($students);
    }

    /**
     * UNENROLL STUDENT
     */
    #[OA\Delete(
        path: '/api/enrollments/{enrollment_id}',
        summary: 'Unenroll a student from a course (Admin only)',
        tags: ['Enrollment'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'enrollment_id',
                in: 'path',
                required: true,
                description: 'ID of the enrollment to delete',
                schema: new OA\Schema(type: 'integer')
            )
        ],
        responses: [
            new OA\Response(response: 200, description: 'Unenrolled successfully'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Enrollment not found')
        ]
    )]
    public function destroy(Request $request, $enrollment_id)
    {
        $user = $request->user();

        // Current restriction: Only Admin can unenroll.
        if ($user->role_id != 1) {
            return response()->json(['error' => 'Only administrators can delete course enrollments.'], 403);
        }

        $enrollment = Enrollment::findOrFail($enrollment_id);

        // Audit Log
        AuditLog::create([
            'actor_user_id' => $user->id,
            'action_type' => 'UNENROLL_STUDENT',
            'entity_type' => 'Enrollments',
            'entity_id' => $enrollment->enrollment_id,
            'before_json' => json_encode($enrollment),
            'after_json' => null,
            'ip_address' => $request->ip(),
        ]);

        $enrollment->delete();

        return response()->json(['message' => 'Unenrolled successfully']);
    }
}
