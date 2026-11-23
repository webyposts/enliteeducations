<?php
declare(strict_types=1);

set_time_limit(0);
ini_set('output_buffering', 'off');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Allow-Headers: Range');
    header('Access-Control-Expose-Headers: Accept-Ranges, Content-Range, Content-Length, Content-Type');
    http_response_code(204);
    exit;
}

$url = $_GET['url'] ?? '';
$parts = parse_url($url);
$host = strtolower($parts['host'] ?? '');
$path = $parts['path'] ?? '';

$allowed = $host === 'app.enliteeducations.in'
    && ($parts['scheme'] ?? '') === 'https'
    && str_starts_with($path, '/wp-content/uploads/')
    && !str_contains($path, '..')
    && preg_match('/\.pdf$/i', $path);

if (!$allowed) {
    http_response_code(400);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Invalid PDF URL';
    exit;
}

header('Access-Control-Allow-Origin: *');
header('Access-Control-Expose-Headers: Accept-Ranges, Content-Range, Content-Length, Content-Type');
header('X-Content-Type-Options: nosniff');

if (!function_exists('curl_init')) {
    header('Content-Type: application/pdf');
    readfile($url);
    exit;
}

$headers = [];
if (!empty($_SERVER['HTTP_RANGE'])) {
    $headers[] = 'Range: ' . $_SERVER['HTTP_RANGE'];
}

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 3,
    CURLOPT_RETURNTRANSFER => false,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_HEADERFUNCTION => static function ($ch, $headerLine) {
        $header = trim($headerLine);
        if ($header === '') {
            return strlen($headerLine);
        }
        if (preg_match('/^HTTP\/\S+\s+(\d+)/', $header, $m)) {
            http_response_code((int) $m[1]);
            return strlen($headerLine);
        }
        foreach (['Content-Type:', 'Content-Length:', 'Accept-Ranges:', 'Content-Range:', 'ETag:', 'Last-Modified:'] as $name) {
            if (stripos($header, $name) === 0) {
                header($header, true);
                break;
            }
        }
        return strlen($headerLine);
    },
]);

$ok = curl_exec($ch);
$errno = curl_errno($ch);
curl_close($ch);

if ($ok === false || $errno) {
    http_response_code(502);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Could not load PDF';
}
