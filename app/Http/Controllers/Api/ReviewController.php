<?php

declare(strict_types = 1)
;

namespace App\Http\Controllers\Api;

use App\Actions\ProcessReviewAction;
use App\Http\Controllers\Controller;
use App\Models\Flashcard;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Aplica uma nova revisão (estudo) a um Flashcard específico.
     */
    public function store(Request $request, Flashcard $flashcard, ProcessReviewAction $processReviewAction)
    {
        // Valida propriedade
        if ($flashcard->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'quality' => 'required|integer|min:0|max:5',
        ]);

        $flashcard = $processReviewAction->execute($flashcard, $validated['quality']);

        // Como o padrão exigido é responder estritamente JSON usando API Resources ou retornos customizados limpos,
        // retornamos o flashcard processado para sincronização local.
        return response()->json([
            'data' => $flashcard
        ]);
    }
}
