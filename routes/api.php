<?php

use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SyncController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Offline Sync Endpoints (Limitados a 60 puxadas/empurradas por minuto por Usuário)
    Route::get('/sync/pull', [SyncController::class, 'pull']);
    Route::post('/sync/push', [SyncController::class, 'push']);

    // Review Endpoint (SM-2 SRS)
    Route::post('/flashcards/{flashcard}/review', [ReviewController::class, 'store']);
});
