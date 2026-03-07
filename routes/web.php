<?php

declare(strict_types = 1)
;

use Illuminate\Support\Facades\Route;

/* |-------------------------------------------------------------------------- | Web Routes |-------------------------------------------------------------------------- | | Rota fallback para o SPA React. | Qualquer URL que não seja /api será capturada aqui | e servida pela view Blade que carrega o Vite + React. | */

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
