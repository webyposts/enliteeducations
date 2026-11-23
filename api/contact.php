<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enlite_json(['ok' => false, 'error' => 'Use POST'], 405);
}

$raw = file_get_contents('php://input') ?: '';
$data = json_decode($raw, true);
if (!is_array($data)) {
    $data = $_POST;
}

$name = trim((string) ($data['name'] ?? ''));
$role = trim((string) ($data['role'] ?? ''));
$organization = trim((string) ($data['organization'] ?? ''));
$email = trim((string) ($data['email'] ?? ''));
$phone = trim((string) ($data['phone'] ?? ''));
$message = trim((string) ($data['message'] ?? ''));

$allowedRoles = ['school', 'teacher', 'publisher', 'parent', 'other'];

if ($name === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    enlite_json(['ok' => false, 'error' => 'Please enter your name, a valid email, and a message.'], 422);
}
if (!in_array($role, $allowedRoles, true)) {
    enlite_json(['ok' => false, 'error' => 'Please select your role.'], 422);
}
if (mb_strlen($name) > 190 || mb_strlen($organization) > 190 || mb_strlen($phone) > 50) {
    enlite_json(['ok' => false, 'error' => 'One of the fields is too long.'], 422);
}
if (mb_strlen($message) > 5000) {
    enlite_json(['ok' => false, 'error' => 'Message is too long.'], 422);
}

$roleLabel = enlite_role_label($role);
$ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '');
$ua = substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255);

try {
    $db = enlite_db($config);
} catch (Throwable $e) {
    enlite_json(['ok' => false, 'error' => 'Could not save your message. Please try again shortly.'], 500);
}

$stmt = $db->prepare(
    'INSERT INTO contact_submissions
      (name, role, role_label, organization, email, phone, message, ip_address, user_agent, email_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
);
if (!$stmt) {
    enlite_json(['ok' => false, 'error' => 'Could not save your message.'], 500);
}

$emailStatus = 'pending';
$emailError = null;
$notify = trim((string) ($config['notify_email'] ?? ''));

$stmt->bind_param(
    'ssssssssss',
    $name,
    $role,
    $roleLabel,
    $organization,
    $email,
    $phone,
    $message,
    $ip,
    $ua,
    $emailStatus
);
if (!$stmt->execute()) {
    enlite_json(['ok' => false, 'error' => 'Could not save your message.'], 500);
}
$id = (int) $db->insert_id;
$stmt->close();

if ($notify === '') {
    $emailStatus = 'skipped';
} else {
    $subject = 'New enquiry from ' . $name . ' — Enlite Educations';
    $body = "A new contact form submission was saved (#{$id}).\n\n"
        . "Name: {$name}\n"
        . "Role: {$roleLabel}\n"
        . "Organization: {$organization}\n"
        . "Email: {$email}\n"
        . "Phone: {$phone}\n\n"
        . "Message:\n{$message}\n";
    $fromEmail = $config['from_email'] ?? 'noreply@localhost';
    $fromName = $config['from_name'] ?? 'Enlite Educations';
    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'From: ' . sprintf('%s <%s>', $fromName, $fromEmail),
        'Reply-To: ' . $email,
        'X-Mailer: EnliteEducations',
    ];
    $sent = @mail($notify, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, implode("\r\n", $headers));
    $emailStatus = $sent ? 'sent' : 'failed';
    if (!$sent) {
        $emailError = 'Local mail() could not send. Message is still saved in the admin inbox.';
    }
}

$upd = $db->prepare('UPDATE contact_submissions SET email_status = ?, email_error = ? WHERE id = ?');
$upd->bind_param('ssi', $emailStatus, $emailError, $id);
$upd->execute();
$upd->close();

enlite_json([
    'ok' => true,
    'id' => $id,
    'email_status' => $emailStatus,
    'message' => 'Thank you. Your message has been saved for the Enlite team.',
]);
