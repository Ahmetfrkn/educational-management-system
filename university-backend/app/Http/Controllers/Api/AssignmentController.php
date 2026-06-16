<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AuditLog;
use Illuminate\Http\Request;









use OpenApi\Attributes as OA;

class AssignmentController extends Controller
{
    /**
     * CREATE ASSIGNMENT
     */
    #[OA\Post(
        path: '/api/assignments',
        summary: 'Create a new assignment',
        tags: ['Assignments'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['course_id', 'title', 'due_at', 'max_points'],
                properties: [
                    new OA\Property(property: 'course_id', type: 'integer', example: 1),
                    new OA\Property(property: 'title', type: 'string', example: 'Homework 1'),
                    new OA\Property(property: 'description', type: 'string', example: 'Solve questions 1-5 from the book.'),
                    new OA\Property(property: 'due_at', type: 'string', format: 'date-time', example: '2026-02-15T23:59:59Z'),
                    new OA\Property(property: 'max_points', type: 'integer', example: 100),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Assignment created successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'assignment_id', type: 'integer', example: 1),
                        new OA\Property(property: 'course_id', type: 'integer', example: 1),
                        new OA\Property(property: 'title', type: 'string', example: 'Homework 1'),
                        new OA\Property(property: 'max_points', type: 'integer', example: 100),
                        new OA\Property(property: 'due_at', type: 'string', format: 'date-time'),
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
            'course_id' => 'required|exists:courses,course_id',
            'title' => 'required|string',
            'description' => 'nullable|string',
            'due_at' => 'required|date',
            'max_points' => 'required|integer',
        ]);

        $assignment = Assignment::create($request->all());

        // Audit Log
        AuditLog::create([
            'actor_user_id' => $request->user()?->id ?? null,
            'action_type' => 'CREATE_ASSIGNMENT',
            'entity_type' => 'Assignments',
            'entity_id' => $assignment->assignment_id,
            'before_json' => null,
            'after_json' => json_encode($assignment),
            'ip_address' => $request->ip(),
        ]);

        return response()->json($assignment, 201);
    }

    /**
     * LIST ASSIGNMENTS FOR A COURSE
     */
    #[OA\Get(
        path: '/api/courses/{course_id}/assignments',
        summary: 'List assignments for a specific course',
        tags: ['Assignments'],
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
                description: 'List of assignments',
                content: new OA\JsonContent(
                    type: 'array',
                    items: new OA\Items(
                        properties: [
                            new OA\Property(property: 'assignment_id', type: 'integer', example: 1),
                            new OA\Property(property: 'title', type: 'string', example: 'Homework 1'),
                            new OA\Property(property: 'due_at', type: 'string', format: 'date-time'),
                        ]
                    )
                )
            )
        ]
    )]
    public function index($course_id)
    {
        $assignments = Assignment::where('course_id', $course_id)->get();
        return response()->json($assignments);
    }
}
