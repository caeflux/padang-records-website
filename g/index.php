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

// {quem deu, álbum} por idioma — os mesmos textos de ogT/ogD em gift.js
$OG = array(
  'pt' => array('Um presente de %s: %s', 'Álbum completo no Bandcamp · Padang Records', 'Um presente · Padang Records', 'Painel de presentes · Padang Records'),
  'en' => array('A gift from %s: %s', 'Full album on Bandcamp · Padang Records', 'A gift · Padang Records', 'Gift panel · Padang Records'),
  'es' => array('Un regalo de %s: %s', 'Álbum completo en Bandcamp · Padang Records', 'Un regalo · Padang Records', 'Panel de regalos · Padang Records'),
  'de' => array('Ein Geschenk von %s: %s', 'Komplettes Album auf Bandcamp · Padang Records', 'Ein Geschenk · Padang Records', 'Geschenke-Panel · Padang Records'),
  'fr' => array('Un cadeau de %s : %s', 'Album complet sur Bandcamp · Padang Records', 'Un cadeau · Padang Records', 'Panneau de cadeaux · Padang Records'),
  'ja' => array('%sからの贈り物：%s', 'Bandcampのアルバム全曲 · Padang Records', 'ギフト · Padang Records', 'ギフトパネル · Padang Records'),
);

$lang  = 'pt';
$title = $OG[$lang][2];
$desc  = 'save your ears from sameness.';
$img   = $SITE . '/img/og-padang.jpg';
$imgW  = 1200;
$imgH  = 630;
$card  = 'summary_large_image';

if ($t !== '' && preg_match('/^[a-z0-9]{12,64}$/', $t)) {
  $p = padang_gift_peek($SB_URL, $SB_KEY, $t);
  if (is_array($p) && isset($p['kind'])) {
    if ($p['kind'] === 'ticket' && !empty($p['giver']) && !empty($p['title'])) {
      if (!empty($p['lang']) && isset($OG[$p['lang']])) { $lang = $p['lang']; }
      $title = sprintf($OG[$lang][0], $p['giver'], $p['title']);
      $desc  = $OG[$lang][1];
      if (!empty($p['cover']) && preg_match('#^https://f4\.bcbits\.com/img/a\d+_\d+\.jpg$#', $p['cover'])) {
        $img  = preg_replace('/_\d+\.jpg$/', '_16.jpg', $p['cover']); // 700 px
        $imgW = 700; $imgH = 700; $card = 'summary';
      }
    } elseif ($p['kind'] === 'panel') {
      $title = $OG[$lang][3];
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
