<?php

declare(strict_types = 1)
;

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Flashcard;
use App\Models\Subject;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SyncController extends Controller
{
    /**
     * Traz os dados modificados do servidor (Subject e Flashcard) para o client offline-first.
     */
    public function pull(Request $request)
    {
        $user = $request->user();
        $lastPulledAt = $request->query('last_pulled_at');

        $querySubjects = Subject::where('user_id', $user->id)->withTrashed();
        $queryFlashcards = Flashcard::where('user_id', $user->id)->withTrashed();

        if ($lastPulledAt) {
            $parsedDate = Carbon::parse($lastPulledAt);
            $querySubjects->where('updated_at', '>', $parsedDate);
            $queryFlashcards->where('updated_at', '>', $parsedDate);
        }

        return response()->json([
            'subjects' => $querySubjects->get(),
            'flashcards' => $queryFlashcards->get(),
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Recebe dados locais modificados pelo usuário e sincroniza para a nuvem.
     */
    public function push(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'subjects' => 'nullable|array',
            'flashcards' => 'nullable|array',
        ]);

        $subjects = $validated['subjects'] ?? [];
        $flashcards = $validated['flashcards'] ?? [];

        DB::beginTransaction();

        try {
            // Processa Subjects
            foreach ($subjects as $subjectData) {
                if (!empty($subjectData['deleted_at'])) {
                    Subject::where('id', $subjectData['id'])
                        ->where('user_id', $user->id)
                        ->delete(); // SoftDelete local
                }
                else {
                    Subject::updateOrCreate(
                    ['id' => $subjectData['id'], 'user_id' => $user->id],
                    [
                        'name' => $subjectData['name'] ?? 'Sem Nome',
                        'color_code' => $subjectData['color_code'] ?? null,
                        'created_at' => isset($subjectData['created_at']) ?Carbon::parse($subjectData['created_at']) : now(),
                        'updated_at' => isset($subjectData['updated_at']) ?Carbon::parse($subjectData['updated_at']) : now(),
                    ]
                    );
                }
            }

            // Processa Flashcards
            foreach ($flashcards as $flashcardData) {
                if (!empty($flashcardData['deleted_at'])) {
                    Flashcard::where('id', $flashcardData['id'])
                        ->where('user_id', $user->id)
                        ->delete(); // SoftDelete local
                }
                else {
                    Flashcard::updateOrCreate(
                    ['id' => $flashcardData['id'], 'user_id' => $user->id],
                    [
                        'subject_id' => $flashcardData['subject_id'],
                        'front' => $flashcardData['front'] ?? '',
                        'back' => $flashcardData['back'] ?? '',
                        'next_review_at' => isset($flashcardData['next_review_at']) ?Carbon::parse($flashcardData['next_review_at']) : null,
                        'ease_factor' => $flashcardData['ease_factor'] ?? 2.5,
                        'interval' => $flashcardData['interval'] ?? 0,
                        'repetitions' => $flashcardData['repetitions'] ?? 0,
                        'created_at' => isset($flashcardData['created_at']) ?Carbon::parse($flashcardData['created_at']) : now(),
                        'updated_at' => isset($flashcardData['updated_at']) ?Carbon::parse($flashcardData['updated_at']) : now(),
                    ]
                    );
                }
            }

            DB::commit();

            return response()->json(['status' => 'success']);
        }
        catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
