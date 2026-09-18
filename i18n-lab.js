/* PADANG · i18n LAB · traduções específicas da página lab.html
 * Carregue DEPOIS de i18n.js. Estende o DICT e re-aplica.
 */
(function() {
  const EXTRA = {
    /* ─ episode titles ─ */
    ep24_t: { pt:"Live no Arkana Festival 2026 · Vale Sagrado dos Incas", en:"Live at Arkana Festival 2026 · Sacred Valley of the Incas", es:"Live en Arkana Festival 2026 · Valle Sagrado de los Incas", de:"Live beim Arkana Festival 2026 · Heiliges Tal der Inka", fr:"Live à Arkana Festival 2026 · Vallée Sacrée des Incas", ja:"Arkana Festival 2026 ライブ · インカの聖なる谷" },
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
    ep24_loc: { pt:"↳ live no peru", en:"↳ live in peru", es:"↳ live en perú", de:"↳ live in peru", fr:"↳ live au pérou", ja:"↳ ペルーでのライブ" },
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

    /* ─ news: vorg live @ arkana festival 2026 (lab ep.24) ─ */
    h_lab_news2: { pt:"o crepúsculo no vale sagrado", en:"twilight in the sacred valley", es:"el crepúsculo en el valle sagrado", de:"dämmerung im heiligen tal", fr:"le crépuscule dans la vallée sacrée", ja:"聖なる谷の黄昏" },
    lab_news2_meta: { pt:"// live no arkana festival 2026 · vorg · vale sagrado dos incas · lab ep.24", en:"// live at arkana festival 2026 · vorg · sacred valley of the incas · lab ep.24", es:"// live en arkana festival 2026 · vorg · valle sagrado de los incas · lab ep.24", de:"// live beim arkana festival 2026 · vorg · heiliges tal der inka · lab ep.24", fr:"// live à arkana festival 2026 · vorg · vallée sacrée des incas · lab ep.24", ja:"// arkana festival 2026 ライブ · vorg · インカの聖なる谷 · lab ep.24" },
    lab_news2_p1: { pt:"Há mais de <b>13 anos</b> o <b>Arkana Festival</b> acontece no <b>Vale Sagrado dos Incas</b>, no Peru — montanha, altitude e uma pista cercada por história. Criado por <b>Mallki</b>, DJ oficial da Padang Records e piloto do <b>EP.19</b> desta mesma série, o Arkana é um dos encontros mais longevos da América do Sul e território conhecido da nossa tripulação: a bandeira Padang já passou por lá com Con Fetti (2022, 2023 e 2024) e com o full set do TEKMALL em 2025.",
                    en:"For more than <b>13 years</b> the <b>Arkana Festival</b> has taken place in the <b>Sacred Valley of the Incas</b>, Peru — mountain, altitude and a dancefloor surrounded by history. Created by <b>Mallki</b>, official Padang Records DJ and pilot of <b>EP.19</b> in this same series, Arkana is one of South America's longest-running gatherings and familiar ground for our crew: the Padang flag has flown there with Con Fetti (2022, 2023 and 2024) and with TEKMALL's full set in 2025.",
                    es:"Desde hace más de <b>13 años</b> el <b>Arkana Festival</b> ocurre en el <b>Valle Sagrado de los Incas</b>, Perú — montaña, altitud y una pista rodeada de historia. Creado por <b>Mallki</b>, DJ oficial de Padang Records y piloto del <b>EP.19</b> de esta misma serie, Arkana es uno de los encuentros más longevos de Sudamérica y territorio conocido para nuestra tripulación: la bandera Padang ya pasó por allí con Con Fetti (2022, 2023 y 2024) y con el full set de TEKMALL en 2025.",
                    de:"Seit mehr als <b>13 Jahren</b> findet das <b>Arkana Festival</b> im <b>Heiligen Tal der Inka</b> in Peru statt — Berge, Höhenluft und ein Dancefloor umgeben von Geschichte. Gegründet von <b>Mallki</b>, offizieller Padang-Records-DJ und Pilot der <b>EP.19</b> dieser Serie, ist Arkana eines der langlebigsten Treffen Südamerikas und vertrautes Terrain für unsere Crew: Die Padang-Flagge wehte dort bereits mit Con Fetti (2022, 2023 und 2024) und mit TEKMALLs Full Set 2025.",
                    fr:"Depuis plus de <b>13 ans</b>, l'<b>Arkana Festival</b> se déroule dans la <b>Vallée Sacrée des Incas</b>, au Pérou — montagne, altitude et un dancefloor entouré d'histoire. Créé par <b>Mallki</b>, DJ officiel de Padang Records et pilote de l'<b>EP.19</b> de cette même série, Arkana est l'un des rassemblements les plus anciens d'Amérique du Sud et un terrain connu de notre équipage : le pavillon Padang y est déjà passé avec Con Fetti (2022, 2023 et 2024) et avec le full set de TEKMALL en 2025.",
                    ja:"<b>Arkana Festival</b> はペルーの<b>インカの聖なる谷</b>で <b>13年以上</b>続いてきた。山、標高、そして歴史に囲まれたダンスフロア。創設者は Padang Records 公式 DJ であり、本シリーズ <b>EP.19</b> のパイロットでもある <b>Mallki</b>。南米で最も長く続くギャザリングのひとつであり、我々のクルーにとっては馴染みの土地でもある——Padang の旗は Con Fetti（2022年・2023年・2024年）とともに、そして2025年の TEKMALL のフルセットとともに、すでにあの谷に翻っている。" },
    lab_news2_p2: { pt:"Em 2026 foi a vez do <b>VORG</b> assumir os decks — e o set caiu no <b>crepúsculo</b>, aquela virada em que a luz do vale some atrás das montanhas e a pista muda de estado. Foi a apresentação <b>mais aclamada de todo o período do dia</b> e um dos momentos mais especiais do evento: grooves rolantes, peso contido e uma leitura precisa da hora exata em que o Arkana troca o sol pela escuridão.",
                    en:"In 2026 it was <b>VORG</b>'s turn behind the decks — and his set landed at <b>twilight</b>, that turning point when the valley's light disappears behind the mountains and the floor changes state. It was the <b>most acclaimed performance of the entire daytime stretch</b> and one of the most special moments of the event: rolling grooves, restrained weight and a precise reading of the exact hour when Arkana trades the sun for the dark.",
                    es:"En 2026 le tocó a <b>VORG</b> tomar los decks — y el set cayó en el <b>crepúsculo</b>, ese giro en que la luz del valle desaparece detrás de las montañas y la pista cambia de estado. Fue la presentación <b>más aclamada de todo el período diurno</b> y uno de los momentos más especiales del evento: grooves rodantes, peso contenido y una lectura precisa de la hora exacta en que Arkana cambia el sol por la oscuridad.",
                    de:"2026 stand <b>VORG</b> an den Decks — und sein Set fiel in die <b>Dämmerung</b>, jenen Moment, in dem das Licht des Tals hinter den Bergen verschwindet und der Floor seinen Zustand wechselt. Es war der <b>meistgefeierte Auftritt des gesamten Tagesabschnitts</b> und einer der besondersten Momente des Events: rollende Grooves, zurückgehaltene Wucht und ein präzises Gespür für genau die Stunde, in der Arkana die Sonne gegen die Dunkelheit tauscht.",
                    fr:"En 2026, c'était au tour de <b>VORG</b> de prendre les platines — et son set est tombé au <b>crépuscule</b>, ce basculement où la lumière de la vallée disparaît derrière les montagnes et où le floor change d'état. Ce fut la performance <b>la plus acclamée de toute la période diurne</b> et l'un des moments les plus spéciaux de l'événement : grooves roulants, puissance retenue et une lecture précise de l'heure exacte où Arkana troque le soleil contre l'obscurité.",
                    ja:"2026年、デッキに立ったのは <b>VORG</b> だった。彼のセットが訪れたのは<b>黄昏</b>——谷の光が山の向こうへ消え、フロアの状態が切り替わるあの転換点。<b>日中の時間帯を通じて最も喝采を浴びたパフォーマンス</b>であり、イベント全体でも最も特別な瞬間のひとつとなった。転がるグルーヴ、抑制された重さ、そして Arkana が太陽を闇と交換する、その正確な時刻の読み。" },
    lab_news2_p3: { pt:"<b>Robson Morche</b>, artista residente da Padang, levou pro Peru o mesmo psytrance zenonesque e dark progressive que assina no <b>Ponto de Aglutinação</b> (2026) e nas noites de Earthdance. O registro completo — <b>1h37 de gravação ao vivo</b> — vira agora o <b>EP.24 da Lab Series</b>, direto do Vale Sagrado pros seus fones.",
                    en:"<b>Robson Morche</b>, Padang resident artist, took to Peru the same zenonesque psytrance and dark progressive he signs on <b>Ponto de Aglutinação</b> (2026) and across Earthdance nights. The full recording — <b>1h37 of live capture</b> — now becomes <b>Lab Series EP.24</b>, straight from the Sacred Valley to your headphones.",
                    es:"<b>Robson Morche</b>, artista residente de Padang, llevó a Perú el mismo psytrance zenonesque y dark progressive que firma en <b>Ponto de Aglutinação</b> (2026) y en las noches de Earthdance. El registro completo — <b>1h37 de grabación en vivo</b> — se convierte ahora en el <b>EP.24 de la Lab Series</b>, directo del Valle Sagrado a tus auriculares.",
                    de:"<b>Robson Morche</b>, Resident-Artist von Padang, brachte nach Peru denselben zenonesken Psytrance und Dark Progressive, den er auf <b>Ponto de Aglutinação</b> (2026) und in den Earthdance-Nächten signiert. Die vollständige Aufnahme — <b>1h37 Live-Mitschnitt</b> — wird nun zur <b>Lab Series EP.24</b>, direkt aus dem Heiligen Tal in deine Kopfhörer.",
                    fr:"<b>Robson Morche</b>, artiste résident de Padang, a emporté au Pérou le même psytrance zenonesque et dark progressive qu'il signe sur <b>Ponto de Aglutinação</b> (2026) et lors des nuits Earthdance. L'enregistrement complet — <b>1h37 de captation live</b> — devient maintenant l'<b>EP.24 de la Lab Series</b>, directement de la Vallée Sacrée à vos casques.",
                    ja:"Padang のレジデントアーティスト <b>Robson Morche</b> は、<b>Ponto de Aglutinação</b>（2026年）や Earthdance の夜で刻んできたゼノネスクな psytrance とダークプログレッシブを、そのままペルーへ持ち込んだ。<b>1時間37分のライブ録音</b>のフル音源が、いま <b>Lab Series EP.24</b> として、聖なる谷からあなたのヘッドフォンへ届く。" },
    lab_news2_quote: { pt:"\"O vale apagou a luz.<br>A pista não pediu para acender de novo.\"",
                       en:"\"The valley switched off the light.<br>The floor never asked for it back.\"",
                       es:"\"El valle apagó la luz.<br>La pista no pidió que volviera.\"",
                       de:"\"Das Tal löschte das Licht.<br>Der Floor bat nie darum, es zurückzubekommen.\"",
                       fr:"« La vallée a éteint la lumière.<br>Le floor n'a jamais demandé à la rallumer. »",
                       ja:"「谷が明かりを消した。<br>フロアは、それを戻してくれとは言わなかった。」" },
    lab_news2_listen: { pt:"↳ ouça o ep.24 no soundcloud", en:"↳ listen to ep.24 on soundcloud", es:"↳ escucha el ep.24 en soundcloud", de:"↳ ep.24 auf soundcloud hören", fr:"↳ écouter l'ep.24 sur soundcloud", ja:"↳ ep.24 を soundcloud で聴く" },

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
