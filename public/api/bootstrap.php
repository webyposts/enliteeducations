<?php
declare(strict_types=1);

header('X-Content-Type-Options: nosniff');

$config = require __DIR__ . '/config.php';
$local = __DIR__ . '/config.local.php';
if (is_file($local)) {
    $config = array_merge($config, require $local);
}

function enlite_db(array $config): mysqli
{
    $mysqli = @new mysqli(
        $config['db_host'],
        $config['db_user'],
        $config['db_pass'],
        $config['db_name']
    );
    if ($mysqli->connect_errno) {
        throw new RuntimeException('Database connection failed');
    }
    $mysqli->set_charset('utf8mb4');
    return $mysqli;
}

function enlite_json(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function enlite_role_label(string $role): string
{
    $map = [
        'school' => 'School Administrator',
        'teacher' => 'Teacher',
        'publisher' => 'Publisher',
        'parent' => 'Parent',
        'other' => 'Other',
    ];
    return $map[$role] ?? $role;
}
