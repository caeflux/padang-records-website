/* PADANG · i18n · 6 idiomas
 * keys-driven · usa atributo data-i18n="key" nos elementos
 * persistência em localStorage · auto-detecta browser
 */
(function() {
  'use strict';

  const DICT = {
    /* ─ nav ─ */
    nav_selo:      { pt:"Selo", en:"Label", es:"Sello", de:"Label", fr:"Label", ja:"レーベル" },
    nav_releases:  { pt:"Releases", en:"Releases", es:"Lanzamientos", de:"Releases", fr:"Sorties", ja:"リリース" },
    nav_roster:    { pt:"Roster", en:"Roster", es:"Plantel", de:"Roster", fr:"Roster", ja:"ロスター" },
    nav_lab:       { pt:"Lab Series", en:"Lab Series", es:"Lab Series", de:"Lab Series", fr:"Lab Series", ja:"Lab Series" },
    nav_padangtv:  { pt:"PadangTV", en:"PadangTV", es:"PadangTV", de:"PadangTV", fr:"PadangTV", ja:"PadangTV" },
    nav_about:     { pt:"Sobre", en:"About", es:"Acerca", de:"Über", fr:"À propos", ja:"概要" },
    nav_events:    { pt:"Eventos", en:"Events", es:"Eventos", de:"Veranstaltungen", fr:"Événements", ja:"イベント" },
    nav_demo:      { pt:"Demo", en:"Demo", es:"Demo", de:"Demo", fr:"Démo", ja:"デモ" },
    nav_shop:      { pt:"Shop", en:"Shop", es:"Tienda", de:"Shop", fr:"Boutique", ja:"ショップ" },

    /* ─ hero ─ */
    /* hero_tagline removido — sem estilos no hero */
    hero_transmitting: { pt:"transmitting · world wild · since 2013", en:"transmitting · world wild · since 2013", es:"transmitiendo · world wild · desde 2013", de:"sendet · world wild · seit 2013", fr:"transmission · world wild · depuis 2013", ja:"送信中 · world wild · 2013年から" },
    hero_roster_sub: { pt:'artistas <span>·</span> bio <span>·</span> contato <span>·</span> soundcloud <span>·</span> padangtv',
                       en:'artists <span>·</span> bio <span>·</span> contact <span>·</span> soundcloud <span>·</span> padangtv',
                       es:'artistas <span>·</span> bio <span>·</span> contacto <span>·</span> soundcloud <span>·</span> padangtv',
                       de:'künstler <span>·</span> bio <span>·</span> kontakt <span>·</span> soundcloud <span>·</span> padangtv',
                       fr:'artistes <span>·</span> bio <span>·</span> contact <span>·</span> soundcloud <span>·</span> padangtv',
                       ja:'アーティスト <span>·</span> バイオ <span>·</span> 連絡先 <span>·</span> soundcloud <span>·</span> padangtv' },
    hero_lab_lbl:  { pt:"● série oficial · since 2019", en:"● official series · since 2019", es:"● serie oficial · desde 2019", de:"● offizielle serie · seit 2019", fr:"● série officielle · depuis 2019", ja:"● 公式シリーズ · 2019年から" },
    hero_lab_sub:  { pt:"dj sets · live recordings · hypnotic sessions", en:"dj sets · live recordings · hypnotic sessions", es:"dj sets · grabaciones en vivo · sesiones hipnóticas", de:"dj sets · live-aufnahmen · hypnotische sessions", fr:"dj sets · enregistrements live · sessions hypnotiques", ja:"DJセット · ライブ録音 · ヒプノティック・セッション" },
    hero_about_sub:{ pt:"o selo · a história · o som", en:"the label · the history · the sound", es:"el sello · la historia · el sonido", de:"das label · die geschichte · der sound", fr:"le label · l'histoire · le son", ja:"レーベル · 歴史 · サウンド" },
    hero_events_sub:{ pt:'festivais <span>·</span> showcases <span>·</span> lineups',
                      en:'festivals <span>·</span> showcases <span>·</span> lineups',
                      es:'festivales <span>·</span> showcases <span>·</span> line-ups',
                      de:'festivals <span>·</span> showcases <span>·</span> lineups',
                      fr:'festivals <span>·</span> showcases <span>·</span> programmation',
                      ja:'フェスティバル <span>·</span> ショーケース <span>·</span> ラインナップ' },
    hero_demo_sub: { pt:"envie sua demo <span>·</span> abriremos quando soar certo", en:"send your demo <span>·</span> we open when it lands", es:"envía tu demo <span>·</span> abrimos cuando suene bien", de:"sende deine demo <span>·</span> wir öffnen wenn’s passt", fr:"envoie ta démo <span>·</span> on ouvre quand ça résonne", ja:"デモを送ろう <span>·</span> 響いたら開く" },
    hero_shop_sub: { pt:"music · merch · stickers · vinyl", en:"music · merch · stickers · vinyl", es:"música · merch · stickers · vinilos", de:"musik · merch · sticker · vinyl", fr:"musique · merch · stickers · vinyle", ja:"音楽 · グッズ · ステッカー · ヴァイナル" },
    hero_shop_badge:{ pt:"● padang × spreadshirt · print on demand", en:"● padang × spreadshirt · print on demand", es:"● padang × spreadshirt · impresión bajo demanda", de:"● padang × spreadshirt · print on demand", fr:"● padang × spreadshirt · impression à la demande", ja:"● padang × spreadshirt · オンデマンド印刷" },

    footer_motto: { pt:"save your ears from sameness", en:"save your ears from sameness", es:"save your ears from sameness", de:"save your ears from sameness", fr:"save your ears from sameness", ja:"save your ears from sameness" },

    /* ─ section titles ─ */
    h_signal:        { pt:"signal", en:"signal", es:"señal", de:"signal", fr:"signal", ja:"シグナル" },
    h_releases:      { pt:"releases", en:"releases", es:"lanzamientos", de:"releases", fr:"sorties", ja:"リリース" },
    h_roster:        { pt:"roster", en:"roster", es:"plantel", de:"roster", fr:"roster", ja:"ロスター" },
    h_latest_signal: { pt:"latest signal", en:"latest signal", es:"señal más reciente", de:"neuestes signal", fr:"dernier signal", ja:"最新シグナル" },
    h_padangtv:      { pt:"padangtv", en:"padangtv", es:"padangtv", de:"padangtv", fr:"padangtv", ja:"padangtv" },
    h_manifesto:     { pt:"manifesto", en:"manifesto", es:"manifiesto", de:"manifest", fr:"manifeste", ja:"マニフェスト" },
    h_timeline:      { pt:"timeline", en:"timeline", es:"línea del tiempo", de:"zeitleiste", fr:"chronologie", ja:"年表" },
    h_numbers:       { pt:"números", en:"numbers", es:"números", de:"zahlen", fr:"chiffres", ja:"数字" },
    h_featured_eps:  { pt:"featured episodes", en:"featured episodes", es:"episodios destacados", de:"ausgewählte folgen", fr:"épisodes en vedette", ja:"注目のエピソード" },
    h_next_2026:     { pt:"próximos · 2026", en:"upcoming · 2026", es:"próximos · 2026", de:"kommend · 2026", fr:"à venir · 2026", ja:"今後 · 2026" },
    h_history_2025:  { pt:"histórico · 2025", en:"history · 2025", es:"histórico · 2025", de:"verlauf · 2025", fr:"historique · 2025", ja:"履歴 · 2025" },
    h_how_to_send:   { pt:"como enviar", en:"how to send", es:"cómo enviar", de:"so sendet ihr", fr:"comment envoyer", ja:"送信方法" },
    h_designs:       { pt:"designs oficiais", en:"official designs", es:"diseños oficiales", de:"offizielle designs", fr:"designs officiels", ja:"公式デザイン" },
    h_browse_live:   { pt:"browse · iframe live", en:"browse · live iframe", es:"navegar · iframe en vivo", de:"durchsuchen · live iframe", fr:"parcourir · iframe live", ja:"ブラウズ · ライブ iframe" },
    h_by_category:   { pt:"por categoria", en:"by category", es:"por categoría", de:"nach kategorie", fr:"par catégorie", ja:"カテゴリー別" },
    h_other_channels:{ pt:"outros canais", en:"other channels", es:"otros canales", de:"weitere kanäle", fr:"autres canaux", ja:"その他のチャンネル" },
    h_where_to_buy:  { pt:"onde comprar", en:"where to buy", es:"dónde comprar", de:"wo kaufen", fr:"où acheter", ja:"購入先" },

    /* ─ manifesto ─ */
    manifesto_body: {
      pt:'Padang Records é um porto para <mark>spiritual beat seekers</mark> — <em>world wild artists</em> esculpindo bass, frequência e ritual entre continentes. Piratas, nômades, aventureiros. Com o underground como alvo e a criatividade como força, emergimos para salvar seus ouvidos da mesmice.',
      en:'Padang Records is a port for <mark>spiritual beat seekers</mark> — <em>world wild artists</em> sculpting bass, frequency and ritual across continents. Pirates, nomads, adventurers. With the underground as our target and creativity for strength, we emerge to save your ears from sameness.',
      es:'Padang Records es un puerto para <mark>spiritual beat seekers</mark> — <em>world wild artists</em> esculpiendo bajo, frecuencia y ritual entre continentes. Piratas, nómadas, aventureros. Con el underground como objetivo y la creatividad como fuerza, emergemos para salvar tus oídos de la monotonía.',
      de:'Padang Records ist ein Hafen für <mark>spiritual beat seekers</mark> — <em>world wild artists</em>, die Bass, Frequenz und Ritual zwischen Kontinenten formen. Piraten, Nomaden, Abenteurer. Mit dem Underground als Ziel und Kreativität als Stärke treten wir hervor, um eure Ohren vor der Gleichheit zu retten.',
      fr:"Padang Records est un port pour les <mark>spiritual beat seekers</mark> — des <em>world wild artists</em> qui sculptent basse, fréquence et rituel entre les continents. Pirates, nomades, aventuriers. Avec l\'underground pour cible et la créativité pour force, nous émergeons pour sauver vos oreilles de l\'uniformité.",
      ja:'Padang Records は <mark>spiritual beat seekers</mark> のための港 — ベース、周波数、儀式を大陸の間で彫り込む <em>world wild artists</em>。パイレーツ、ノマド、アドベンチャラー。アンダーグラウンドを的に、創造性を力に、君の耳を画一性から救うために、私たちは現れる。'
    },

    /* ─ stats labels ─ */
    s_origin:  { pt:"// origem", en:"// origin", es:"// origen", de:"// herkunft", fr:"// origine", ja:"// 起源" },
    s_catalog: { pt:"// catálogo", en:"// catalog", es:"// catálogo", de:"// katalog", fr:"// catalogue", ja:"// カタログ" },
    s_roster:  { pt:"// roster", en:"// roster", es:"// plantel", de:"// roster", fr:"// roster", ja:"// ロスター" },
    s_genre:   { pt:"// gênero", en:"// genre", es:"// género", de:"// genre", fr:"// genre", ja:"// ジャンル" },
    s_founded: { pt:"// fundação", en:"// founded", es:"// fundación", de:"// gründung", fr:"// fondation", ja:"// 設立" },
    s_lab:     { pt:"// lab series", en:"// lab series", es:"// lab series", de:"// lab series", fr:"// lab series", ja:"// lab series" },
    s_countries:{ pt:"// países", en:"// countries", es:"// países", de:"// länder", fr:"// pays", ja:"// 国" },

    /* stat values */
    sv_releases_n: { pt:"+ 100 releases", en:"100+ releases", es:"+ 100 lanzamientos", de:"100+ Releases", fr:"+ 100 sorties", ja:"100+ リリース" },
    sv_releases_label: { pt:"releases", en:"releases", es:"lanzamientos", de:"Releases", fr:"sorties", ja:"リリース" },
    sv_artists_n: { pt:"+ 50 artistas worldwide", en:"50+ artists worldwide", es:"+ 50 artistas worldwide", de:"50+ Künstler weltweit", fr:"+ 50 artistes worldwide", ja:"50+ アーティスト worldwide" },
    sv_artists_label: { pt:"artistas", en:"artists", es:"artistas", de:"Künstler", fr:"artistes", ja:"アーティスト" },
    sv_dj_sets:    { pt:"DJ sets", en:"DJ sets", es:"DJ sets", de:"DJ-Sets", fr:"DJ sets", ja:"DJセット" },
    sv_countries:  { pt:"no roster", en:"in roster", es:"en el plantel", de:"im roster", fr:"dans le roster", ja:"ロスター内" },
    sv_va_exo:     { pt:"VA Exogenesis", en:"VA Exogenesis", es:"VA Exogenesis", de:"VA Exogenesis", fr:"VA Exogenesis", ja:"VA Exogenesis" },
    sv_psy_neuro:  { pt:"worldwide", en:"worldwide", es:"worldwide", de:"worldwide", fr:"worldwide", ja:"worldwide" },

    /* ─ home roster preview meta ─ */
    home_roster_meta: { pt:"// + 50 artistas worldwide · seleção rotativa em tempo real · ", en:"// 50+ artists worldwide · real-time rotating selection · ", es:"// + 50 artistas worldwide · selección rotativa en tiempo real · ", de:"// 50+ Künstler weltweit · rotierende Auswahl in Echtzeit · ", fr:"// + 50 artistes worldwide · sélection rotative en temps réel · ", ja:"// 50+ アーティスト worldwide · リアルタイム回転セレクション · " },
    see_full_roster:  { pt:"ver roster completo →", en:"see full roster →", es:"ver plantel completo →", de:"vollständigen roster ansehen →", fr:"voir roster complet →", ja:"全ロスターを見る →" },
    see_full_roster_label: { pt:"↳ ver roster completo", en:"↳ see full roster", es:"↳ ver plantel completo", de:"↳ vollständigen roster", fr:"↳ voir roster complet", ja:"↳ 全ロスターを見る" },

    /* ─ CTAs ─ */
    cta_demo_h:    { pt:"send your<br/>demo.", en:"send your<br/>demo.", es:"envía tu<br/>demo.", de:"schick deine<br/>demo.", fr:"envoie ta<br/>démo.", ja:"デモを<br/>送ろう。" },
    cta_demo_p:    { pt:"// quer agendar um artista? · quer enviar uma demo?", en:"// interested in booking? · want to send a demo?", es:"// ¿quieres contratar un artista? · ¿quieres enviar una demo?", de:"// einen Künstler buchen? · eine Demo schicken?", fr:"// envie de booker un artiste · envoyer une démo ?", ja:"// ブッキング希望？ · デモ送信？" },
    cta_demo_btn:  { pt:"enviar demo →", en:"send demo →", es:"enviar demo →", de:"demo senden →", fr:"envoyer démo →", ja:"デモを送る →" },

    /* ─ latest signal section ─ */
    now_playing:   { pt:"now playing //", en:"now playing //", es:"sonando ahora //", de:"spielt jetzt //", fr:"en écoute //", ja:"再生中 //" },
    bc_catalog_link:{ pt:"↳ catálogo bandcamp", en:"↳ bandcamp catalog", es:"↳ catálogo bandcamp", de:"↳ bandcamp-katalog", fr:"↳ catalogue bandcamp", ja:"↳ bandcamp カタログ" },
    sc_listen_link:{ pt:"↳ soundcloud", en:"↳ soundcloud", es:"↳ soundcloud", de:"↳ soundcloud", fr:"↳ soundcloud", ja:"↳ soundcloud" },
    yt_padangtv_link:{ pt:"↳ padangtv", en:"↳ padangtv", es:"↳ padangtv", de:"↳ padangtv", fr:"↳ padangtv", ja:"↳ padangtv" },

    /* ─ padangtv section ─ */
    tv_caption: { pt:"// canal oficial · live sets · previews · DJ series", en:"// official channel · live sets · previews · DJ series", es:"// canal oficial · live sets · previews · serie DJ", de:"// offizieller kanal · live-sets · previews · DJ-serie", fr:"// chaîne officielle · live sets · previews · série DJ", ja:"// 公式チャンネル · ライブセット · プレビュー · DJシリーズ" },
    tv_streaming: { pt:"// live sets · previews · lab series · <b>@padangrecords</b>", en:"// live sets · previews · lab series · <b>@padangrecords</b>", es:"// live sets · previews · lab series · <b>@padangrecords</b>", de:"// live-sets · previews · lab series · <b>@padangrecords</b>", fr:"// live sets · previews · lab series · <b>@padangrecords</b>", ja:"// ライブセット · プレビュー · ラボシリーズ · <b>@padangrecords</b>" },
    tv_subscribe: { pt:"▶ inscrever-se →", en:"▶ subscribe →", es:"▶ suscribirse →", de:"▶ abonnieren →", fr:"▶ s'abonner →", ja:"▶ チャンネル登録 →" },
    tv_now: { pt:"// tocando agora //", en:"// now playing //", es:"// reproduciendo //", de:"// jetzt //", fr:"// en cours //", ja:"// 再生中 //" },

    /* ─ roster page UI ─ */
    roster_meta_label: { pt:"artists", en:"artists", es:"artistas", de:"Künstler", fr:"artistes", ja:"アーティスト" },
    roster_confirmed:  { pt:"confirmados", en:"confirmed", es:"confirmados", de:"bestätigt", fr:"confirmés", ja:"確認済" },
    roster_pending:    { pt:"pendentes", en:"pending", es:"pendientes", de:"ausstehend", fr:"en attente", ja:"保留中" },
    roster_with_video: { pt:"com vídeo PadangTV/live", en:"with PadangTV/live video", es:"con video PadangTV/live", de:"mit PadangTV-/live-video", fr:"avec vidéo PadangTV/live", ja:"PadangTV/ライブ ビデオ付き" },
    filter_all:        { pt:"todos", en:"all", es:"todos", de:"alle", fr:"tous", ja:"すべて" },
    filter_confirmed:  { pt:"confirmados", en:"confirmed", es:"confirmados", de:"bestätigt", fr:"confirmés", ja:"確認済" },
    filter_pending:    { pt:"pendentes", en:"pending", es:"pendientes", de:"ausstehend", fr:"en attente", ja:"保留中" },
    filter_video:      { pt:"com vídeo", en:"with video", es:"con video", de:"mit video", fr:"avec vidéo", ja:"ビデオ付き" },

    /* ─ lab series ─ */
    lab_intro: {
      pt:"A <b>Padang Lab Series</b> é a vitrine de DJ sets curados pelo selo — uma sequência de <em>sessões hipnóticas</em> onde artistas-residentes e convidados conduzem viagens de uma hora ou mais entre dark progressive, psytech, forest e techno. Cada episódio é uma fotografia sonora do momento criativo de quem pilota. Inclui live recordings de festivais (Earthdance, Syncronic) e sets em estúdio.",
      en:"The <b>Padang Lab Series</b> is the label's curated DJ-set showcase — a stream of <em>hypnotic sessions</em> where resident and guest artists drive hour-long (or longer) journeys across dark progressive, psytech, forest and techno. Each episode is a sonic photograph of the artist's current creative moment. Includes live recordings from festivals (Earthdance, Syncronic) and studio sets.",
      es:"La <b>Padang Lab Series</b> es la vitrina de DJ sets curados por el sello — una secuencia de <em>sesiones hipnóticas</em> donde artistas-residentes e invitados conducen viajes de una hora o más entre dark progressive, psytech, forest y techno. Cada episodio es una fotografía sonora del momento creativo de quien pilota. Incluye grabaciones en vivo de festivales (Earthdance, Syncronic) y sets de estudio.",
      de:"Die <b>Padang Lab Series</b> ist die kuratierte DJ-Set-Vitrine des Labels — eine Folge <em>hypnotischer Sessions</em>, in denen Resident- und Gastkünstler stundenlange (oder längere) Reisen durch Dark Progressive, Psytech, Forest und Techno führen. Jede Episode ist eine Klangaufnahme des aktuellen kreativen Moments des Künstlers. Enthält Live-Aufnahmen von Festivals (Earthdance, Syncronic) und Studio-Sets.",
      fr:"La <b>Padang Lab Series</b> est la vitrine de DJ sets curatés par le label — une séquence de <em>sessions hypnotiques</em> où des artistes résidents et invités mènent des voyages d'une heure ou plus à travers le dark progressive, psytech, forest et techno. Chaque épisode est une photographie sonore du moment créatif de l'artiste. Comprend des enregistrements live de festivals (Earthdance, Syncronic) et des sets en studio.",
      ja:"<b>Padang Lab Series</b>は、レーベルがキュレーションするDJセットのショーケース — dark progressive、psytech、forest、technoを横断する1時間以上の<em>ヒプノティック・セッション</em>の連続です。各エピソードはアーティストの創造的瞬間のサウンド・フォトグラフ。フェスティバル（Earthdance、Syncronic）のライブ録音とスタジオセットを含みます。"
    },
    lab_all_eps: { pt:"//// ALL EPISODES · 21 ////", en:"//// ALL EPISODES · 21 ////", es:"//// TODOS LOS EPISODIOS · 21 ////", de:"//// ALLE FOLGEN · 21 ////", fr:"//// TOUS LES ÉPISODES · 21 ////", ja:"//// 全エピソード · 21 ////" },
    lab_featured_meta: { pt:"// 8 sessões em destaque · ", en:"// 8 featured sessions · ", es:"// 8 sesiones destacadas · ", de:"// 8 ausgewählte Sessions · ", fr:"// 8 sessions en vedette · ", ja:"// 注目セッション 8 · " },
    lab_featured_total: { pt:"21 episódios no total", en:"21 episodes total", es:"21 episodios en total", de:"21 Folgen insgesamt", fr:"21 épisodes au total", ja:"全21エピソード" },
    lab_featured_curated: { pt:" · curadoria padang records", en:" · curated by padang records", es:" · curaduría padang records", de:" · kuratiert von padang records", fr:" · curaté par padang records", ja:" · padang records キュレーション" },
    lab_listen_sc: { pt:"↳ ouvir no sc", en:"↳ listen on sc", es:"↳ escuchar en sc", de:"↳ auf sc hören", fr:"↳ écouter sur sc", ja:"↳ SCで聴く" },

    /* ─ about · timeline ─ */
    tl_2013a_y: { pt:"2013 · jun", en:"2013 · jun", es:"2013 · jun", de:"2013 · Jun", fr:"2013 · juin", ja:"2013 · 6月" },
    tl_2013a_t: { pt:"VA Barong & Garuda · debut", en:"VA Barong & Garuda · debut", es:"VA Barong & Garuda · debut", de:"VA Barong & Garuda · Debüt", fr:"VA Barong & Garuda · début", ja:"VA Barong & Garuda · デビュー" },
    tl_2013a_d: {
      pt:"06/06/2013 — primeiro lançamento oficial da Padang Records. 11 faixas: Yildun Theory, Greenchild, Silvio Lucena, Diego Fantini, Pampatek, <b>Dienstmann</b> (Arkana), Naga Baba, Tarta, Lactic Phylaxis, Mok, Vurdel. Master por Pampatek, arte por Vurdel. Distribuição via Ektoplazm sob licença CC. O selo nasce como porto para os \"spiritual beat seekers\".",
      en:"06/06/2013 — Padang Records' first official release. 11 tracks: Yildun Theory, Greenchild, Silvio Lucena, Diego Fantini, Pampatek, <b>Dienstmann</b> (Arkana), Naga Baba, Tarta, Lactic Phylaxis, Mok, Vurdel. Mastered by Pampatek, artwork by Vurdel. Distributed via Ektoplazm under a CC license. The label is born as a port for \"spiritual beat seekers\".",
      es:"06/06/2013 — primer lanzamiento oficial de Padang Records. 11 pistas: Yildun Theory, Greenchild, Silvio Lucena, Diego Fantini, Pampatek, <b>Dienstmann</b> (Arkana), Naga Baba, Tarta, Lactic Phylaxis, Mok, Vurdel. Master por Pampatek, arte por Vurdel. Distribución vía Ektoplazm bajo licencia CC. El sello nace como puerto para los \"spiritual beat seekers\".",
      de:"06.06.2013 — die erste offizielle Veröffentlichung von Padang Records. 11 Tracks: Yildun Theory, Greenchild, Silvio Lucena, Diego Fantini, Pampatek, <b>Dienstmann</b> (Arkana), Naga Baba, Tarta, Lactic Phylaxis, Mok, Vurdel. Mastering von Pampatek, Artwork von Vurdel. Vertrieb über Ektoplazm unter CC-Lizenz. Das Label entsteht als Hafen für die \"spiritual beat seekers\".",
      fr:"06/06/2013 — première sortie officielle de Padang Records. 11 titres : Yildun Theory, Greenchild, Silvio Lucena, Diego Fantini, Pampatek, <b>Dienstmann</b> (Arkana), Naga Baba, Tarta, Lactic Phylaxis, Mok, Vurdel. Master par Pampatek, artwork par Vurdel. Distribué via Ektoplazm sous licence CC. Le label naît comme un port pour les \"spiritual beat seekers\".",
      ja:"2013/06/06 — Padang Records 初の公式リリース。11トラック：Yildun Theory、Greenchild、Silvio Lucena、Diego Fantini、Pampatek、<b>Dienstmann</b>（Arkana）、Naga Baba、Tarta、Lactic Phylaxis、Mok、Vurdel。マスタリング Pampatek、アートワーク Vurdel。Ektoplazm より CC ライセンスで配布。レーベルは \"spiritual beat seekers\" のための港として誕生。"
    },
    tl_2013b_y: { pt:"2013 · dez", en:"2013 · dec", es:"2013 · dic", de:"2013 · Dez", fr:"2013 · déc", ja:"2013 · 12月" },
    tl_2013b_t: { pt:"VA Nibiru · viragem dark progressive", en:"VA Nibiru · the dark turn", es:"VA Nibiru · giro dark progressive", de:"VA Nibiru · die dunkle Wende", fr:"VA Nibiru · le virage dark progressive", ja:"VA Nibiru · ダーク・プログレッシブへの転換" },
    tl_2013b_d: {
      pt:"03/12/2013 — segunda VA, mais densa e noturna. 10 faixas que firmam a vocação dark prog do selo: Gargolium, Mental Attack, Zahnstein, Naga Baba, Train Wreck, Gas Mask, <b>Alchemy Circle</b> (The Occult Science — primeira faixa do duo lançada), Dohak, The Mok, Insider. Nomes que viriam a se tornar referências do estilo estreiam aqui.",
      en:"03/12/2013 — the second VA, denser and more nocturnal. 10 tracks that consolidate the label's dark prog vocation: Gargolium, Mental Attack, Zahnstein, Naga Baba, Train Wreck, Gas Mask, <b>Alchemy Circle</b> (The Occult Science — the duo's first released track), Dohak, The Mok, Insider. Names that would later become references in the genre debut here.",
      es:"03/12/2013 — la segunda VA, más densa y nocturna. 10 pistas que consolidan la vocación dark prog del sello: Gargolium, Mental Attack, Zahnstein, Naga Baba, Train Wreck, Gas Mask, <b>Alchemy Circle</b> (The Occult Science — primera pista publicada del dúo), Dohak, The Mok, Insider. Nombres que se convertirían en referencias del estilo debutan aquí.",
      de:"03.12.2013 — die zweite VA, dichter und nächtlicher. 10 Tracks, die die dark-prog Ausrichtung des Labels festigen: Gargolium, Mental Attack, Zahnstein, Naga Baba, Train Wreck, Gas Mask, <b>Alchemy Circle</b> (The Occult Science — der erste veröffentlichte Track des Duos), Dohak, The Mok, Insider. Namen, die später zu Referenzen des Genres werden, debütieren hier.",
      fr:"03/12/2013 — la deuxième VA, plus dense et nocturne. 10 titres qui consolident la vocation dark prog du label : Gargolium, Mental Attack, Zahnstein, Naga Baba, Train Wreck, Gas Mask, <b>Alchemy Circle</b> (The Occult Science — premier titre publié du duo), Dohak, The Mok, Insider. Des noms qui deviendront des références du genre débutent ici.",
      ja:"2013/12/03 — 第二弾 VA、より重く夜に寄った10トラック。レーベルのダーク・プログレッシブ志向を決定づける：Gargolium、Mental Attack、Zahnstein、Naga Baba、Train Wreck、Gas Mask、<b>Alchemy Circle</b>（The Occult Science — デュオ初の公式リリース）、Dohak、The Mok、Insider。後にシーンの基準となる名前たちがここでデビュー。"
    },
    tl_2017_y:  { pt:"2017", en:"2017", es:"2017", de:"2017", fr:"2017", ja:"2017" },
    tl_2017_t:  { pt:"VA Exogenesis · expansão internacional", en:"VA Exogenesis · international expansion", es:"VA Exogenesis · expansión internacional", de:"VA Exogenesis · internationale Expansion", fr:"VA Exogenesis · expansion internationale", ja:"VA Exogenesis · 国際展開" },
    tl_2017_d:  { pt:"Compilação curada por Greenchild com 21 faixas — Samway, Bensaid, Fevered Shiva, Genetica, Colt, Smokcid, Niobiun, Mushroom Head, Ritalin Child, Qawa Beat e mais. Marca a abertura do selo para artistas de fora do Brasil.",
                  en:"Compilation curated by Greenchild with 21 tracks — Samway, Bensaid, Fevered Shiva, Genetica, Colt, Smokcid, Niobiun, Mushroom Head, Ritalin Child, Qawa Beat and more. Marks the label opening up to artists from outside Brazil.",
                  es:"Compilación curada por Greenchild con 21 tracks — Samway, Bensaid, Fevered Shiva, Genetica, Colt, Smokcid, Niobiun, Mushroom Head, Ritalin Child, Qawa Beat y más. Marca la apertura del sello a artistas de fuera de Brasil.",
                  de:"Von Greenchild kuratierte Compilation mit 21 Tracks — Samway, Bensaid, Fevered Shiva, Genetica, Colt, Smokcid, Niobiun, Mushroom Head, Ritalin Child, Qawa Beat und mehr. Markiert die Öffnung des Labels für Künstler außerhalb Brasiliens.",
                  fr:"Compilation curatée par Greenchild avec 21 morceaux — Samway, Bensaid, Fevered Shiva, Genetica, Colt, Smokcid, Niobiun, Mushroom Head, Ritalin Child, Qawa Beat et plus. Marque l'ouverture du label aux artistes hors Brésil.",
                  ja:"Greenchild がキュレーションした21トラックのコンピレーション — Samway、Bensaid、Fevered Shiva、Genetica、Colt、Smokcid、Niobiun、Mushroom Head、Ritalin Child、Qawa Beat ほか。ブラジル以外のアーティストへのレーベル開放を示す。" },

    tl_2018_y:  { pt:"2018 — 2019", en:"2018 — 2019", es:"2018 — 2019", de:"2018 — 2019", fr:"2018 — 2019", ja:"2018 — 2019" },
    tl_2018_t:  { pt:"Padang Lab Series ▶ início", en:"Padang Lab Series ▶ launch", es:"Padang Lab Series ▶ inicio", de:"Padang Lab Series ▶ Start", fr:"Padang Lab Series ▶ lancement", ja:"Padang Lab Series ▶ 開始" },
    tl_2018_d:  { pt:"Estreia da série de DJ sets com Headweller (EP.1). Releases solo de Colt (Unknown Roots), Headweller (Unexpected Shades), Jungle Haze (Xaman), Camps Elisis (Quantum Waves).",
                  en:"Launch of the DJ-set series with Headweller (EP.1). Solo releases from Colt (Unknown Roots), Headweller (Unexpected Shades), Jungle Haze (Xaman), Camps Elisis (Quantum Waves).",
                  es:"Estreno de la serie de DJ sets con Headweller (EP.1). Lanzamientos solo de Colt (Unknown Roots), Headweller (Unexpected Shades), Jungle Haze (Xaman), Camps Elisis (Quantum Waves).",
                  de:"Premiere der DJ-Set-Serie mit Headweller (EP.1). Solo-Releases von Colt (Unknown Roots), Headweller (Unexpected Shades), Jungle Haze (Xaman), Camps Elisis (Quantum Waves).",
                  fr:"Lancement de la série DJ sets avec Headweller (EP.1). Sorties solo de Colt (Unknown Roots), Headweller (Unexpected Shades), Jungle Haze (Xaman), Camps Elisis (Quantum Waves).",
                  ja:"Headweller (EP.1) でDJセットシリーズが開始。Colt (Unknown Roots)、Headweller (Unexpected Shades)、Jungle Haze (Xaman)、Camps Elisis (Quantum Waves) のソロリリース。" },

    tl_2019_y:  { pt:"2019", en:"2019", es:"2019", de:"2019", fr:"2019", ja:"2019" },
    tl_2019_t:  { pt:"Anaïs Lin assina · Paracozm Packet Loss", en:"Anaïs Lin signs · Paracozm Packet Loss", es:"Anaïs Lin firma · Paracozm Packet Loss", de:"Anaïs Lin unterschreibt · Paracozm Packet Loss", fr:"Anaïs Lin signe · Paracozm Packet Loss", ja:"Anaïs Lin 加入 · Paracozm Packet Loss" },
    tl_2019_d:  { pt:"Padang assina Anaïs Lin (PT) — que viria a curar a Technomad. Paracozm lança Packet Loss, ampliando o vocabulário dark progressive do selo.",
                  en:"Padang signs Anaïs Lin (PT) — who would later curate Technomad. Paracozm releases Packet Loss, expanding the label's dark-progressive vocabulary.",
                  es:"Padang firma a Anaïs Lin (PT) — quien luego curaría Technomad. Paracozm lanza Packet Loss, ampliando el vocabulario dark progressive del sello.",
                  de:"Padang nimmt Anaïs Lin (PT) unter Vertrag — die später Technomad kuratieren würde. Paracozm veröffentlicht Packet Loss und erweitert das Dark-Progressive-Vokabular des Labels.",
                  fr:"Padang signe Anaïs Lin (PT) — qui curatera plus tard Technomad. Paracozm sort Packet Loss, élargissant le vocabulaire dark progressive du label.",
                  ja:"Padang は Anaïs Lin (PT) と契約 — 後に Technomad をキュレーション。Paracozm が Packet Loss をリリースし、レーベルのダーク・プログレッシブの語彙を拡張。" },

    tl_2022_y:  { pt:"2022 — 2023", en:"2022 — 2023", es:"2022 — 2023", de:"2022 — 2023", fr:"2022 — 2023", ja:"2022 — 2023" },
    tl_2022_t:  { pt:"Catálogo 24bit · novos territórios", en:"24-bit catalog · new territories", es:"Catálogo 24bit · nuevos territorios", de:"24-Bit-Katalog · neue Gebiete", fr:"Catalogue 24bit · nouveaux territoires", ja:"24bit カタログ · 新領域" },
    tl_2022_d:  { pt:"Releases em 24bit (Runehk, RNDM., Bensaid Virtuous Spiral). Green Waves entra com Surfing in Oscillations. A label DJ Nuit Noire estreia em Montreal.",
                  en:"24-bit releases (Runehk, RNDM., Bensaid Virtuous Spiral). Green Waves joins with Surfing in Oscillations. Label DJ Nuit Noire debuts in Montreal.",
                  es:"Lanzamientos en 24bit (Runehk, RNDM., Bensaid Virtuous Spiral). Green Waves entra con Surfing in Oscillations. La label DJ Nuit Noire debuta en Montreal.",
                  de:"24-Bit-Releases (Runehk, RNDM., Bensaid Virtuous Spiral). Green Waves steigt mit Surfing in Oscillations ein. Label-DJ Nuit Noire debütiert in Montreal.",
                  fr:"Sorties en 24bit (Runehk, RNDM., Bensaid Virtuous Spiral). Green Waves entre avec Surfing in Oscillations. La label DJ Nuit Noire fait ses débuts à Montréal.",
                  ja:"24bit リリース（Runehk、RNDM.、Bensaid Virtuous Spiral）。Green Waves が Surfing in Oscillations で参加。レーベル DJ の Nuit Noire がモントリオールでデビュー。" },

    tl_2024_y:  { pt:"2024", en:"2024", es:"2024", de:"2024", fr:"2024", ja:"2024" },
    tl_2024_t:  { pt:"Cosmic Visitors · VA Nukaya", en:"Cosmic Visitors · VA Nukaya", es:"Cosmic Visitors · VA Nukaya", de:"Cosmic Visitors · VA Nukaya", fr:"Cosmic Visitors · VA Nukaya", ja:"Cosmic Visitors · VA Nukaya" },
    tl_2024_d:  { pt:"LP de Aoos abre uma fase mais cósmica. VA Nukaya, curada por Mallki, traz 19 produtores em ritmos Inca renascidos. Rollercoaster lança Brake the Chains.",
                  en:"Aoos's LP opens a more cosmic phase. VA Nukaya, curated by Mallki, brings 19 producers in reborn Inca rhythms. Rollercoaster releases Brake the Chains.",
                  es:"El LP de Aoos abre una fase más cósmica. VA Nukaya, curada por Mallki, trae 19 productores en ritmos Inca renacidos. Rollercoaster lanza Brake the Chains.",
                  de:"Aoos' LP eröffnet eine kosmischere Phase. VA Nukaya, kuratiert von Mallki, bringt 19 Produzenten in wiedergeborenen Inka-Rhythmen. Rollercoaster veröffentlicht Brake the Chains.",
                  fr:"Le LP d'Aoos ouvre une phase plus cosmique. VA Nukaya, curatée par Mallki, réunit 19 producteurs dans des rythmes Inca renaissants. Rollercoaster sort Brake the Chains.",
                  ja:"Aoos の LP がより宇宙的なフェーズを開く。Mallki がキュレーションした VA Nukaya は、再生したインカのリズムで19人のプロデューサーを集結。Rollercoaster が Brake the Chains をリリース。" },

    tl_2025_y:  { pt:"2025", en:"2025", es:"2025", de:"2025", fr:"2025", ja:"2025" },
    tl_2025_t:  { pt:"Ano de coletivos · Technomad II · Reborn", en:"Year of collectives · Technomad II · Reborn", es:"Año de colectivos · Technomad II · Reborn", de:"Jahr der Kollektive · Technomad II · Reborn", fr:"Année des collectifs · Technomad II · Reborn", ja:"コレクティブの年 · Technomad II · Reborn" },
    tl_2025_d:  { pt:"Technomad II (Anaïs Lin) · The Weight of Thought (Headweller) · Chronicles (Green Waves) · Cosmic Visitors · Õtoto (Falzar) · VA The Nightmare (Nuit Noire) · Reborn: Echoes of the Forest (Tekmall) · Tekra (MNGRM). Selo passa de 100 releases.",
                  en:"Technomad II (Anaïs Lin) · The Weight of Thought (Headweller) · Chronicles (Green Waves) · Cosmic Visitors · Õtoto (Falzar) · VA The Nightmare (Nuit Noire) · Reborn: Echoes of the Forest (Tekmall) · Tekra (MNGRM). Label passes 100 releases.",
                  es:"Technomad II (Anaïs Lin) · The Weight of Thought (Headweller) · Chronicles (Green Waves) · Cosmic Visitors · Õtoto (Falzar) · VA The Nightmare (Nuit Noire) · Reborn: Echoes of the Forest (Tekmall) · Tekra (MNGRM). El sello supera los 100 lanzamientos.",
                  de:"Technomad II (Anaïs Lin) · The Weight of Thought (Headweller) · Chronicles (Green Waves) · Cosmic Visitors · Õtoto (Falzar) · VA The Nightmare (Nuit Noire) · Reborn: Echoes of the Forest (Tekmall) · Tekra (MNGRM). Das Label überschreitet 100 Releases.",
                  fr:"Technomad II (Anaïs Lin) · The Weight of Thought (Headweller) · Chronicles (Green Waves) · Cosmic Visitors · Õtoto (Falzar) · VA The Nightmare (Nuit Noire) · Reborn: Echoes of the Forest (Tekmall) · Tekra (MNGRM). Le label dépasse les 100 sorties.",
                  ja:"Technomad II (Anaïs Lin)、The Weight of Thought (Headweller)、Chronicles (Green Waves)、Cosmic Visitors、Õtoto (Falzar)、VA The Nightmare (Nuit Noire)、Reborn: Echoes of the Forest (Tekmall)、Tekra (MNGRM)。レーベルは100リリースを突破。" },

  };

  const SUPPORTED = ['en','pt','es','de','fr','ja'];
  const DEFAULT_LANG = 'en';           // inglês é a língua oficial · fallback universal
  const STORAGE_KEY = 'padang-lang';

  // detecta idioma do visitante:
  //   1) escolha manual previamente persistida em localStorage
  //   2) navigator.languages (todas as preferências do browser, em ordem)
  //   3) navigator.language (idioma principal do SO)
  //   4) fallback: en
  // O browser já reporta o idioma do sistema, que reflete a localização do usuário
  // na grande maioria dos casos. Geolocalização por IP só seria útil pra distinguir
  // um BR rodando macOS em EN — caso edge demais pra adicionar latência de fetch.
  function detect() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED.indexOf(saved) >= 0) return saved;
    } catch(e){}
    // tenta a lista de preferências do browser primeiro (mais preciso que .language sozinho)
    const candidates = [];
    if (Array.isArray(navigator.languages)) {
      navigator.languages.forEach(function(l){ candidates.push(String(l)); });
    }
    if (navigator.language) candidates.push(navigator.language);
    if (navigator.userLanguage) candidates.push(navigator.userLanguage);
    for (var i=0; i<candidates.length; i++) {
      var code = candidates[i].toLowerCase().slice(0,2);
      if (SUPPORTED.indexOf(code) >= 0) return code;
    }
    return DEFAULT_LANG;
  }

  function apply(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      var entry = DICT[key];
      if (!entry || !entry[lang]) return;
      var val = entry[lang];
      if (/<[a-zA-Z]/.test(val)) el.innerHTML = val;
      else el.textContent = val;
    });
    document.querySelectorAll('.lang-switch [data-lang]').forEach(function(b) {
      b.classList.toggle('on', b.getAttribute('data-lang') === lang);
    });
  }
  function setLang(lang) {
    if (SUPPORTED.indexOf(lang) < 0) lang = DEFAULT_LANG;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch(e){}
    apply(lang);
  }
  function init() {
    apply(detect());
    document.querySelectorAll('.lang-switch [data-lang]').forEach(function(b) {
      b.addEventListener('click', function(e) {
        e.preventDefault();
        setLang(b.getAttribute('data-lang'));
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.PADANG_I18N = { dict: DICT, apply: apply, setLang: setLang, detect: detect };
})();
