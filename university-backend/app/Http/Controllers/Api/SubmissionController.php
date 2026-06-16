<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use App\Models\AuditLog;
use Illuminate\Http\Request;

use OpenApi\Attributes as OA;

class SubmissionController extends Controller
{
    /**
     * SUBMIT ASSIGNMENT
     */
    #[OA\Post(
        path: '/api/submissions',
        summary: 'Submit an assignment',
        tags: ['Submissions'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['assignment_id', 'student_id', 'content'],
                properties: [
                    new OA\Property(property: 'assignment_id', type: 'integer', example: 1),
                    new OA\Property(property: 'student_id', type: 'integer', example: 1),
                    new OA\Property(property: 'content', type: 'string', example: 'https://github.com/my-solution'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Submission created successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'submission_id', type: 'integer', example: 1),
                        new OA\Property(property: 'assignment_id', type: 'integer', example: 1),
                        new OA\Property(property: 'student_id', type: 'integer', example: 1),
                        new OA\Property(property: 'submitted_at', type: 'string', format: 'date-time'),
                    ]
                )
            ),
            new OA\Response(response: 422, description: 'Validation Error')
        ]
    )]
    public function store(Request $request)
    {
        $request->validate([
            'assignment_id' => 'required|exists:assignments,assignment_id',
            'student_id' => 'required|exists:users,id',
            'content' => 'required|string',
        ]);

        $submission = Submission::create([
            'assignment_id' => $request->assignment_id,
            'student_id' => $request->student_id,
            'content' => $request->content,
        ]);

        // Audit Log
        AuditLog::create([
            'actor_user_id' => $request->student_id,
            'action_type' => 'SUBMIT_ASSIGNMENT',
            'entity_type' => 'Submissions',
            'entity_id' => $submission->submission_id,
            'before_json' => null,
            'after_json' => json_encode($submission),
            'ip_address' => $request->ip(),
        ]);

        return response()->json($submission, 201);
    }

    /**
     * GRADE SUBMISSION
     */
    #[OA\Put(
        path: '/api/submissions/{submission_id}/grade',
        summary: 'Grade a submission',
        tags: ['Submissions'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'submission_id',
                in: 'path',
                required: true,
                description: 'ID of the submission',
                schema: new OA\Schema(type: 'integer')
            )
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['score', 'graded_by'],
                properties: [
                    new OA\Property(property: 'score', type: 'integer', example: 85),
                    new OA\Property(property: 'graded_by', type: 'integer', example: 2),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Graded successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'submission_id', type: 'integer', example: 1),
                        new OA\Property(property: 'score', type: 'integer', example: 85),
                        new OA\Property(property: 'graded_at', type: 'string', format: 'date-time'),
                    ]
                )
            ),
            new OA\Response(response: 422, description: 'Validation Error')
        ]
    )]
    public function grade(Request $request, $submission_id)
    {
        $request->validate([
            'score' => 'required|integer',
            'graded_by' => 'required|exists:users,id'
        ]);

        $submission = Submission::findOrFail($submission_id);
        $before = json_encode($submission);

        $submission->update([
            'score' => $request->score,
            'graded_by' => $request->graded_by
        ]);

        // Audit Log
        AuditLog::create([
            'actor_user_id' => $request->graded_by,
            'action_type' => 'GRADE_SUBMISSION',
            'entity_type' => 'Submissions',
            'entity_id' => $submission->submission_id,
            'before_json' => $before,
            'after_json' => json_encode($submission),
            'ip_address' => $request->ip(),
        ]);

        return response()->json($submission);
    }
}
