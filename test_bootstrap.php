<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');

try {
    require __DIR__ . '/vendor/autoload.php';

    // Test bootstrap/cache write
    $testFile = __DIR__ . '/bootstrap/cache/test_write.txt';
    file_put_contents($testFile, 'test');
    echo "bootstrap/cache write OK\n";
    unlink($testFile);

    // Test Carbon
    $carbon = new \Carbon\Carbon();
    echo "Carbon OK: " . $carbon->toIso8601String() . "\n";

    // Test app bootstrap
    $app = require_once __DIR__ . '/bootstrap/app.php';
    echo "Bootstrap OK\n";
    echo "Version: " . $app->version() . "\n";

    // Try key:generate
    $kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
    $status = $kernel->call('key:generate');
    echo "key:generate status: {$status}\n";
    echo $kernel->output();


}
catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "FILE: " . $e->getFile() . "\n";
    echo "LINE: " . $e->getLine() . "\n";
    echo "TRACE:\n" . $e->getTraceAsString() . "\n";
}
