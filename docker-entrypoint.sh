#!/bin/bash

if [ ! -f .env ]; then
    cp .env.example .env
fi
php artisan key:generate --no-interaction --force

php artisan migrate --force

php-fpm