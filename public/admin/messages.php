<?php
declare(strict_types=1);

session_start();
require dirname(__DIR__) . '/api/bootstrap.php';

$authed = ($_SESSION['enlite_admin'] ?? false) === true;

if (isset($_GET['logout'])) {
    $_SESSION = [];
    session_destroy();
    header('Location: messages.php');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['password'])) {
    if (hash_equals((string) $config['admin_password'], (string) $_POST['password'])) {
        $_SESSION['enlite_admin'] = true;
        header('Location: messages.php');
        exit;
    }
    $error = 'Incorrect password.';
}

if ($authed && isset($_GET['read'])) {
    $id = (int) $_GET['read'];
    $db = enlite_db($config);
    $stmt = $db->prepare('UPDATE contact_submissions SET is_read = 1 WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    header('Location: messages.php');
    exit;
}

$rows = [];
$unread = 0;
if ($authed) {
    try {
        $db = enlite_db($config);
        $result = $db->query('SELECT * FROM contact_submissions ORDER BY created_at DESC, id DESC');
        if ($result) {
            $rows = $result->fetch_all(MYSQLI_ASSOC);
        }
        foreach ($rows as $row) {
            if (!(int) $row['is_read']) {
                $unread++;
            }
        }
    } catch (Throwable $e) {
        $error = 'Database is not ready. Run public/sql/contact_submissions.sql in phpMyAdmin or MySQL.';
    }
}

function h(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Enlite contact inbox</title>
  <style>
    :root { font-family: Segoe UI, system-ui, sans-serif; color: #1f1b24; }
    body { margin: 0; background: #f6f4f8; }
    .wrap { max-width: 1100px; margin: 0 auto; padding: 24px; }
    .card { background: #fff; border: 1px solid #eadff3; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
    h1 { margin: 0 0 8px; }
    .muted { color: #6b6572; }
    input[type=password], button { font: inherit; padding: 10px 12px; border-radius: 8px; }
    input[type=password] { border: 1px solid #d7cde0; width: min(320px, 100%); }
    button, .btn { background: #7b2fd0; color: #fff; border: 0; cursor: pointer; text-decoration: none; display: inline-block; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #efe8f5; vertical-align: top; }
    th { font-size: 12px; text-transform: uppercase; letter-spacing: .04em; color: #6b6572; }
    .new { background: #f4ecff; }
    .msg { white-space: pre-wrap; }
    .pill { font-size: 12px; padding: 2px 8px; border-radius: 999px; background: #eee; }
    .sent { background: #e5f8ea; }
    .failed { background: #fde8e8; }
    .top { display: flex; justify-content: space-between; gap: 12px; align-items: center; flex-wrap: wrap; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="top">
      <div>
        <h1>Contact inbox</h1>
        <p class="muted">Messages from the website form are stored here. Email is attempted as well.</p>
      </div>
      <?php if ($authed): ?>
        <a class="btn" href="?logout=1" style="padding:10px 12px;border-radius:8px;">Log out</a>
      <?php endif; ?>
    </div>

    <?php if ($error): ?>
      <div class="card"><?= h($error) ?></div>
    <?php endif; ?>

    <?php if (!$authed): ?>
      <div class="card">
        <form method="post">
          <p>Admin password</p>
          <input type="password" name="password" autofocus />
          <button type="submit">Open inbox</button>
        </form>
      </div>
    <?php else: ?>
      <p class="muted"><?= count($rows) ?> message(s), <?= (int) $unread ?> unread.</p>
      <div class="card" style="overflow:auto;">
        <table>
          <thead>
            <tr>
              <th>When</th>
              <th>From</th>
              <th>Role / org</th>
              <th>Message</th>
              <th>Email notify</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <?php if (!$rows): ?>
              <tr><td colspan="6" class="muted">No messages yet.</td></tr>
            <?php endif; ?>
            <?php foreach ($rows as $row): ?>
              <tr class="<?= (int) $row['is_read'] ? '' : 'new' ?>">
                <td><?= h($row['created_at']) ?><br />#<?= (int) $row['id'] ?></td>
                <td>
                  <strong><?= h($row['name']) ?></strong><br />
                  <a href="mailto:<?= h($row['email']) ?>"><?= h($row['email']) ?></a><br />
                  <?= h($row['phone']) ?>
                </td>
                <td>
                  <?= h($row['role_label']) ?><br />
                  <?= h($row['organization']) ?>
                </td>
                <td class="msg"><?= h($row['message']) ?></td>
                <td>
                  <span class="pill <?= h($row['email_status']) ?>"><?= h($row['email_status']) ?></span>
                  <?php if ($row['email_error']): ?>
                    <div class="muted"><?= h($row['email_error']) ?></div>
                  <?php endif; ?>
                </td>
                <td>
                  <?php if (!(int) $row['is_read']): ?>
                    <a href="?read=<?= (int) $row['id'] ?>">Mark read</a>
                  <?php else: ?>
                    Read
                  <?php endif; ?>
                </td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    <?php endif; ?>
  </div>
</body>
</html>
