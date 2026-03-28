<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Interfaces\AuthServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    protected AuthServiceInterface $authService;

    public function __construct(AuthServiceInterface $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Handle a login request via Sanctum SPA authentication (cookie-based).
     */
    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();

        if (!$this->authService->login($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $request->session()->regenerate();

        return response()->json($request->user());
    }

    /**
     * Handle a registration request.
     */
    public function register(RegisterRequest $request)
    {
        $user = $this->authService->register($request->validated());

        $request->session()->regenerate();

        return response()->json($user, 201);
    }

    /**
     * Handle a logout request.
     */
    public function logout(Request $request)
    {
        $this->authService->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out']);
    }
}
