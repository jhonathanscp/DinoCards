<?php

declare(strict_types=1);

namespace App\Services;

use App\Interfaces\ReviewServiceInterface;
use App\Models\Flashcard;
use App\Actions\ProcessReviewAction;

class ReviewService implements ReviewServiceInterface
{
    protected ProcessReviewAction $processReviewAction;

    public function __construct(ProcessReviewAction $processReviewAction)
    {
        $this->processReviewAction = $processReviewAction;
    }

    public function processReview(Flashcard $flashcard, int $quality): Flashcard
    {
        return $this->processReviewAction->execute($flashcard, $quality);
    }
}
