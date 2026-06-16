<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    title: "University API",
    version: "1.0.0",
    description: "University Management System API Documentation"
)]
#[OA\Server(
    url: "http://127.0.0.1:8000",
    description: "Local API Server"
)]
#[OA\SecurityScheme(
    securityScheme: "bearerAuth",
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT"
)]
class SwaggerDocs
{
}
