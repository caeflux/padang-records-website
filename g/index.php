<?php
/* Padang Records · link-presente
   Entrega page.html com o cartão de prévia (Open Graph) do presente, para o link aparecer
   com capa e nome de quem deu no WhatsApp, Telegram, Instagram etc.
   /g/<token> chega aqui pelo g/.htaccess. Este arquivo só lê (padang_gift_peek): não marca
   nada como aberto e nunca vê o código do Bandcamp. */

$SB_URL = 'https://scovsmnbzweljbagnvhk.supabase.co';
$SB_KEY = 'sb_publishable_4RBtPiZOCpVWbCL2Rxeteg_8FmafK5R'; // chave pública (a mesma de gift.js)
$SITE   = 'https://padangrecords.net';

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate, max-age=0');
header('X-Robots-Tag: noindex, nofollow');

$t = isset($_GET['t']) ? (string)$_GET['t'] : '';
if (!preg_match('/^[A-Za-z0-9_-]{6,64}$/', $t)) { $t = ''; }

function padang_gift_peek($url, $key, $token) {
  if (!function_exists('curl_init')) { return null; }
  $ch = curl_init($url . '/rest/v1/rpc/padang_gift_peek');
  curl_setopt_array($ch, array(
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode(array('p_token' => $token)),
    CURLOPT_HTTPHEADER     => array('Content-Type: application/json', 'apikey: ' . $key, 'Authorization: Bearer ' . $key),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 2,
    CURLOPT_TIMEOUT        => 4,
  ));
  $body = curl_exec($ch);
  $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
  if (PHP_VERSION_ID < 80000) { curl_close($ch); }
  if ($code !== 200 || !is_string($body) || $body === '') { return null; }
  $j = json_decode($body, true);
  return is_array($j) ? $j : null;
}

// só inglês, os mesmos textos de ogT/ogD em gift.js
$OG_GIFT  = 'A gift from %s: %s';
$OG_DESC  = 'Full album on Bandcamp · Padang Records';
$OG_PANEL = 'Gift panel · Padang Records';

$title = 'A gift · Padang Records';
$desc  = 'save your ears from sameness.';
$img   = $SITE . '/img/og-padang.jpg';
$imgW  = 1200;
$imgH  = 630;
$card  = 'summary_large_image';

if ($t !== '' && preg_match('/^[a-z0-9]{12,64}$/', $t)) {
  $p = padang_gift_peek($SB_URL, $SB_KEY, $t);
  if (is_array($p) && isset($p['kind'])) {
    if ($p['kind'] === 'ticket' && !empty($p['giver']) && !empty($p['title'])) {
      $title = sprintf($OG_GIFT, $p['giver'], $p['title']);
      $desc  = $OG_DESC;
      if (!empty($p['cover']) && preg_match('#^https://f4\.bcbits\.com/img/a\d+_\d+\.jpg$#', $p['cover'])) {
        $img  = preg_replace('/_\d+\.jpg$/', '_16.jpg', $p['cover']); // 700 px
        $imgW = 700; $imgH = 700; $card = 'summary';
      }
    } elseif ($p['kind'] === 'panel') {
      $title = $OG_PANEL;
    }
  }
}

$e = function ($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); };
$og = '<meta property="og:type" content="website">' . "\n"
    . '<meta property="og:site_name" content="Padang Records">' . "\n"
    . '<meta property="og:title" content="' . $e($title) . '">' . "\n"
    . '<meta property="og:description" content="' . $e($desc) . '">' . "\n"
    . '<meta property="og:image" content="' . $e($img) . '">' . "\n"
    . '<meta property="og:image:width" content="' . $imgW . '">' . "\n"
    . '<meta property="og:image:height" content="' . $imgH . '">' . "\n"
    . '<meta name="twitter:card" content="' . $card . '">' . "\n"
    . '<meta name="description" content="' . $e($desc) . '">';

$html = @file_get_contents(__DIR__ . '/page.html');
if (!is_string($html) || $html === '') {
  http_response_code(500);
  echo '<!doctype html><meta charset="utf-8"><title>Padang Records</title><p>Padang Records</p>';
  exit;
}
$html = preg_replace('#<title>.*?</title>#s', '<title>' . $e($title) . '</title>', $html, 1);
echo str_replace('<!--og-->', $og, $html);
