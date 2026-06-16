<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class AuditLogController extends Controller
{
    /**
     * ADMIN ONLY - LOG LIST
     */
    #[OA\Get(
        path: '/api/logs',
        summary: 'List audit logs (Admin only)',
        tags: ['System'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of system logs',
                content: new OA\JsonContent(
                    type: 'array',
                    items: new OA\Items(
                        properties: [
                            new OA\Property(property: 'id', type: 'integer', example: 1),
                            new OA\Property(property: 'action_type', type: 'string', example: 'CREATE_COURSE'),
                            new OA\Property(property: 'entity_type', type: 'string', example: 'Courses'),
                            new OA\Property(property: 'entity_id', type: 'integer', example: 10),
                            new OA\Property(property: 'actor', type: 'object', properties: [
                                new OA\Property(property: 'id', type: 'integer', example: 5),
                                new OA\Property(property: 'name', type: 'string', example: 'Admin User'),
                            ]),
                            new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
                        ]
                    )
                )
            ),
            new OA\Response(response: 403, description: 'Forbidden - Admins only')
        ]
    )]
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized: Token missing.'], 403);
        }

        if ($user->role_id != 1) {
            return response()->json(['error' => 'Forbidden: Admins only. Your role is: ' . $user->role_id], 403);
        }

        $logs = AuditLog::with('actor')->orderBy('created_at', 'desc')->get();
        return response()->json($logs);
    }
}