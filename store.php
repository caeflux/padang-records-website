<?php
/**
 * PADANG · store.php — estoque e preço ao vivo da Padang Store (Nuvemshop) para os cards do shop.html.
 *
 * Fonte: API oficial se existir $HOME/.nuvemshop.json (fora do public_html) com access_token + store_id;
 * senão lê as páginas públicas de produto listadas em data/store.json (bloco LS.variants).
 * Cache de 5 min em arquivo temporário. Se tudo falhar, devolve a baseline do data/store.json.
 *
 * Resposta: {"ts":…,"source":"api|storefront|baseline","variants":{"<id>":{"stock":n|null,"available":bool,"price":n}}}
 */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: public, max-age=120');

$ttl   = 300;
$cache = rtrim(sys_get_temp_dir(), '/') . '/padang-store-live.json';
if (is_file($cache) && (time() - filemtime($cache)) < $ttl) { readfile($cache); exit; }

$base = json_decode(@file_get_contents(__DIR__ . '/data/store.json'), true);
if (!is_array($base) || empty($base['products'])) $base = array('products' => array());

$out = array('ts' => time(), 'source' => 'baseline', 'variants' => array());
foreach ($base['products'] as $p) {
  foreach ($p['variants'] as $v) {
    $out['variants'][(string)$v['id']] = array('stock' => $v['stock'], 'available' => (bool)$v['available'], 'price' => $v['price']);
  }
}

function padang_http_get($url, $headers = array()) {
  $ch = curl_init($url);
  curl_setopt_array($ch, array(
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS      => 3,
    CURLOPT_CONNECTTIMEOUT => 4,
    CURLOPT_TIMEOUT        => 8,
    CURLOPT_HTTPHEADER     => array_merge(array('User-Agent: PadangRecordsSite/1.0 (+https://padangrecords.net)'), $headers),
  ));
  $body = curl_exec($ch);
  $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  return ($body !== false && $code >= 200 && $code < 300) ? $body : null;
}

$live = array();

// 1) API oficial (token fora do public_html)
$home    = getenv('HOME');
$cfgPath = ($home ? rtrim($home, '/') : dirname(__DIR__)) . '/.nuvemshop.json';
$cfg     = is_file($cfgPath) ? json_decode(@file_get_contents($cfgPath), true) : null;
if (is_array($cfg) && !empty($cfg['access_token']) && !empty($cfg['store_id'])) {
  $data = null;
  foreach (array('2025-03', 'v1') as $ver) {   // base atual é versionada; v1 segue como fallback
    $json = padang_http_get(
      'https://api.nuvemshop.com.br/' . $ver . '/' . (int)$cfg['store_id'] . '/products?per_page=200&published=true&fields=id,variants',
      array('Authorization: Bearer ' . $cfg['access_token'], 'Authentication: bearer ' . $cfg['access_token'], 'Content-Type: application/json')
    );
    $data = $json ? json_decode($json, true) : null;
    if (is_array($data)) break;
  }
  if (is_array($data)) {
    foreach ($data as $p) {
      if (empty($p['variants'])) continue;
      foreach ($p['variants'] as $v) {
        $managed = !isset($v['stock_management']) || $v['stock_management'] !== false;
        $stock   = ($managed && isset($v['stock']) && $v['stock'] !== null) ? (int)$v['stock'] : null;
        $price   = !empty($v['promotional_price']) ? (float)$v['promotional_price'] : (isset($v['price']) ? (float)$v['price'] : null);
        $live[(string)$v['id']] = array('stock' => $stock, 'available' => ($stock === null || $stock > 0), 'price' => $price);
      }
    }
    if ($live) $out['source'] = 'api';
  }
}

// 2) vitrine pública (sem token)
if (!$live) {
  foreach ($base['products'] as $p) {
    if (empty($p['url'])) continue;
    $html = padang_http_get($p['url'], array('Accept: text/html'));
    if (!$html || !preg_match('/LS\.variants = (\[.*?\]);\s*\n/s', $html, $m)) continue;
    $vs = json_decode($m[1], true);
    if (!is_array($vs)) continue;
    foreach ($vs as $v) {
      $stock = (isset($v['stock']) && $v['stock'] !== null) ? (int)$v['stock'] : null;
      $price = !empty($v['promotional_price_number']) ? (float)$v['promotional_price_number'] : (isset($v['price_number']) ? (float)$v['price_number'] : null);
      $live[(string)$v['id']] = array('stock' => $stock, 'available' => !empty($v['available']), 'price' => $price);
    }
  }
  if ($live) $out['source'] = 'storefront';
}

foreach ($live as $id => $v) $out['variants'][$id] = $v;

$json = json_encode($out, JSON_UNESCAPED_SLASHES);
if ($out['source'] !== 'baseline') @file_put_contents($cache, $json, LOCK_EX);
echo $json;
