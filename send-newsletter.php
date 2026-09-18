<?php
/**
 * PADANG · newsletter signup backend
 * Recebe JSON do formulário .nl-form (newsletter.js), valida e manda e-mail para
 * contact@padangrecords.net com assunto "[newsletter] <lang> <email>".
 * Mesmo padrão do send-demo.php: sem banco, sem terceiros, PHP mail() na HostGator.
 * (Etapa provisória: depois a lista migra para uma ferramenta de e-mail.)
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// ─── Only POST ───────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'method_not_allowed']);
    exit;
}

// ─── Parse JSON body ────────────────────────────────────────
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'invalid_json']);
    exit;
}

// ─── Honeypot anti-spam: hidden field "website" must be empty ─
if (!empty($data['website'])) {
    echo json_encode(['ok' => true, 'queued' => true]);
    exit;
}

// ─── Helpers ────────────────────────────────────────────────
function clean($v, $max = 500) {
    if (!is_string($v)) return '';
    $v = trim($v);
    $v = mb_substr($v, 0, $max, 'UTF-8');
    $v = preg_replace('/[\x00-\x1F\x7F]/', '', $v);
    return $v;
}
function header_safe($v) {
    return str_replace(["\r", "\n", "%0a", "%0d"], '', $v);
}

// ─── Fields ─────────────────────────────────────────────────
$email = clean($data['email'] ?? '', 200);
$name  = clean($data['name']  ?? '', 120);
$lang  = strtolower(clean($data['lang'] ?? '', 5));
$page  = clean($data['page']  ?? '', 300);
if (!in_array($lang, ['pt', 'en', 'es', 'de', 'fr', 'ja'], true)) $lang = 'xx';

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'validation_failed', 'fields' => ['email']]);
    exit;
}

// ─── Build email ────────────────────────────────────────────
$to      = 'contact@padangrecords.net';
$subject = '[newsletter] ' . $lang . ' ' . header_safe($email);

$body  = "// PADANG NEWSLETTER SIGNUP\n";
$body .= str_repeat("=", 50) . "\n\n";
$body .= "EMAIL:  $email\n";
$body .= "NAME:   " . ($name !== '' ? $name : '—') . "\n";
$body .= "LANG:   $lang\n";
$body .= "PAGE:   " . ($page !== '' ? $page : '—') . "\n\n";
$body .= "--\n";
$body .= "Submitted: " . gmdate('Y-m-d H:i:s') . " UTC\n";
$body .= "Origin: " . ($_SERVER['HTTP_REFERER'] ?? 'direct') . "\n";
$body .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? '?') . "\n";

$headers  = "From: Padang Newsletter <noreply@padangrecords.net>\r\n";
$headers .= "Reply-To: " . header_safe($email) . "\r\n";
$headers .= "X-Mailer: PADANG-newsletter/1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// ─── Send ───────────────────────────────────────────────────
$sent = mail($to, $subject, $body, $headers, '-fnoreply@padangrecords.net');

if ($sent) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'mail_failed']);
}
