<?php

declare(strict_types=1);

namespace App\Interfaces;

use App\Models\User;

interface AuthServiceInterface
{
    public function login(array $credentials): bool;
    public function register(array $data): User;
    public function logout(): void;
}
