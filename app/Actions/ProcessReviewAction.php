<?php

declare(strict_types = 1)
;

namespace App\Actions;

use App\Models\Flashcard;

class ProcessReviewAction
{
    /**
     * Aplica o algoritmo SuperMemo-2 (SM-2) a um Flashcard.
     *
     * @param Flashcard $flashcard
     * @param int $quality (0 a 5)
     * @return Flashcard
     */
    public function execute(Flashcard $flashcard, int $quality): Flashcard
    {
        // Garante que $quality esteja entre 0 e 5
        $quality = max(0, min(5, $quality));

        $easeFactor = $flashcard->ease_factor ?? 2.5;
        $interval = $flashcard->interval ?? 0;
        $repetitions = $flashcard->repetitions ?? 0;

        if ($quality < 3) {
            $repetitions = 0;
            $interval = 1;
        }
        else {
            if ($repetitions === 0) {
                $interval = 1;
            }
            elseif ($repetitions === 1) {
                $interval = 6;
            }
            else {
                $interval = (int)round($interval * $easeFactor);
            }
            $repetitions++;
        }

        // Recalcula o Ease Factor
        $easeFactor = $easeFactor + (0.1 - (5 - $quality) * (0.08 + (5 - $quality) * 0.02));

        // Determina o limite inferior do Ease Factor como 1.3
        $easeFactor = max(1.3, $easeFactor);

        // Atualiza o Flashcard
        $flashcard->ease_factor = $easeFactor;
        $flashcard->interval = $interval;
        $flashcard->repetitions = $repetitions;
        $flashcard->next_review_at = now()->addDays($interval);

        $flashcard->save();

        return $flashcard;
    }
}
