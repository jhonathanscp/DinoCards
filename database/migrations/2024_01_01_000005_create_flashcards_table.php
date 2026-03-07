<?php

declare(strict_types = 1)
;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    public function up(): void
    {
        Schema::create('flashcards', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->foreignUuid('subject_id')
                ->constrained('subjects')
                ->cascadeOnDelete();
            $table->text('front');
            $table->text('back');

            // Campos SRS (Algoritmo SM-2)
            $table->timestamp('next_review_at')->nullable();
            $table->float('ease_factor')->default(2.5);
            $table->unsignedInteger('interval')->default(0);
            $table->unsignedInteger('repetitions')->default(0);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'deleted_at']);
            $table->index(['user_id', 'subject_id']);
            $table->index(['user_id', 'next_review_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('flashcards');
    }
};
