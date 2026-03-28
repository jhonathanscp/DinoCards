<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Review\StoreReviewRequest;
use App\Interfaces\ReviewServiceInterface;
use App\Models\Flashcard;

class ReviewController extends Controller
{
    protected ReviewServiceInterface $reviewService;

    public function __construct(ReviewServiceInterface $reviewService)
    {
        $this->reviewService = $reviewService;
    }

    /**
     * Aplica uma nova revisão (estudo) a um Flashcard específico.
     */
    public function store(StoreReviewRequest $request, Flashcard $flashcard)
    {
        $validated = $request->validated();

        $flashcard = $this->reviewService->processReview($flashcard, (int) $validated['quality']);

        // Como o padrão exigido é responder estritamente JSON usando API Resources ou retornos customizados limpos,
        // retornamos o flashcard processado para sincronização local.
        return response()->json([
            'data' => $flashcard
        ]);
    }
}
