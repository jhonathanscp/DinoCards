<?php

declare(strict_types=1);

namespace App\Interfaces;

use App\Models\Flashcard;

interface ReviewServiceInterface
{
    public function processReview(Flashcard $flashcard, int $quality): Flashcard;
}
