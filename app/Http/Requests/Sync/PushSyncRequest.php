<?php

namespace App\Http\Requests\Sync;

use Illuminate\Foundation\Http\FormRequest;

class PushSyncRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Arrays principais (Podem vir vazios no Sync, mas se vierem formatados a chave deve ser ARRAY)
            'subjects' => ['nullable', 'array'],
            'flashcards' => ['nullable', 'array'],
            'review_logs' => ['nullable', 'array'],

            // ─────────────────────────────────────────────────────────────────
            // Validação Profunda (Prevenção de DoS e Array Malformados - 500)
            // ─────────────────────────────────────────────────────────────────

            // Subjects (Pai/Arvores de Baralhos)
            'subjects.*.id' => ['required', 'uuid'],
            'subjects.*.parent_id' => ['nullable', 'uuid', 'different:subjects.*.id'], // Previne Auto-parent Loop
            'subjects.*.name' => ['required', 'string', 'max:255'],
            'subjects.*.color_code' => ['nullable', 'string', 'max:50'],
            'subjects.*.deleted_at' => ['nullable', 'string', 'date_format:Y-m-d\TH:i:s.u\Z', 'date_format:Y-m-d\TH:i:s\Z'], // Aceita Date nulo ou String ISO8601

            // Flashcards (Cartas)
            'flashcards.*.id' => ['required', 'uuid'],
            'flashcards.*.subject_id' => ['required', 'uuid'],
            'flashcards.*.front' => ['required', 'string', 'max:10000'], // Limitador contra injeções de memória (Mega-payloads)
            'flashcards.*.front_image' => ['nullable', 'string', 'max:500'], // URL
            'flashcards.*.back' => ['required', 'string', 'max:10000'],
            'flashcards.*.back_image' => ['nullable', 'string', 'max:500'], // URL
            'flashcards.*.tags' => ['nullable', 'string', 'max:1000'],
            'flashcards.*.deleted_at' => ['nullable', 'string'],

            // Review Logs (Historico e SM-2)
            'review_logs.*.id' => ['required', 'uuid'],
            'review_logs.*.flashcard_id' => ['required', 'uuid'],
            'review_logs.*.grade' => ['required', 'integer', 'min:0', 'max:5'], // Somente os valores SRS previstos
            'review_logs.*.reviewed_at' => ['required', 'string'],
            'review_logs.*.deleted_at' => ['nullable', 'string'],
        ];
    }
}
