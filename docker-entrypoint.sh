#!/bin/bash

# 1. Garante que as pastas de storage existem (caso o git ignore tenha removido)
mkdir -p storage/framework/{sessions,views,cache} storage/logs bootstrap/cache

# 2. Corrige permissões de forma agressiva antes de iniciar
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# 3. Se não tiver .env, cria um
if [ ! -f .env ]; then
    cp .env.example .env
fi

# 4. Comandos do Laravel
php artisan key:generate --no-interaction --force
php artisan migrate --force
php artisan config:cache
php artisan route:cache

# 5. Inicia o PHP-FPM
exec php-fpm