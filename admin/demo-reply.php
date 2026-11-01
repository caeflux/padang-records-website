<?php
/**
 * PADANG · resposta às demos (admin/demos.html)
 * Recebe {token, id, status, text, send}. Confere no Supabase que o token é de um admin
 * (padang_is_admin), lê o e-mail do artista no banco (o cliente nunca escolhe o destinatário),
 * envia a resposta pelo mail() como contact@ e grava status/texto na padang_demos.
 * Sem segredo aqui: só a publishable key; quem decide é o RLS com o token do admin.
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

const SB_URL = 'https://scovsmnbzweljbagnvhk.supabase.co';
const SB_KEY = 'sb_publishable_4RBtPiZOCpVWbCL2Rxeteg_8FmafK5R';

function out($code, $arr) { http_response_code($code); echo json_encode($arr); exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(405, ['ok' => false, 'error' => 'method_not_allowed']);
$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) out(400, ['ok' => false, 'error' => 'invalid_json']);

$token  = is_string($in['token'] ?? null) ? $in['token'] : '';
$id     = (int)($in['id'] ?? 0);
$status = $in['status'] ?? '';
$text   = is_string($in['text'] ?? null) ? trim($in['text']) : '';
$send   = !empty($in['send']);
if ($token === '' || $id <= 0 || !in_array($status, ['interesse', 'talvez', 'recusado', 'novo'], true)) out(400, ['ok' => false, 'error' => 'bad_request']);
if ($send && ($text === '' || mb_strlen($text, 'UTF-8') > 8000)) out(400, ['ok' => false, 'error' => 'bad_text']);

// Chamada ao Supabase com o token do admin (RLS decide o que pode).
function sb($method, $path, $token, $body = null) {
    $headers = ['apikey: ' . SB_KEY, 'Authorization: Bearer ' . $token, 'Accept: application/json'];
    if ($body !== null) { $headers[] = 'Content-Type: application/json'; $headers[] = 'Prefer: return=minimal'; }
    $ch = curl_init(SB_URL . $path);
    curl_setopt_array($ch, [CURLOPT_CUSTOMREQUEST => $method, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 15,
        CURLOPT_HTTPHEADER => $headers]);
    if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return [$code, json_decode((string)$res, true)];
}

[$c, $isAdmin] = sb('POST', '/rest/v1/rpc/padang_is_admin', $token, new stdClass());
if ($c !== 200 || $isAdmin !== true) out(403, ['ok' => false, 'error' => 'not_admin']);

[$c, $rows] = sb('GET', '/rest/v1/padang_demos?id=eq.' . $id . '&select=id,from_email,subject,source,message_id', $token);
if ($c !== 200 || !is_array($rows) || !$rows) out(404, ['ok' => false, 'error' => 'not_found']);
$demo = $rows[0];

function header_safe($v) { return str_replace(["\r", "\n", "%0a", "%0d"], '', (string)$v); }
function mime_header($v) {
    $v = header_safe($v);
    return preg_match('/[^\x20-\x7E]/', $v) ? mb_encode_mimeheader($v, 'UTF-8', 'B', "\r\n") : $v;
}

$patch = ['status' => $status, 'handled_at' => gmdate('c')];
if ($send) {
    $to = $demo['from_email'];
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) out(422, ['ok' => false, 'error' => 'bad_recipient']);
    $orig = trim(preg_replace('/^(re:\s*)+/i', '', (string)$demo['subject']));
    $subject = ($demo['source'] === 'form' || $orig === '') ? 'Your demo for Padang Records' : 'Re: ' . $orig;

    $headers  = "From: Carlos Dienstmann - Padang Records <contact@padangrecords.net>\r\n";
    $headers .= "Reply-To: contact@padangrecords.net\r\n";
    $mid = header_safe($demo['message_id'] ?? '');
    if (preg_match('/^<[^<>\s]+>$/', $mid)) { $headers .= "In-Reply-To: $mid\r\nReferences: $mid\r\n"; }
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= "Content-Transfer-Encoding: 8bit\r\n";
    $headers .= "X-Mailer: PADANG-ar/1.0\r\n";

    if (!mail($to, mime_header(mb_substr($subject, 0, 200, 'UTF-8')), $text, $headers, '-fcontact@padangrecords.net')) {
        error_log('[padang demo-reply] mail() failed for demo ' . $id);
        out(500, ['ok' => false, 'error' => 'mail_failed']);
    }
    $patch['replied_at'] = gmdate('c');
    $patch['reply_text'] = $text;
}

[$c] = sb('PATCH', '/rest/v1/padang_demos?id=eq.' . $id, $token, $patch);
if ($c < 200 || $c >= 300) out(500, ['ok' => false, 'error' => $send ? 'sent_but_not_saved' : 'save_failed']);
out(200, ['ok' => true, 'sent' => $send]);
