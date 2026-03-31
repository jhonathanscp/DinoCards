FROM php:8.5-fpm

RUN apt-get update && apt-get install -y \
    libpq-dev \
    unzip \
    curl \
    gnupg \
    && docker-php-ext-install pdo_pgsql

RUN curl -fsSL https://deb.nodesource.com/setup_24.x | bash - \
    && apt-get install -y nodejs

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock package.json package-lock.json ./

RUN composer install --no-scripts --no-autoloader

RUN npm install

COPY . .

RUN composer dump-autoload --optimize

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
