<?php

declare(strict_types=1);

namespace App\Services;

use App\Interfaces\SyncServiceInterface;
use App\Models\User;
use App\Models\Subject;
use App\Models\Flashcard;
use App\Models\ReviewLog;
use App\Actions\ProcessReviewAction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SyncService implements SyncServiceInterface
{
    protected ProcessReviewAction $processReviewAction;

    public function __construct(ProcessReviewAction $processReviewAction)
    {
        $this->processReviewAction = $processReviewAction;
    }

    public function pull(User $user, ?string $lastPulledAt): array
    {
        $querySubjects = Subject::where('user_id', $user->id)->withTrashed();
        $queryFlashcards = Flashcard::where('user_id', $user->id)->withTrashed();
        $queryReviewLogs = ReviewLog::where('user_id', $user->id)->withTrashed();

        if ($lastPulledAt) {
            $parsedDate = Carbon::parse($lastPulledAt);
            $querySubjects->where('updated_at', '>', $parsedDate);
            $queryFlashcards->where('updated_at', '>', $parsedDate);
            $queryReviewLogs->where('updated_at', '>', $parsedDate);
        }

        return [
            'subjects' => $querySubjects->get(),
            'flashcards' => $queryFlashcards->get(),
            'review_logs' => $queryReviewLogs->get(),
            'timestamp' => now()->toIso8601String(),
        ];
    }

    public function push(User $user, array $subjects, array $flashcards, array $reviewLogs): void
    {
        DB::beginTransaction();

        try {
            // Processa Subjects
            foreach ($subjects as $subjectData) {
                if (!empty($subjectData['deleted_at'])) {
                    Subject::where('id', $subjectData['id'])
                        ->where('user_id', $user->id)
                        ->delete(); // SoftDelete local
                } else {
                    Subject::updateOrCreate(
                        ['id' => $subjectData['id'], 'user_id' => $user->id],
                        [
                            'parent_id' => $subjectData['parent_id'] ?? null,
                            'name' => $subjectData['name'] ?? 'Sem Nome',
                            'color_code' => $subjectData['color_code'] ?? null,
                            'created_at' => isset($subjectData['created_at']) ? Carbon::parse($subjectData['created_at']) : now(),
                            'updated_at' => isset($subjectData['updated_at']) ? Carbon::parse($subjectData['updated_at']) : now(),
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
                } else {
                    Flashcard::updateOrCreate(
                        ['id' => $flashcardData['id'], 'user_id' => $user->id],
                        [
                            'subject_id' => $flashcardData['subject_id'],
                            'front' => $flashcardData['front'] ?? '',
                            'back' => $flashcardData['back'] ?? '',
                            'tags' => $flashcardData['tags'] ?? null,
                            'next_review_at' => isset($flashcardData['next_review_at']) ? Carbon::parse($flashcardData['next_review_at']) : null,
                            'ease_factor' => $flashcardData['ease_factor'] ?? 2.5,
                            'interval' => $flashcardData['interval'] ?? 0,
                            'repetitions' => $flashcardData['repetitions'] ?? 0,
                            'created_at' => isset($flashcardData['created_at']) ? Carbon::parse($flashcardData['created_at']) : now(),
                            'updated_at' => isset($flashcardData['updated_at']) ? Carbon::parse($flashcardData['updated_at']) : now(),
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
                } else {
                    $log = ReviewLog::updateOrCreate(
                        ['id' => $logData['id'], 'user_id' => $user->id],
                        [
                            'flashcard_id' => $logData['flashcard_id'],
                            'grade' => $logData['grade'],
                            'reviewed_at' => Carbon::parse($logData['reviewed_at']),
                            'created_at' => isset($logData['created_at']) ? Carbon::parse($logData['created_at']) : now(),
                            'updated_at' => isset($logData['updated_at']) ? Carbon::parse($logData['updated_at']) : now(),
                        ]
                    );

                    // Se foi recém-criado, roda o cálculo SRS
                    if ($log->wasRecentlyCreated) {
                        try {
                            $flashcardToUpdate = Flashcard::where('id', $log->flashcard_id)
                                ->where('user_id', $user->id)
                                ->first();

                            if ($flashcardToUpdate) {
                                $this->processReviewAction->execute($flashcardToUpdate, (int)$log->grade);
                            }
                        } catch (\Exception $e) {
                            Log::error('Erro ao processar SRS no Sync: ' . $e->getMessage());
                        }
                    }
                }
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Sync error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            throw $e;
        }
    }
}
