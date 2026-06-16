<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\AuditLog;
use Illuminate\Http\Request;

use OpenApi\Attributes as OA;

class CourseController extends Controller
{
    /**
     * ADD COURSE
     */
    #[OA\Post(
        path: '/api/courses',
        summary: 'Create a new course',
        tags: ['Courses'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['title', 'code', 'instructor_id'],
                properties: [
                    new OA\Property(property: 'title', type: 'string', example: 'Introduction to Computer Science'),
                    new OA\Property(property: 'code', type: 'string', example: 'CS101'),
                    new OA\Property(property: 'instructor_id', type: 'integer', example: 1)
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Course created successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'course_id', type: 'integer', example: 1),
                        new OA\Property(property: 'title', type: 'string', example: 'Introduction to Computer Science'),
                        new OA\Property(property: 'code', type: 'string', example: 'CS101'),
                        new OA\Property(property: 'instructor_id', type: 'integer', example: 1),
                        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
                        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
                    ]
                )
            ),
            new OA\Response(response: 422, description: 'Validation Error')
        ]
    )]
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'code' => 'required|string|unique:courses',
            'instructor_id' => 'required|exists:users,id',
        ]);

        $course = Course::create($request->all());

            // Audit log record
        AuditLog::create([
            'actor_user_id' => $request->instructor_id, // who did it
            'action_type' => 'CREATE_COURSE',
            'entity_type' => 'Courses',
            'entity_id' => $course->course_id,
            'before_json' => null,
            'after_json' => json_encode($course),
            'ip_address' => $request->ip(),
        ]);


        return response()->json($course, 201);
    }




    
    /**
     * LIST ALL COURSES
     */
    #[OA\Get(
        path: '/api/courses',
        summary: 'List all active courses',
        tags: ['Courses'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of courses',
                content: new OA\JsonContent(
                    type: 'array',
                    items: new OA\Items(
                        properties: [
                            new OA\Property(property: 'course_id', type: 'integer', example: 1),
                            new OA\Property(property: 'title', type: 'string', example: 'Introduction to Computer Science'),
                            new OA\Property(property: 'code', type: 'string', example: 'CS101'),
                            new OA\Property(property: 'is_active', type: 'boolean', example: true),
                        ]
                    )
                )
            )
        ]
    )]
    public function index()
    {
        $courses = Course::where('is_active', true)->get();
        return response()->json($courses);
    }
    /**
     * DELETE COURSE
     * (Only Admin or the course instructor can delete)
     */
    #[OA\Delete(
        path: '/api/courses/{course_id}',
        summary: 'Delete a course (Admin or Instructor only)',
        tags: ['Courses'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'course_id',
                in: 'path',
                required: true,
                description: 'ID of the course to delete',
                schema: new OA\Schema(type: 'integer')
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Course deleted successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'message', type: 'string', example: 'Course deleted successfully')
                    ]
                )
            ),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Course not found')
        ]
    )]
    public function destroy(Request $request, $course_id)
    {
        $user = $request->user();
        $course = Course::findOrFail($course_id);

        // Permission check: Admin (role_id=1) or course instructor
        if ($user->role_id != 1 && $course->instructor_id != $user->id) {
            return response()->json(['error' => 'You do not have permission to delete this course.'], 403);
        }

        // Audit log (Store before_json before deleting)
        AuditLog::create([
            'actor_user_id' => $user->id,
            'action_type' => 'DELETE_COURSE',
            'entity_type' => 'Courses',
            'entity_id' => $course->course_id,
            'before_json' => json_encode($course),
            'after_json' => null,
            'ip_address' => $request->ip(),
        ]);

        // Clear duplicate records (enrollments)
        $course->enrollments()->delete();

        $course->delete();

        return response()->json(['message' => 'Course deleted successfully']);
    }
}
