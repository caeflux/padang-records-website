/* PADANG · i18n LAB · traduções específicas da página lab.html
 * Carregue DEPOIS de i18n.js. Estende o DICT e re-aplica.
 */
(function() {
  const EXTRA = {
    /* ─ episode titles ─ */
    ep23_t: { pt:"10 Anos na Padang · 2016 — 2026", en:"10 Years on Padang · 2016 — 2026", es:"10 Años en Padang · 2016 — 2026", de:"10 Jahre auf Padang · 2016 — 2026", fr:"10 Ans sur Padang · 2016 — 2026", ja:"Padang での10年 · 2016 — 2026" },
    ep22_t: { pt:"Live Recorded at Syncronic — Padang × Blacklite", en:"Live Recorded at Syncronic — Padang × Blacklite", es:"Live grabado en Syncronic — Padang × Blacklite", de:"Live aufgenommen bei Syncronic — Padang × Blacklite", fr:"Enregistré live à Syncronic — Padang × Blacklite", ja:"Syncronic でライブ録音 — Padang × Blacklite" },
    ep21_t: { pt:"Live Recorded at Syncronic — Padang x Blacklite", en:"Live Recorded at Syncronic — Padang × Blacklite", es:"Live grabado en Syncronic — Padang × Blacklite", de:"Live aufgenommen bei Syncronic — Padang × Blacklite", fr:"Enregistré live à Syncronic — Padang × Blacklite", ja:"Syncronic でライブ録音 — Padang × Blacklite" },
    ep20_t: { pt:"Roster Padang · França", en:"Padang Roster · France", es:"Roster Padang · Francia", de:"Padang-Roster · Frankreich", fr:"Roster Padang · France", ja:"Padang ロスター · フランス" },
    ep19_t: { pt:"Hypnotic Sessions · Label DJ", en:"Hypnotic Sessions · Label DJ", es:"Hypnotic Sessions · Label DJ", de:"Hypnotic Sessions · Label-DJ", fr:"Hypnotic Sessions · Label DJ", ja:"Hypnotic Sessions · レーベル DJ" },
    ep18_t: { pt:"@ Earthdance 2025", en:"@ Earthdance 2025", es:"@ Earthdance 2025", de:"@ Earthdance 2025", fr:"@ Earthdance 2025", ja:"@ Earthdance 2025" },
    ep17_t: { pt:"Roster Padang · Hungria", en:"Padang Roster · Hungary", es:"Roster Padang · Hungría", de:"Padang-Roster · Ungarn", fr:"Roster Padang · Hongrie", ja:"Padang ロスター · ハンガリー" },
    ep11_t: { pt:"Curadora Technomad · Label DJ", en:"Technomad curator · Label DJ", es:"Curadora Technomad · Label DJ", de:"Technomad-Kuratorin · Label-DJ", fr:"Curatrice Technomad · Label DJ", ja:"Technomad キュレーター · レーベル DJ" },
    ep8_t:  { pt:"Live Set · México", en:"Live Set · Mexico", es:"Live Set · México", de:"Live-Set · Mexiko", fr:"Live Set · Mexique", ja:"ライブセット · メキシコ" },
    ep1_t:  { pt:"Padang Lab Series · Estreia", en:"Padang Lab Series · Premiere", es:"Padang Lab Series · Estreno", de:"Padang Lab Series · Premiere", fr:"Padang Lab Series · Première", ja:"Padang Lab Series · 初回" },

    /* ─ footer ft text per episode ─ */
    ep21_ft: { pt:"Padang × Blacklite", en:"Padang × Blacklite", es:"Padang × Blacklite", de:"Padang × Blacklite", fr:"Padang × Blacklite", ja:"Padang × Blacklite" },
    ep20_ft: { pt:"France", en:"France", es:"Francia", de:"Frankreich", fr:"France", ja:"フランス" },
    ep19_ft: { pt:"Arkana Festival founder", en:"Arkana Festival founder", es:"Fundador del Arkana Festival", de:"Arkana-Festival-Gründer", fr:"Fondateur d'Arkana Festival", ja:"Arkana Festival 創設者" },
    ep18_ft: { pt:"b2b set", en:"b2b set", es:"b2b set", de:"b2b-Set", fr:"set b2b", ja:"b2b セット" },
    ep17_ft: { pt:"Hungria", en:"Hungary", es:"Hungría", de:"Ungarn", fr:"Hongrie", ja:"ハンガリー" },
    ep11_ft: { pt:"Portugal", en:"Portugal", es:"Portugal", de:"Portugal", fr:"Portugal", ja:"ポルトガル" },
    ep8_ft:  { pt:"Mexico", en:"Mexico", es:"México", de:"Mexiko", fr:"Mexique", ja:"メキシコ" },
    ep1_ft:  { pt:"Greece · primeira sessão", en:"Greece · first session", es:"Grecia · primera sesión", de:"Griechenland · erste Session", fr:"Grèce · première session", ja:"ギリシャ · 初セッション" },

    /* ─ live tags ─ */
    lab_tag_live: { pt:"● live", en:"● live", es:"● en vivo", de:"● live", fr:"● live", ja:"● ライブ" },
    lab_tag_live_rec: { pt:"● live recorded", en:"● live recorded", es:"● grabado en vivo", de:"● live aufgenommen", fr:"● live enregistré", ja:"● ライブ録音" },

    /* ─ meta locations (right column) ─ */
    ep23_loc: { pt:"↳ set de aniversário", en:"↳ anniversary set", es:"↳ set de aniversario", de:"↳ jubiläums-set", fr:"↳ set anniversaire", ja:"↳ 記念セット" },
    ep22_loc: { pt:"↳ gravado ao vivo", en:"↳ live recorded", es:"↳ grabado en vivo", de:"↳ live aufgenommen", fr:"↳ live enregistré", ja:"↳ ライブ録音" },
    ep21_loc: { pt:"↳ syncronic", en:"↳ syncronic", es:"↳ syncronic", de:"↳ syncronic", fr:"↳ syncronic", ja:"↳ syncronic" },
    ep20_loc: { pt:"↳ studio set", en:"↳ studio set", es:"↳ studio set", de:"↳ studio-set", fr:"↳ studio set", ja:"↳ スタジオセット" },
    ep19_loc: { pt:"↳ peru / barcelona", en:"↳ peru / barcelona", es:"↳ perú / barcelona", de:"↳ peru / barcelona", fr:"↳ pérou / barcelone", ja:"↳ ペルー / バルセロナ" },
    ep18_loc: { pt:"↳ earthdance", en:"↳ earthdance", es:"↳ earthdance", de:"↳ earthdance", fr:"↳ earthdance", ja:"↳ earthdance" },
    ep17_loc: { pt:"↳ studio set", en:"↳ studio set", es:"↳ studio set", de:"↳ studio-set", fr:"↳ studio set", ja:"↳ スタジオセット" },
    ep11_loc: { pt:"↳ portugal", en:"↳ portugal", es:"↳ portugal", de:"↳ portugal", fr:"↳ portugal", ja:"↳ ポルトガル" },
    ep8_loc:  { pt:"↳ mexico city", en:"↳ mexico city", es:"↳ ciudad de méxico", de:"↳ mexiko-stadt", fr:"↳ mexico", ja:"↳ メキシコシティ" },
    ep1_loc:  { pt:"↳ grécia · ep.1", en:"↳ greece · ep.1", es:"↳ grecia · ep.1", de:"↳ griechenland · ep.1", fr:"↳ grèce · ep.1", ja:"↳ ギリシャ · ep.1" },

    /* ─ news: noctusense 10 years (label milestone) ─ */
    h_lab_news: { pt:"dez anos sob a mesma bandeira", en:"ten years beneath the same flag", es:"diez años bajo la misma bandera", de:"zehn jahre unter derselben flagge", fr:"dix ans sous le même pavillon", ja:"同じ旗の下で10年" },
    lab_news_meta: { pt:"// marco do selo · noctusense · 2016 — 2026 · lab ep.23", en:"// label milestone · noctusense · 2016 — 2026 · lab ep.23", es:"// hito del sello · noctusense · 2016 — 2026 · lab ep.23", de:"// label-meilenstein · noctusense · 2016 — 2026 · lab ep.23", fr:"// jalon du label · noctusense · 2016 — 2026 · lab ep.23", ja:"// レーベルの節目 · noctusense · 2016 — 2026 · lab ep.23" },
    lab_news_p1: { pt:"De <b>2016 a 2026</b>, o Noctusense faz parte da história da Padang Records — não só como artista, mas como uma das mentes que ajudaram a moldar um capítulo importante do nosso som. O <b>EP.23 da Lab Series</b> marca a data: dez anos sob a mesma bandeira.",
                   en:"From <b>2016 to 2026</b>, Noctusense has been part of the Padang Records story — not only as an artist, but as one of the minds that helped shape an important chapter of our sound. <b>Lab Series EP.23</b> marks the milestone: ten years beneath the same flag.",
                   es:"De <b>2016 a 2026</b>, Noctusense ha sido parte de la historia de Padang Records — no solo como artista, sino como una de las mentes que ayudaron a moldear un capítulo importante de nuestro sonido. El <b>EP.23 de la Lab Series</b> marca el hito: diez años bajo la misma bandera.",
                   de:"Von <b>2016 bis 2026</b> ist Noctusense Teil der Geschichte von Padang Records — nicht nur als Künstler, sondern als einer der Köpfe, die ein wichtiges Kapitel unseres Sounds geprägt haben. <b>Lab Series EP.23</b> markiert den Meilenstein: zehn Jahre unter derselben Flagge.",
                   fr:"De <b>2016 à 2026</b>, Noctusense fait partie de l'histoire de Padang Records — pas seulement comme artiste, mais comme l'un des esprits qui ont façonné un chapitre important de notre son. Le <b>EP.23 de la Lab Series</b> marque le jalon : dix ans sous le même pavillon.",
                   ja:"<b>2016年から2026年</b>まで、Noctusense は Padang Records の物語の一部であり続けてきた——アーティストとしてだけでなく、我々のサウンドの重要な章を形づくった頭脳のひとりとして。<b>Lab Series EP.23</b> はその節目を刻む：同じ旗の下での10年。" },
    lab_news_p2: { pt:"Como compilador e curador da <b>Haunted Spectre</b>, nossa série de compilações de dark progressive mais aclamada, Ronaldo teve papel fundamental em empurrar a Padang para novos territórios. Com seus lançamentos e continuidade, a Haunted Spectre se tornou mais que uma série — ajudou a definir uma era do selo e o caminho mais sombrio que escolhemos explorar.",
                   en:"As compiler and curator of <b>Haunted Spectre</b>, our most acclaimed dark progressive compilation series, Ronaldo played a fundamental role in pushing Padang into new territory. Through its releases and continuity, Haunted Spectre became more than a series — it helped define an era of the label and the darker path we chose to explore.",
                   es:"Como compilador y curador de <b>Haunted Spectre</b>, nuestra serie de compilaciones de dark progressive más aclamada, Ronaldo jugó un papel fundamental en llevar a Padang a nuevos territorios. Con sus lanzamientos y continuidad, Haunted Spectre se volvió más que una serie — ayudó a definir una era del sello y el camino más oscuro que elegimos explorar.",
                   de:"Als Compiler und Kurator von <b>Haunted Spectre</b>, unserer meistgefeierten Dark-Progressive-Compilation-Reihe, spielte Ronaldo eine fundamentale Rolle dabei, Padang auf neues Terrain zu führen. Durch ihre Releases und Kontinuität wurde Haunted Spectre mehr als eine Reihe — sie half, eine Ära des Labels zu definieren und den dunkleren Weg zu prägen, den wir zu erkunden beschlossen.",
                   fr:"Compilateur et curateur de <b>Haunted Spectre</b>, notre série de compilations dark progressive la plus acclamée, Ronaldo a joué un rôle fondamental pour pousser Padang vers de nouveaux territoires. Par ses sorties et sa continuité, Haunted Spectre est devenue plus qu'une série — elle a contribué à définir une ère du label et cette voie plus sombre que nous avons choisi d'explorer.",
                   ja:"最も高い評価を受けるダークプログレッシブ・コンピレーション・シリーズ <b>Haunted Spectre</b> のコンパイラー兼キュレーターとして、Ronaldo は Padang を新たな領域へ押し進める根本的な役割を果たした。そのリリースと継続を通じて、Haunted Spectre は単なるシリーズを超え、レーベルの一時代と、我々が探求を選んだより深い闇の道を定義する助けとなった。" },
    lab_news_p3: { pt:"Do Nordeste do Brasil, o Noctusense segue sendo um dos poucos piratas a carregar a bandeira Padang pela região, estendendo essa história muito além das nossas águas habituais. Dez anos de música, amizade, descoberta e visão compartilhada.",
                   en:"From Brazil's Northeast, Noctusense has remained one of the few pirates carrying the Padang flag across the region, extending this story far beyond our usual waters. Ten years of music, friendship, discovery and shared vision.",
                   es:"Desde el Nordeste de Brasil, Noctusense sigue siendo uno de los pocos piratas que llevan la bandera Padang por la región, extendiendo esta historia mucho más allá de nuestras aguas habituales. Diez años de música, amistad, descubrimiento y visión compartida.",
                   de:"Aus dem Nordosten Brasiliens bleibt Noctusense einer der wenigen Piraten, die die Padang-Flagge durch die Region tragen und diese Geschichte weit über unsere gewohnten Gewässer hinaustragen. Zehn Jahre Musik, Freundschaft, Entdeckung und geteilte Vision.",
                   fr:"Depuis le Nordeste du Brésil, Noctusense reste l'un des rares pirates à porter le pavillon Padang à travers la région, prolongeant cette histoire bien au-delà de nos eaux habituelles. Dix ans de musique, d'amitié, de découverte et de vision partagée.",
                   ja:"ブラジル北東部から、Noctusense は Padang の旗をこの地域で掲げ続ける数少ない海賊のひとりであり、この物語を我々のいつもの海のはるか先まで広げている。音楽、友情、発見、共有されたビジョンの10年。" },
    lab_news_quote: { pt:"\"Algumas jornadas não merecem monumento.<br>Merecem ser tocadas no último volume.\"",
                      en:"\"Some journeys deserve no monument.<br>They deserve to be played loud.\"",
                      es:"\"Algunos viajes no merecen monumento.<br>Merecen sonar a todo volumen.\"",
                      de:"\"Manche Reisen verdienen kein Denkmal.<br>Sie verdienen es, laut gespielt zu werden.\"",
                      fr:"« Certains voyages ne méritent pas de monument.<br>Ils méritent d'être joués à plein volume. »",
                      ja:"「記念碑には値しない旅もある。<br>大音量で鳴らされるに値する旅だ。」" },
    lab_news_listen: { pt:"↳ ouça o ep.23 no soundcloud", en:"↳ listen to ep.23 on soundcloud", es:"↳ escucha el ep.23 en soundcloud", de:"↳ ep.23 auf soundcloud hören", fr:"↳ écoute l'ep.23 sur soundcloud", ja:"↳ ep.23 を soundcloud で聴く" },

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
