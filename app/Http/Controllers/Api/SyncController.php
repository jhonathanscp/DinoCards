<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sync\PushSyncRequest;
use App\Interfaces\SyncServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SyncController extends Controller
{
    protected SyncServiceInterface $syncService;

    public function __construct(SyncServiceInterface $syncService)
    {
        $this->syncService = $syncService;
    }

    /**
     * Traz os dados modificados do servidor (Subject, Flashcard e ReviewLog) para o client offline-first.
     */
    public function pull(Request $request)
    {
        $user = $request->user();
        $lastPulledAt = $request->query('last_pulled_at');

        $data = $this->syncService->pull($user, $lastPulledAt);

        return response()->json($data);
    }

    /**
     * Recebe dados locais modificados pelo usuário e sincroniza para a nuvem.
     */
    public function push(PushSyncRequest $request)
    {
        $user = $request->user();
        $validated = $request->validated();

        $subjects = $validated['subjects'] ?? [];
        $flashcards = $validated['flashcards'] ?? [];
        $reviewLogs = $validated['review_logs'] ?? [];

        try {
            $this->syncService->push($user, $subjects, $flashcards, $reviewLogs);

            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            Log::error('Sync error in Controller: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred during sync.'
            ], 500);
        }
    }
}
