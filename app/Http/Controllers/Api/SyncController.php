<?php

declare(strict_types = 1)
;

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Actions\ProcessReviewAction;
use App\Models\Flashcard;
use App\Models\Subject;
use App\Models\ReviewLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SyncController extends Controller
{
    /**
     * Traz os dados modificados do servidor (Subject, Flashcard e ReviewLog) para o client offline-first.
     */
    public function pull(Request $request)
    {
        $user = $request->user();
        $lastPulledAt = $request->query('last_pulled_at');

        $querySubjects = Subject::where('user_id', $user->id)->withTrashed();
        $queryFlashcards = Flashcard::where('user_id', $user->id)->withTrashed();
        $queryReviewLogs = ReviewLog::where('user_id', $user->id)->withTrashed();

        if ($lastPulledAt) {
            $parsedDate = Carbon::parse($lastPulledAt);
            $querySubjects->where('updated_at', '>', $parsedDate);
            $queryFlashcards->where('updated_at', '>', $parsedDate);
            $queryReviewLogs->where('updated_at', '>', $parsedDate);
        }

        return response()->json([
            'subjects' => $querySubjects->get(),
            'flashcards' => $queryFlashcards->get(),
            'review_logs' => $queryReviewLogs->get(),
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Recebe dados locais modificados pelo usuário e sincroniza para a nuvem.
     */
    public function push(Request $request, ProcessReviewAction $processReviewAction)
    {
        $user = $request->user();
        $validated = $request->validate([
            'subjects' => 'nullable|array',
            'flashcards' => 'nullable|array',
            'review_logs' => 'nullable|array',
        ]);

        $subjects = $validated['subjects'] ?? [];
        $flashcards = $validated['flashcards'] ?? [];
        $reviewLogs = $validated['review_logs'] ?? [];

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

            // Processa ReviewLogs e executa o algoritmo SM-2 para cada um
            foreach ($reviewLogs as $logData) {
                if (!empty($logData['deleted_at'])) {
                    ReviewLog::where('id', $logData['id'])
                        ->where('user_id', $user->id)
                        ->delete(); // SoftDelete local
                }
                else {
                    $log = ReviewLog::updateOrCreate(
                    ['id' => $logData['id'], 'user_id' => $user->id],
                    [
                        'flashcard_id' => $logData['flashcard_id'],
                        'grade' => $logData['grade'],
                        'reviewed_at' => Carbon::parse($logData['reviewed_at']),
                        'created_at' => isset($logData['created_at']) ?Carbon::parse($logData['created_at']) : now(),
                        'updated_at' => isset($logData['updated_at']) ?Carbon::parse($logData['updated_at']) : now(),
                    ]
                    );

                    // Se foi recém-criado, roda o cálculo SRS (isso impede recalcular logs antigos que caíram num sync repetido)
                    if ($log->wasRecentlyCreated) {
                        try {
                            $flashcardToUpdate = Flashcard::where('id', $log->flashcard_id)
                                ->where('user_id', $user->id)
                                ->first();

                            if ($flashcardToUpdate) {
                                // A action ProcessReviewAction contém a regra de negócio SM-2 (Ease, Interval) e chama $flashcard->save()
                                $processReviewAction->execute($flashcardToUpdate, (int)$log->grade);
                            }
                        }
                        catch (\Exception $e) {
                            Log::error('Erro ao processar SRS no Sync: ' . $e->getMessage());
                        }
                    }
                }
            }

            DB::commit();

            return response()->json(['status' => 'success']);
        }
        catch (\Exception $e) {
            DB::rollBack();
            Log::error('Sync error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
