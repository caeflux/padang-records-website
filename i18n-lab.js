/* PADANG · i18n LAB · traduções específicas da página lab.html
 * Carregue DEPOIS de i18n.js. Estende o DICT e re-aplica.
 */
(function() {
  const EXTRA = {
    /* ─ episode titles ─ */
    ep21_t: { pt:"Live Recorded at Syncronic — Padang x Blacklite", en:"Live Recorded at Syncronic — Padang × Blacklite", es:"Live grabado en Syncronic — Padang × Blacklite", de:"Live aufgenommen bei Syncronic — Padang × Blacklite", fr:"Enregistré live à Syncronic — Padang × Blacklite", ja:"Syncronic でライブ録音 — Padang × Blacklite" },
    ep20_t: { pt:"Roster Padang · França", en:"Padang Roster · France", es:"Roster Padang · Francia", de:"Padang-Roster · Frankreich", fr:"Roster Padang · France", ja:"Padang ロスター · フランス" },
    ep19_t: { pt:"Hypnotic Sessions · Label DJ", en:"Hypnotic Sessions · Label DJ", es:"Hypnotic Sessions · Label DJ", de:"Hypnotic Sessions · Label-DJ", fr:"Hypnotic Sessions · Label DJ", ja:"Hypnotic Sessions · レーベル DJ" },
    ep18_t: { pt:"@ Earthdance 2025", en:"@ Earthdance 2025", es:"@ Earthdance 2025", de:"@ Earthdance 2025", fr:"@ Earthdance 2025", ja:"@ Earthdance 2025" },
    ep17_t: { pt:"Roster Padang · Bélgica", en:"Padang Roster · Hungary", es:"Roster Padang · Hungría", de:"Padang-Roster · Ungarn", fr:"Roster Padang · Hongrie", ja:"Padang ロスター · ハンガリー" },
    ep11_t: { pt:"Curadora Technomad · Label DJ", en:"Technomad curator · Label DJ", es:"Curadora Technomad · Label DJ", de:"Technomad-Kuratorin · Label-DJ", fr:"Curatrice Technomad · Label DJ", ja:"Technomad キュレーター · レーベル DJ" },
    ep8_t:  { pt:"Live Set · México", en:"Live Set · Mexico", es:"Live Set · México", de:"Live-Set · Mexiko", fr:"Live Set · Mexique", ja:"ライブセット · メキシコ" },
    ep1_t:  { pt:"Padang Lab Series · Estreia", en:"Padang Lab Series · Premiere", es:"Padang Lab Series · Estreno", de:"Padang Lab Series · Premiere", fr:"Padang Lab Series · Première", ja:"Padang Lab Series · 初回" },

    /* ─ footer ft text per episode ─ */
    ep21_ft: { pt:"Padang × Blacklite", en:"Padang × Blacklite", es:"Padang × Blacklite", de:"Padang × Blacklite", fr:"Padang × Blacklite", ja:"Padang × Blacklite" },
    ep20_ft: { pt:"France", en:"France", es:"Francia", de:"Frankreich", fr:"France", ja:"フランス" },
    ep19_ft: { pt:"Arkana Festival founder", en:"Arkana Festival founder", es:"Fundador del Arkana Festival", de:"Arkana-Festival-Gründer", fr:"Fondateur d'Arkana Festival", ja:"Arkana Festival 創設者" },
    ep18_ft: { pt:"b2b set", en:"b2b set", es:"b2b set", de:"b2b-Set", fr:"set b2b", ja:"b2b セット" },
    ep17_ft: { pt:"Belgium", en:"Hungary", es:"Hungría", de:"Ungarn", fr:"Hongrie", ja:"ハンガリー" },
    ep11_ft: { pt:"Portugal", en:"Portugal", es:"Portugal", de:"Portugal", fr:"Portugal", ja:"ポルトガル" },
    ep8_ft:  { pt:"Mexico", en:"Mexico", es:"México", de:"Mexiko", fr:"Mexique", ja:"メキシコ" },
    ep1_ft:  { pt:"Greece · primeira sessão", en:"Greece · first session", es:"Grecia · primera sesión", de:"Griechenland · erste Session", fr:"Grèce · première session", ja:"ギリシャ · 初セッション" },

    /* ─ live tags ─ */
    lab_tag_live: { pt:"● live", en:"● live", es:"● en vivo", de:"● live", fr:"● live", ja:"● ライブ" },
    lab_tag_live_rec: { pt:"● live recorded", en:"● live recorded", es:"● grabado en vivo", de:"● live aufgenommen", fr:"● live enregistré", ja:"● ライブ録音" },

    /* ─ meta locations (right column) ─ */
    ep21_loc: { pt:"↳ syncronic", en:"↳ syncronic", es:"↳ syncronic", de:"↳ syncronic", fr:"↳ syncronic", ja:"↳ syncronic" },
    ep20_loc: { pt:"↳ studio set", en:"↳ studio set", es:"↳ studio set", de:"↳ studio-set", fr:"↳ studio set", ja:"↳ スタジオセット" },
    ep19_loc: { pt:"↳ peru / barcelona", en:"↳ peru / barcelona", es:"↳ perú / barcelona", de:"↳ peru / barcelona", fr:"↳ pérou / barcelone", ja:"↳ ペルー / バルセロナ" },
    ep18_loc: { pt:"↳ earthdance", en:"↳ earthdance", es:"↳ earthdance", de:"↳ earthdance", fr:"↳ earthdance", ja:"↳ earthdance" },
    ep17_loc: { pt:"↳ studio set", en:"↳ studio set", es:"↳ studio set", de:"↳ studio-set", fr:"↳ studio set", ja:"↳ スタジオセット" },
    ep11_loc: { pt:"↳ portugal", en:"↳ portugal", es:"↳ portugal", de:"↳ portugal", fr:"↳ portugal", ja:"↳ ポルトガル" },
    ep8_loc:  { pt:"↳ mexico city", en:"↳ mexico city", es:"↳ ciudad de méxico", de:"↳ mexiko-stadt", fr:"↳ mexico", ja:"↳ メキシコシティ" },
    ep1_loc:  { pt:"↳ grécia · ep.1", en:"↳ greece · ep.1", es:"↳ grecia · ep.1", de:"↳ griechenland · ep.1", fr:"↳ grèce · ep.1", ja:"↳ ギリシャ · ep.1" },

    /* ─ miss box (bottom explanation) ─ */
    lab_miss_h: { pt:"// episódios EP.2 — EP.7 · EP.9 — EP.10 · EP.12 — EP.16", en:"// episodes EP.2 — EP.7 · EP.9 — EP.10 · EP.12 — EP.16", es:"// episodios EP.2 — EP.7 · EP.9 — EP.10 · EP.12 — EP.16", de:"// Folgen EP.2 — EP.7 · EP.9 — EP.10 · EP.12 — EP.16", fr:"// épisodes EP.2 — EP.7 · EP.9 — EP.10 · EP.12 — EP.16", ja:"// エピソード EP.2 — EP.7 · EP.9 — EP.10 · EP.12 — EP.16" },
    lab_miss_p: { pt:'Estes 13 episódios da Lab Series estão disponíveis na playlist completa no topo desta página. Para ver/ouvir todos, use o <b>player completo</b> acima ou abra a <b><a href="https://soundcloud.com/padangrec/sets/padang-labs" target="_blank" rel="noopener" style="color:var(--neon-1)">playlist no SoundCloud →</a></b>. Conforme novos episódios forem mapeados artista-por-artista, eles vêm pra esta vitrine.',
                  en:'These 13 Lab Series episodes are available in the full playlist at the top of this page. To see/hear all, use the <b>full player</b> above or open the <b><a href="https://soundcloud.com/padangrec/sets/padang-labs" target="_blank" rel="noopener" style="color:var(--neon-1)">playlist on SoundCloud →</a></b>. As new episodes are mapped artist-by-artist, they\'ll come to this showcase.',
                  es:'Estos 13 episodios de Lab Series están disponibles en la playlist completa al inicio de esta página. Para ver/escuchar todos, usa el <b>player completo</b> arriba o abre la <b><a href="https://soundcloud.com/padangrec/sets/padang-labs" target="_blank" rel="noopener" style="color:var(--neon-1)">playlist en SoundCloud →</a></b>. Conforme mapeemos nuevos episodios artista-por-artista, vendrán a esta vitrina.',
                  de:'Diese 13 Lab-Series-Folgen sind in der vollständigen Playlist am Anfang dieser Seite verfügbar. Um alle zu sehen/hören, nutze den <b>vollständigen Player</b> oben oder öffne die <b><a href="https://soundcloud.com/padangrec/sets/padang-labs" target="_blank" rel="noopener" style="color:var(--neon-1)">Playlist auf SoundCloud →</a></b>. Sobald neue Folgen Künstler für Künstler kartiert sind, kommen sie in diese Vitrine.',
                  fr:'Ces 13 épisodes de Lab Series sont disponibles dans la playlist complète en haut de cette page. Pour voir/écouter tous, utilise le <b>player complet</b> ci-dessus ou ouvre la <b><a href="https://soundcloud.com/padangrec/sets/padang-labs" target="_blank" rel="noopener" style="color:var(--neon-1)">playlist sur SoundCloud →</a></b>. Au fur et à mesure que de nouveaux épisodes sont cartographiés artiste par artiste, ils arrivent dans cette vitrine.',
                  ja:'これら13の Lab Series エピソードは、このページ上部の完全プレイリストで視聴できます。すべてを見る／聴くには、上の<b>フル・プレイヤー</b>を使うか、<b><a href="https://soundcloud.com/padangrec/sets/padang-labs" target="_blank" rel="noopener" style="color:var(--neon-1)">SoundCloud のプレイリスト →</a></b>を開いてください。新しいエピソードがアーティストごとにマッピングされると、このショーケースに加わります。' }
  };

  function extend() {
    if (!window.PADANG_I18N || !window.PADANG_I18N.dict) {
      return setTimeout(extend, 50);
    }
    Object.assign(window.PADANG_I18N.dict, EXTRA);
    var lang = document.documentElement.lang || 'pt';
    if (window.PADANG_I18N.apply) window.PADANG_I18N.apply(lang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', extend);
  } else {
    extend();
  }
})();
