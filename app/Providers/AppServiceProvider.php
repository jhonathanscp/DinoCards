<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema; // <-- 1. Adicione esta linha

use App\Interfaces\AuthServiceInterface;
use App\Interfaces\ReviewServiceInterface;
use App\Interfaces\SyncServiceInterface;
use App\Services\AuthService;
use App\Services\ReviewService;
use App\Services\SyncService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(AuthServiceInterface::class, AuthService::class);
        $this->app->bind(ReviewServiceInterface::class, ReviewService::class);
        $this->app->bind(SyncServiceInterface::class, SyncService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191); // <-- 2. Adicione esta linha
    }
}