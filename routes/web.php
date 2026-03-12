<?php

declare(strict_types = 1)
;

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

/* |-------------------------------------------------------------------------- | Auth Routes (Sanctum SPA — cookie-based) |-------------------------------------------------------------------------- | These routes MUST be defined before the SPA catch-all so they are not | intercepted by the React frontend fallback. */

Route::post('/login', [AuthController::class , 'login']);
Route::post('/register', [AuthController::class , 'register']);
Route::post('/logout', [AuthController::class , 'logout'])->middleware('auth:sanctum');

/* |-------------------------------------------------------------------------- | SPA Catch-All (React Router) |-------------------------------------------------------------------------- | Any URL that doesn't match a previous route will be served by the | Blade view that loads Vite + React. */

Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api|sanctum).*$');
