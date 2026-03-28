<?php

declare(strict_types=1);

namespace App\Services;

use App\Interfaces\AuthServiceInterface;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthService implements AuthServiceInterface
{
    public function login(array $credentials): bool
    {
        return Auth::attempt($credentials);
    }

    public function register(array $data): User
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        Auth::login($user);

        return $user;
    }

    public function logout(): void
    {
        Auth::guard('web')->logout();
    }
}
