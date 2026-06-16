<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Illuminate\Foundation\Http\Middleware\HandleCors;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
   ->withMiddleware(function ($middleware) {
    $middleware->statefulApi();
    $middleware->validateCsrfTokens(except: [
        'api/*',      // If routes start with /api/login etc.
        'login',      // If directly /login
        'register',   // If directly /register
        'sanctum/csrf-cookie'
    ]);

    // Sanctum requirement for stateful API
    $middleware->statefulApi(); 
    
})
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
