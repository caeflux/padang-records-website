<?php
/**
 * PADANG · demo submission backend
 * Receives JSON from demo.html, sanitizes, validates, sends real email to contact@padangrecords.net
 * No database. No third-party. Just PHP mail() on HostGator.
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
    // Silent success — bot thinks it worked
    echo json_encode(['ok' => true, 'queued' => true]);
    exit;
}

// ─── Helpers ────────────────────────────────────────────────
function clean($v, $max = 5000) {
    if (!is_string($v)) return '';
    $v = trim($v);
    $v = mb_substr($v, 0, $max, 'UTF-8');
    // Strip control chars except \n \r \t
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $v);
    return $v;
}
function header_safe($v) {
    // Prevent header injection
    return str_replace(["\r", "\n", "%0a", "%0d"], '', $v);
}

// ─── Required fields ────────────────────────────────────────
$artist    = clean($data['artist']    ?? '', 200);
$realname  = clean($data['realname']  ?? '', 200);
$email     = clean($data['email']     ?? '', 200);
$location  = clean($data['location']  ?? '', 200);
$genre     = clean($data['genre']     ?? '', 100);
$bpm       = clean($data['bpm']       ?? '', 50);
$sclink    = clean($data['sclink']    ?? '', 500);
$profile   = clean($data['profile']   ?? '', 500);
$bio       = clean($data['bio']       ?? '', 4000);
$message   = clean($data['message']   ?? '', 4000);
$exclusive = !empty($data['exclusive']);
$rights    = !empty($data['rights']);
$readguide = !empty($data['readguide']);

// ─── Validate ───────────────────────────────────────────────
$errors = [];
if ($artist === '')   $errors[] = 'artist';
if ($realname === '') $errors[] = 'realname';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'email';
if ($location === '') $errors[] = 'location';
if ($genre === '')    $errors[] = 'genre';
if (!filter_var($sclink, FILTER_VALIDATE_URL))  $errors[] = 'sclink';
elseif (!preg_match('#^https?://(soundcloud\.com|drive\.google\.com)/#i', $sclink)) $errors[] = 'sclink';
if ($bio === '')      $errors[] = 'bio';
if (!$exclusive || !$rights || !$readguide) $errors[] = 'declarations';

if ($errors) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'validation_failed', 'fields' => $errors]);
    exit;
}

// ─── Build email ────────────────────────────────────────────
$to      = 'contact@padangrecords.net';
$subject = '[DEMO] ' . header_safe($artist) . ' — ' . header_safe($genre);

$body  = "// PADANG DEMO SUBMISSION\n";
$body .= str_repeat("=", 50) . "\n\n";
$body .= "ARTIST:      $artist\n";
$body .= "REAL NAME:   $realname\n";
$body .= "EMAIL:       $email\n";
$body .= "LOCATION:    $location\n";
$body .= "GENRE:       $genre\n";
$body .= "BPM:         " . ($bpm !== '' ? $bpm : '—') . "\n\n";
$body .= "DEMO LINK:\n$sclink\n\n";
$body .= "PROFILE:\n" . ($profile !== '' ? $profile : '—') . "\n\n";
$body .= "BIO:\n$bio\n\n";
$body .= "MESSAGE:\n" . ($message !== '' ? $message : '—') . "\n\n";
$body .= str_repeat("=", 50) . "\n";
$body .= "Declarations:\n";
$body .= "[X] Tracks unreleased\n";
$body .= "[X] Rights & samples cleared\n";
$body .= "[X] Read submission guide\n\n";
$body .= "--\n";
$body .= "Submitted: " . date('Y-m-d H:i:s') . " UTC\n";
$body .= "Origin: " . ($_SERVER['HTTP_REFERER'] ?? 'direct') . "\n";
$body .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? '?') . "\n";

// ─── Headers (Reply-To = submitter so the label can reply directly) ─
$headers  = "From: Padang Demo Form <noreply@padangrecords.net>\r\n";
$headers .= "Reply-To: " . header_safe($realname) . " <" . header_safe($email) . ">\r\n";
$headers .= "X-Mailer: PADANG-demo/1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// ─── Send ───────────────────────────────────────────────────
$sent = mail($to, $subject, $body, $headers, '-fnoreply@padangrecords.net');

if ($sent) {
    echo json_encode(['ok' => true]);