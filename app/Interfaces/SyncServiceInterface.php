<?php

declare(strict_types=1);

namespace App\Interfaces;

use App\Models\User;

interface SyncServiceInterface
{
    public function pull(User $user, ?string $lastPulledAt): array;
    public function push(User $user, array $subjects, array $flashcards, array $reviewLogs): void;
}
