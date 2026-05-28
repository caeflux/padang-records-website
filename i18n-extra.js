/* PADANG · i18n EXTRA · chaves adicionais que estendem i18n.js
 * Carregue DEPOIS de i18n.js. Adiciona ao DICT e re-aplica.
 */
(function() {
  const EXTRA = {
    /* ─ timeline 2026 (faltou no i18n.js core) ─ */
    tl_2026_y: { pt:"2026", en:"2026", es:"2026", de:"2026", fr:"2026", ja:"2026" },
    tl_2026_t: { pt:"Nyctophilia II · Self Inflicted · Isolation Protocol", en:"Nyctophilia II · Self Inflicted · Isolation Protocol", es:"Nyctophilia II · Self Inflicted · Isolation Protocol", de:"Nyctophilia II · Self Inflicted · Isolation Protocol", fr:"Nyctophilia II · Self Inflicted · Isolation Protocol", ja:"Nyctophilia II · Self Inflicted · Isolation Protocol" },
    tl_2026_d: {
      pt:"Nyctophilia II (Rhabia, jan) · Self Inflicted EP (Anadrome, fev) · Isolation Protocol (DMnT, abril) — release ★ latest. Lab Series chega a EP.21 (Alex Alipe @ Syncronic · Padang x Blacklite).",
      en:"Nyctophilia II (Rhabia, Jan) · Self Inflicted EP (Anadrome, Feb) · Isolation Protocol (DMnT, April) — ★ latest release. Lab Series hits EP.21 (Alex Alipe @ Syncronic · Padang × Blacklite).",
      es:"Nyctophilia II (Rhabia, ene) · Self Inflicted EP (Anadrome, feb) · Isolation Protocol (DMnT, abril) — ★ lanzamiento más reciente. Lab Series llega al EP.21 (Alex Alipe @ Syncronic · Padang × Blacklite).",
      de:"Nyctophilia II (Rhabia, Jan) · Self Inflicted EP (Anadrome, Feb) · Isolation Protocol (DMnT, April) — ★ neuester Release. Lab Series erreicht EP.21 (Alex Alipe @ Syncronic · Padang × Blacklite).",
      fr:"Nyctophilia II (Rhabia, jan) · Self Inflicted EP (Anadrome, fév) · Isolation Protocol (DMnT, avril) — ★ sortie la plus récente. Lab Series arrive à EP.21 (Alex Alipe @ Syncronic · Padang × Blacklite).",
      ja:"Nyctophilia II (Rhabia、1月)、Self Inflicted EP (Anadrome、2月)、Isolation Protocol (DMnT、4月) — ★最新リリース。Lab Series は EP.21 に到達 (Alex Alipe @ Syncronic · Padang × Blacklite)。"
    },

    /* ─ demo guide bullets ─ */
    dg_1: { pt:"<b>Estilos que assinamos:</b> dark progressive, minimal techno com pitada de psy, neuro, minimal psytrance, forest, techno experimental. Não enviamos retorno fora desse espectro.",
            en:"<b>Styles we sign:</b> dark progressive, minimal techno com pitada de psy, neuro, minimal psytrance, forest, experimental techno. We don't reply outside this spectrum.",
            es:"<b>Estilos que firmamos:</b> dark progressive, minimal techno com pitada de psy, neuro, minimal psytrance, forest, techno experimental. No respondemos fuera de este espectro.",
            de:"<b>Stile, die wir signieren:</b> Dark Progressive, minimal techno (com pitada de psy), Neuro, Minimal Psytrance, experimenteller Techno. Außerhalb dieses Spektrums geben wir keine Rückmeldung.",
            fr:"<b>Styles que nous signons :</b> dark progressive, minimal techno com pitada de psy, neuro, minimal psytrance, forest, techno expérimentale. Nous ne répondons pas hors de ce spectre.",
            ja:"<b>契約するスタイル：</b> dark progressive, minimal techno com pitada de psy, neuro, minimal psytrance, forest, experimental techno。これ以外のスペクトラムには返信しません。" },
    dg_2: { pt:"<b>Demo:</b> envie 2-4 faixas no máximo · WAV / FLAC / MP3 320kbps · streaming via SoundCloud private link (preferido) ou Dropbox / WeTransfer.",
            en:"<b>Demo:</b> send 2-4 tracks max · WAV / FLAC / MP3 320kbps · streaming via SoundCloud private link (preferred) or Dropbox / WeTransfer.",
            es:"<b>Demo:</b> envía 2-4 tracks máximo · WAV / FLAC / MP3 320kbps · streaming vía private link de SoundCloud (preferido) o Dropbox / WeTransfer.",
            de:"<b>Demo:</b> max. 2-4 Tracks senden · WAV / FLAC / MP3 320kbps · Streaming via SoundCloud Private Link (bevorzugt) oder Dropbox / WeTransfer.",
            fr:"<b>Démo :</b> envoie 2-4 morceaux max · WAV / FLAC / MP3 320kbps · streaming via SoundCloud private link (préféré) ou Dropbox / WeTransfer.",
            ja:"<b>デモ：</b> 最大2-4トラック送信 · WAV / FLAC / MP3 320kbps · SoundCloud プライベートリンク（推奨）または Dropbox / WeTransfer でストリーミング。" },
    dg_3: { pt:"<b>Não publique</b> as faixas como release antes da resposta. Sons já lançados em outras labels não são aceitos.",
            en:"<b>Don't publish</b> the tracks as a release before our reply. Tracks already released on other labels are not accepted.",
            es:"<b>No publiques</b> los tracks como lanzamiento antes de la respuesta. No se aceptan sonidos ya lanzados en otros sellos.",
            de:"<b>Veröffentliche</b> die Tracks nicht als Release vor unserer Antwort. Bereits auf anderen Labels veröffentlichte Sounds werden nicht akzeptiert.",
            fr:"<b>Ne publie pas</b> les morceaux comme sortie avant notre réponse. Les sons déjà sortis sur d'autres labels ne sont pas acceptés.",
            ja:"<b>返信前にトラックをリリースとして公開しないでください</b>。他レーベルで既にリリース済みのサウンドは受け付けません。" },
    dg_4: { pt:"<b>Bio + redes:</b> inclua um parágrafo curto sobre o projeto e links de SoundCloud / Bandcamp / Instagram.",
            en:"<b>Bio + socials:</b> include a short paragraph about the project and SoundCloud / Bandcamp / Instagram links.",
            es:"<b>Bio + redes:</b> incluye un párrafo corto sobre el proyecto y enlaces de SoundCloud / Bandcamp / Instagram.",
            de:"<b>Bio + Socials:</b> Füge einen kurzen Absatz über das Projekt und SoundCloud / Bandcamp / Instagram Links bei.",
            fr:"<b>Bio + réseaux :</b> inclus un court paragraphe sur le projet et des liens SoundCloud / Bandcamp / Instagram.",
            ja:"<b>バイオ + SNS：</b> プロジェクトの短い段落と、SoundCloud / Bandcamp / Instagram のリンクを含めてください。" },
    dg_5: { pt:"<b>Resposta:</b> tempo médio de 3-6 semanas. A&R: <b>Tekmall</b>, <b>Anaïs Lin</b>, <b>Mallki</b>, <b>Nuit Noire</b> e curadores rotativos.",
            en:"<b>Reply:</b> average 3-6 weeks. A&R: <b>Tekmall</b>, <b>Anaïs Lin</b>, <b>Mallki</b>, <b>Nuit Noire</b> and rotating curators.",
            es:"<b>Respuesta:</b> tiempo promedio de 3-6 semanas. A&R: <b>Tekmall</b>, <b>Anaïs Lin</b>, <b>Mallki</b>, <b>Nuit Noire</b> y curadores rotativos.",
            de:"<b>Antwort:</b> durchschnittlich 3-6 Wochen. A&R: <b>Tekmall</b>, <b>Anaïs Lin</b>, <b>Mallki</b>, <b>Nuit Noire</b> und rotierende Kuratoren.",
            fr:"<b>Réponse :</b> délai moyen de 3-6 semaines. A&R : <b>Tekmall</b>, <b>Anaïs Lin</b>, <b>Mallki</b>, <b>Nuit Noire</b> et curateurs rotatifs.",
            ja:"<b>返信：</b> 平均3-6週間。A&R: <b>Tekmall</b>、<b>Anaïs Lin</b>、<b>Mallki</b>、<b>Nuit Noire</b>、およびローテーションキュレーター。" },

    /* ─ events · meta + cta ─ */
    events_next_meta: { pt:"// agenda em construção · datas a confirmar diretamente com a label", en:"// agenda in progress · dates to confirm directly with the label", es:"// agenda en construcción · fechas a confirmar directamente con el sello", de:"// agenda im aufbau · termine direkt mit dem label bestätigen", fr:"// agenda en construction · dates à confirmer directement avec le label", ja:"// アジェンダ準備中 · 日程はレーベルに直接確認" },
    events_hist_meta: { pt:"// sets/lives já gravados — disponíveis na lab series e padangtv", en:"// sets/lives already recorded — available on lab series and padangtv", es:"// sets/lives ya grabados — disponibles en lab series y padangtv", de:"// sets/lives bereits aufgenommen — verfügbar auf lab series und padangtv", fr:"// sets/lives déjà enregistrés — disponibles sur lab series et padangtv", ja:"// 録音済みセット/ライブ — lab series と padangtv で利用可能" },
    events_cta_h: { pt:"tá tocando padang ao vivo?", en:"playing padang live?", es:"¿tocando padang en vivo?", de:"padang live spielen?", fr:"tu joues padang en live ?", ja:"padang をライブで演奏中？" },
    events_cta_p: { pt:'Se você é artista do roster ou organiza um showcase / festival com nomes da Padang Records e quer aparecer aqui, manda os dados pra demos@padangrecords.net com assunto "EVENT" — incluindo nome do evento, data, local, lineup e link da divulgação.', en:'If you are a roster artist or organize a showcase / festival with Padang Records names and want to appear here, send the data to demos@padangrecords.net with subject "EVENT" — including event name, date, venue, lineup and promo link.', es:'Si eres artista del plantel u organizas un showcase / festival con nombres de Padang Records y quieres aparecer aquí, envía los datos a demos@padangrecords.net con asunto "EVENT" — incluyendo nombre del evento, fecha, lugar, lineup y enlace de promoción.', de:'Wenn du Roster-Künstler bist oder einen Showcase / Festival mit Padang-Records-Namen organisierst und hier erscheinen möchtest, schicke die Daten an demos@padangrecords.net mit Betreff "EVENT" — inkl. Event-Name, Datum, Location, Lineup und Promo-Link.', fr:"Si tu es artiste du roster ou organises un showcase / festival avec des noms Padang Records et veux apparaître ici, envoie les données à demos@padangrecords.net avec sujet \"EVENT\" — incluant nom de l'événement, date, lieu, lineup et lien promo.", ja:'ロスターのアーティスト、または Padang Records 関連のショーケース／フェスティバルを開催していてここに掲載したい場合は、demos@padangrecords.net に件名 "EVENT" でデータを送信 — イベント名、日付、場所、ラインナップ、プロモリンクを含めて。' },
    events_cta_btn: { pt:"enviar evento →", en:"send event →", es:"enviar evento →", de:"event senden →", fr:"envoyer événement →", ja:"イベントを送信 →" },

    /* events · lineup descriptions */
    ev_arkana_n: { pt:"Arkana Festival · edição 16 (2026)", en:"Arkana Festival · 16th edition (2026)", es:"Arkana Festival · 16ª edición (2026)", de:"Arkana Festival · 16. Ausgabe (2026)", fr:"Arkana Festival · 16ᵉ édition (2026)", ja:"Arkana Festival · 第16回 (2026)" },
    ev_arkana_lu:{ pt:"<b>Lineup confirmado:</b> Niobiun · Kilbee · Rollercoaster · Mallki · Aru · Dienstmann · Vorg · Tenebra · <b>curadoria:</b> Mallki", en:"<b>Confirmed lineup:</b> Niobiun · Kilbee · Rollercoaster · Mallki · Aru · Dienstmann · Vorg · Tenebra · <b>curator:</b> Mallki", es:"<b>Lineup confirmado:</b> Niobiun · Kilbee · Rollercoaster · Mallki · Aru · Dienstmann · Vorg · Tenebra · <b>curaduría:</b> Mallki", de:"<b>Bestätigtes Lineup:</b> Niobiun · Kilbee · Rollercoaster · Mallki · Aru · Dienstmann · Vorg · Tenebra · <b>Kuration:</b> Mallki", fr:"<b>Lineup confirmé :</b> Niobiun · Kilbee · Rollercoaster · Mallki · Aru · Dienstmann · Vorg · Tenebra · <b>curaté par :</b> Mallki", ja:"<b>確定ラインナップ：</b> Niobiun · Kilbee · Rollercoaster · Mallki · Aru · Dienstmann · Vorg · Tenebra · <b>キュレーション：</b> Mallki" },
    ev_arkana_loc:{ pt:"Peru · vale sagrado dos incas", en:"Peru · sacred valley of the incas", es:"Perú · valle sagrado de los incas", de:"Peru · heiliges tal der inka", fr:"Pérou · vallée sacrée des incas", ja:"ペルー · インカの聖なる谷" },

    ev_show_poa_n: { pt:"Padang Showcase · Porto Alegre", en:"Padang Showcase · Porto Alegre", es:"Padang Showcase · Porto Alegre", de:"Padang Showcase · Porto Alegre", fr:"Padang Showcase · Porto Alegre", ja:"Padang Showcase · ポルトアレグレ" },
    ev_show_poa_lu:{ pt:"<b>Data:</b> a confirmar · <b>Lineup:</b> artistas Padang · showcase curado", en:"<b>Date:</b> TBA · <b>Lineup:</b> Padang label artists · curated showcase", es:"<b>Fecha:</b> a confirmar · <b>Lineup:</b> artistas Padang · showcase curado", de:"<b>Datum:</b> noch offen · <b>Lineup:</b> Padang-Künstler · kuratierte Showcase", fr:"<b>Date :</b> à confirmer · <b>Lineup :</b> artistes du label Padang · showcase curaté", ja:"<b>日程：</b> 未定 · <b>ラインナップ：</b> Padang レーベル所属アーティスト · キュレーション・ショーケース" },
    ev_show_poa_loc:{ pt:"brasil · porto alegre", en:"brazil · porto alegre", es:"brasil · porto alegre", de:"brasilien · porto alegre", fr:"brésil · porto alegre", ja:"ブラジル · ポルトアレグレ" },

    ev_show_bh_n: { pt:"Padang Showcase · Belo Horizonte", en:"Padang Showcase · Belo Horizonte", es:"Padang Showcase · Belo Horizonte", de:"Padang Showcase · Belo Horizonte", fr:"Padang Showcase · Belo Horizonte", ja:"Padang Showcase · ベロオリゾンテ" },
    ev_show_bh_lu:{ pt:"<b>Data:</b> a confirmar · <b>Lineup:</b> artistas Padang · showcase curado", en:"<b>Date:</b> TBA · <b>Lineup:</b> Padang label artists · curated showcase", es:"<b>Fecha:</b> a confirmar · <b>Lineup:</b> artistas Padang · showcase curado", de:"<b>Datum:</b> noch offen · <b>Lineup:</b> Padang-Künstler · kuratierte Showcase", fr:"<b>Date :</b> à confirmer · <b>Lineup :</b> artistes du label Padang · showcase curaté", ja:"<b>日程：</b> 未定 · <b>ラインナップ：</b> Padang レーベル所属アーティスト · キュレーション・ショーケース" },
    ev_show_bh_loc:{ pt:"brasil · belo horizonte", en:"brazil · belo horizonte", es:"brasil · belo horizonte", de:"brasilien · belo horizonte", fr:"brésil · belo horizonte", ja:"ブラジル · ベロオリゾンテ" },

    ev_show_rosa_n: { pt:"Padang Showcase · Praia do Rosa", en:"Padang Showcase · Praia do Rosa", es:"Padang Showcase · Praia do Rosa", de:"Padang Showcase · Praia do Rosa", fr:"Padang Showcase · Praia do Rosa", ja:"Padang Showcase · プライア・ド・ホーザ" },
    ev_show_rosa_lu:{ pt:"<b>Data:</b> a confirmar · <b>Lineup:</b> artistas Padang · showcase curado", en:"<b>Date:</b> TBA · <b>Lineup:</b> Padang label artists · curated showcase", es:"<b>Fecha:</b> a confirmar · <b>Lineup:</b> artistas Padang · showcase curado", de:"<b>Datum:</b> noch offen · <b>Lineup:</b> Padang-Künstler · kuratierte Showcase", fr:"<b>Date :</b> à confirmer · <b>Lineup :</b> artistes du label Padang · showcase curaté", ja:"<b>日程：</b> 未定 · <b>ラインナップ：</b> Padang レーベル所属アーティスト · キュレーション・ショーケース" },
    ev_show_rosa_loc:{ pt:"brasil · praia do rosa · santa catarina", en:"brazil · praia do rosa · santa catarina", es:"brasil · praia do rosa · santa catarina", de:"brasilien · praia do rosa · santa catarina", fr:"brésil · praia do rosa · santa catarina", ja:"ブラジル · プライア・ド・ホーザ · サンタカタリーナ" },

    ev_earth_n: { pt:"Earthdance · Padang showcase", en:"Earthdance · Padang showcase", es:"Earthdance · showcase Padang", de:"Earthdance · Padang-Showcase", fr:"Earthdance · showcase Padang", ja:"Earthdance · Padang ショーケース" },
    ev_earth_lu:{ pt:"<b>Histórico recente:</b> Dienstmann b2b Vorg (EP.18 Lab Series, 2025) · Tekmall (set 2025)", en:"<b>Recent history:</b> Dienstmann b2b Vorg (Lab Series EP.18, 2025) · Tekmall (2025 set)", es:"<b>Historial reciente:</b> Dienstmann b2b Vorg (EP.18 Lab Series, 2025) · Tekmall (set 2025)", de:"<b>Letzter Verlauf:</b> Dienstmann b2b Vorg (Lab Series EP.18, 2025) · Tekmall (Set 2025)", fr:"<b>Historique récent :</b> Dienstmann b2b Vorg (Lab Series EP.18, 2025) · Tekmall (set 2025)", ja:"<b>最近の履歴：</b> Dienstmann b2b Vorg (Lab Series EP.18、2025年) · Tekmall (2025年セット)" },
    ev_earth_loc:{ pt:"brasil · próxima edição tba", en:"brazil · next edition tba", es:"brasil · próxima edición tba", de:"brasilien · nächste ausgabe tba", fr:"brésil · prochaine édition tba", ja:"ブラジル · 次回未定" },

    ev_sync_n: { pt:"Syncronic · Padang × Blacklite · POA edition", en:"Syncronic · Padang × Blacklite · POA edition", es:"Syncronic · Padang × Blacklite · POA edition", de:"Syncronic · Padang × Blacklite · POA Edition", fr:"Syncronic · Padang × Blacklite · POA edition", ja:"Syncronic · Padang × Blacklite · POA エディション" },
    ev_sync_lu:{ pt:"<b>Gravado ao vivo:</b> set do Alex Alipe lançado como Lab Series EP.21 · <b>Lineup completo ↓</b>", en:"<b>Live recorded:</b> Alex Alipe set released as Lab Series EP.21 · <b>Full lineup ↓</b>", es:"<b>Grabado en vivo:</b> set de Alex Alipe lanzado como Lab Series EP.21 · <b>Lineup completo ↓</b>", de:"<b>Live aufgenommen:</b> Alex Alipe Set als Lab Series EP.21 veröffentlicht · <b>Vollständiges Lineup ↓</b>", fr:"<b>Enregistré en live :</b> set d'Alex Alipe sorti en Lab Series EP.21 · <b>Lineup complet ↓</b>", ja:"<b>ライブ録音:</b> Alex Alipe のセットが Lab Series EP.21 としてリリース · <b>全ラインナップ ↓</b>" },
    ev_sync_loc:{ pt:"brasil · porto alegre · centro histórico", en:"brazil · porto alegre · centro histórico", es:"brasil · porto alegre · centro histórico", de:"brasilien · porto alegre · centro histórico", fr:"brésil · porto alegre · centro histórico", ja:"ブラジル · ポルトアレグレ · セントロ・イストリコ" },

    ev_earth25_n: { pt:"Earthdance RS 2025 · Padang showcase", en:"Earthdance RS 2025 · Padang showcase", es:"Earthdance RS 2025 · showcase Padang", de:"Earthdance RS 2025 · Padang-Showcase", fr:"Earthdance RS 2025 · showcase Padang", ja:"Earthdance RS 2025 · Padang ショーケース" },
    ev_earth25_lu:{ pt:"<b>Sets Padang:</b> Dienstmann vs Vorg (b2b, gravado como Lab EP.18) · Tekmall (set completo) · Tenebra · Fabinho", en:"<b>Padang sets:</b> Dienstmann vs Vorg (b2b, recorded as Lab EP.18) · Tekmall (full set) · Tenebra · Fabinho", es:"<b>Sets Padang:</b> Dienstmann vs Vorg (b2b, grabado como Lab EP.18) · Tekmall (set completo) · Tenebra · Fabinho", de:"<b>Padang-Sets:</b> Dienstmann vs Vorg (b2b, aufgenommen als Lab EP.18) · Tekmall (komplettes Set) · Tenebra · Fabinho", fr:"<b>Sets Padang :</b> Dienstmann vs Vorg (b2b, enregistré en Lab EP.18) · Tekmall (set complet) · Tenebra · Fabinho", ja:"<b>Padang セット：</b> Dienstmann vs Vorg (b2b、Lab EP.18として録音) · Tekmall (フルセット) · Tenebra · Fabinho" },
    ev_earth25_loc:{ pt:"brasil · rio grande do sul", en:"brazil · rio grande do sul", es:"brasil · rio grande do sul", de:"brasilien · rio grande do sul", fr:"brésil · rio grande do sul", ja:"ブラジル · リオ・グランデ・ド・スル" },

    ev_arkana25_n: { pt:"Arkana Festival · 15 anos", en:"Arkana Festival · 15 years", es:"Arkana Festival · 15 años", de:"Arkana Festival · 15 Jahre", fr:"Arkana Festival · 15 ans", ja:"Arkana Festival · 15周年" },
    ev_arkana25_lu:{ pt:"<b>Set:</b> Tekmall @ Vale Sagrado dos Incas · curadoria Mallki", en:"<b>Set:</b> Tekmall @ Sacred Valley of the Incas · curated by Mallki", es:"<b>Set:</b> Tekmall @ Valle Sagrado de los Incas · curaduría Mallki", de:"<b>Set:</b> Tekmall @ Heiliges Tal der Inka · kuratiert von Mallki", fr:"<b>Set :</b> Tekmall @ Vallée Sacrée des Incas · curaté par Mallki", ja:"<b>セット：</b> Tekmall @ インカの聖なる谷 · Mallki キュレーション" },
    ev_arkana25_loc:{ pt:"peru · arkana edição comemorativa", en:"peru · arkana anniversary edition", es:"perú · arkana edición conmemorativa", de:"peru · arkana jubiläumsausgabe", fr:"pérou · arkana édition anniversaire", ja:"ペルー · arkana 記念エディション" },

    ev_bdt_n: { pt:"Bucht der Träumer · Waldtraut Stage", en:"Bucht der Träumer · Waldtraut Stage", es:"Bucht der Träumer · Waldtraut Stage", de:"Bucht der Träumer · Waldtraut Stage", fr:"Bucht der Träumer · Waldtraut Stage", ja:"Bucht der Träumer · Waldtraut Stage" },
    ev_bdt_lu:{ pt:"<b>Set:</b> Anaïs Lin (Padang Label DJ)", en:"<b>Set:</b> Anaïs Lin (Padang Label DJ)", es:"<b>Set:</b> Anaïs Lin (Padang Label DJ)", de:"<b>Set:</b> Anaïs Lin (Padang Label-DJ)", fr:"<b>Set :</b> Anaïs Lin (Padang Label DJ)", ja:"<b>セット：</b> Anaïs Lin (Padang レーベル DJ)" },
    ev_bdt_loc:{ pt:"alemanha", en:"germany", es:"alemania", de:"deutschland", fr:"allemagne", ja:"ドイツ" },

    ev_own_n: { pt:"Own Spirit Festival 2024 · Aoos", en:"Own Spirit Festival 2024 · Aoos", es:"Own Spirit Festival 2024 · Aoos", de:"Own Spirit Festival 2024 · Aoos", fr:"Own Spirit Festival 2024 · Aoos", ja:"Own Spirit Festival 2024 · Aoos" },
    ev_own_lu:{ pt:"<b>Live set:</b> Aoos (Padang) · disponível no SoundCloud do artista", en:"<b>Live set:</b> Aoos (Padang) · available on the artist's SoundCloud", es:"<b>Live set:</b> Aoos (Padang) · disponible en el SoundCloud del artista", de:"<b>Live-Set:</b> Aoos (Padang) · auf dem SoundCloud des Künstlers verfügbar", fr:"<b>Live set :</b> Aoos (Padang) · disponible sur le SoundCloud de l'artiste", ja:"<b>ライブセット：</b> Aoos (Padang) · アーティストの SoundCloud で公開" },
    ev_own_loc:{ pt:"spain", en:"spain", es:"españa", de:"spanien", fr:"espagne", ja:"スペイン" },

    ev_sanc_n: { pt:"Sanctuary 2025 · Halloween @ Bain Mathieu", en:"Sanctuary 2025 · Halloween @ Bain Mathieu", es:"Sanctuary 2025 · Halloween @ Bain Mathieu", de:"Sanctuary 2025 · Halloween @ Bain Mathieu", fr:"Sanctuary 2025 · Halloween @ Bain Mathieu", ja:"Sanctuary 2025 · ハロウィン @ Bain Mathieu" },
    ev_sanc_lu:{ pt:"<b>Set:</b> DJ Nuit Noire (Padang Label DJ) · curadora VA The Nightmare", en:"<b>Set:</b> DJ Nuit Noire (Padang Label DJ) · VA The Nightmare curator", es:"<b>Set:</b> DJ Nuit Noire (Padang Label DJ) · curadora VA The Nightmare", de:"<b>Set:</b> DJ Nuit Noire (Padang Label-DJ) · VA-The-Nightmare-Kuratorin", fr:"<b>Set :</b> DJ Nuit Noire (Padang Label DJ) · curatrice de VA The Nightmare", ja:"<b>セット：</b> DJ Nuit Noire (Padang レーベル DJ) · VA The Nightmare キュレーター" },
    ev_sanc_loc:{ pt:"montréal · canada", en:"montreal · canada", es:"montreal · canadá", de:"montreal · kanada", fr:"montréal · canada", ja:"モントリオール · カナダ" },

    ev_boom_n: { pt:"Boom Festival · MNGRM", en:"Boom Festival · MNGRM", es:"Boom Festival · MNGRM", de:"Boom Festival · MNGRM", fr:"Boom Festival · MNGRM", ja:"Boom Festival · MNGRM" },
    ev_boom_lu:{ pt:"<b>Set:</b> MNGRM (Padang) — Boom Festival, Portugal", en:"<b>Set:</b> MNGRM (Padang) — Boom Festival, Portugal", es:"<b>Set:</b> MNGRM (Padang) — Boom Festival, Portugal", de:"<b>Set:</b> MNGRM (Padang) — Boom Festival, Portugal", fr:"<b>Set :</b> MNGRM (Padang) — Boom Festival, Portugal", ja:"<b>セット：</b> MNGRM (Padang) — Boom Festival、ポルトガル" },
    ev_boom_loc:{ pt:"portugal · 24/07/2022", en:"portugal · 24/07/2022", es:"portugal · 24/07/2022", de:"portugal · 24.07.2022", fr:"portugal · 24/07/2022", ja:"ポルトガル · 2022/07/24" },

    /* ─ shop info-box ─ */
    shop_pod_h: { pt:"print on demand · global shipping", en:"print on demand · global shipping", es:"print on demand · envío global", de:"print on demand · weltweiter versand", fr:"print on demand · livraison mondiale", ja:"オンデマンド印刷 · 世界配送" },
    shop_pod_p: { pt:"Todos os itens da Spreadshirt são <b>print on demand</b> — fabricados sob demanda quando você compra. Envio mundial · prazo varia por destino · pagamento direto via Spreadshirt (cartão, PayPal, Apple/Google Pay). Suporte de produto: <b>service@spreadshirt.com</b>. Atacado / parcerias / dúvidas do selo: <b>shop@padangrecords.net</b>.",
                 en:"All Spreadshirt items are <b>print on demand</b> — manufactured on demand when you buy. Global shipping · delivery time varies by destination · payment directly via Spreadshirt (card, PayPal, Apple/Google Pay). Product support: <b>service@spreadshirt.com</b>. Wholesale / partnerships / label inquiries: <b>shop@padangrecords.net</b>.",
                 es:"Todos los items de Spreadshirt son <b>print on demand</b> — fabricados bajo demanda cuando compras. Envío mundial · plazo varía según destino · pago directo vía Spreadshirt (tarjeta, PayPal, Apple/Google Pay). Soporte de producto: <b>service@spreadshirt.com</b>. Mayorista / partnerships / dudas del sello: <b>shop@padangrecords.net</b>.",
                 de:"Alle Spreadshirt-Artikel sind <b>print on demand</b> — werden bei deinem Kauf auf Bestellung gefertigt. Weltweiter Versand · Lieferzeit variiert je nach Zielort · Bezahlung direkt über Spreadshirt (Karte, PayPal, Apple/Google Pay). Produkt-Support: <b>service@spreadshirt.com</b>. Großhandel / Partnerschaften / Label-Anfragen: <b>shop@padangrecords.net</b>.",
                 fr:"Tous les articles Spreadshirt sont en <b>print on demand</b> — fabriqués sur commande lors de ton achat. Livraison mondiale · délais variant selon la destination · paiement directement via Spreadshirt (carte, PayPal, Apple/Google Pay). Support produit : <b>service@spreadshirt.com</b>. Gros / partenariats / questions label : <b>shop@padangrecords.net</b>.",
                 ja:"Spreadshirt の全アイテムは<b>オンデマンド印刷</b> — 購入時に製造されます。世界配送 · 配送時間は配送先により異なります · Spreadshirt 経由で直接決済（カード、PayPal、Apple/Google Pay）。製品サポート: <b>service@spreadshirt.com</b>。卸売／パートナーシップ／レーベルへの問い合わせ: <b>shop@padangrecords.net</b>。" },

    /* ─ home roster meta ─ */
    home_roster_meta_static: { pt:"// 56 artistas · 17 confirmados via soundcloud · clique para bio · email · embed · vídeos padangtv", en:"// 56 artists · 17 confirmed via soundcloud · click for bio · email · embed · padangtv videos", es:"// 56 artistas · 17 confirmados vía soundcloud · clic para bio · email · embed · videos padangtv", de:"// 56 Künstler · 17 via Soundcloud bestätigt · klicken für Bio · E-Mail · Embed · PadangTV-Videos", fr:"// 56 artistes · 17 confirmés via soundcloud · clic pour bio · email · embed · vidéos padangtv", ja:"// 56 アーティスト · soundcloud で確認済 17 · クリックでバイオ · メール · 埋め込み · padangtv ビデオ" },

    /* ─ footer ─ */
    footer_rights: { pt:"© padang records · 2026 · all signals reserved", en:"© padang records · 2026 · all signals reserved", es:"© padang records · 2026 · todas las señales reservadas", de:"© padang records · 2026 · alle Signale vorbehalten", fr:"© padang records · 2026 · tous signaux réservés", ja:"© padang records · 2026 · all signals reserved" },
    footer_credit: { pt:"mockup · padang records · concept by carlos eduardo", en:"mockup · padang records · concept by carlos eduardo", es:"mockup · padang records · concepto por carlos eduardo", de:"mockup · padang records · Konzept von Carlos Eduardo", fr:"mockup · padang records · concept par carlos eduardo", ja:"モックアップ · padang records · コンセプト：カルロス・エドゥアルド" },

    /* ─ demo form labels ─ */
    demo_guide_h:    { pt:"// antes de enviar · leia", en:"// before sending · read", es:"// antes de enviar · lee", de:"// vor dem Senden · lesen", fr:"// avant d'envoyer · lis", ja:"// 送信前に · 必読" },
    demo_l_artist:   { pt:"nome do artista", en:"artist name", es:"nombre del artista", de:"Künstlername", fr:"nom d'artiste", ja:"アーティスト名" },
    demo_l_real:     { pt:"nome real", en:"real name", es:"nombre real", de:"Klarname", fr:"nom réel", ja:"本名" },
    demo_l_email:    { pt:"email", en:"email", es:"email", de:"E-Mail", fr:"email", ja:"メール" },
    demo_l_location: { pt:"país / cidade", en:"country / city", es:"país / ciudad", de:"Land / Stadt", fr:"pays / ville", ja:"国 / 都市" },
    demo_l_profile:  { pt:"seu soundcloud / bandcamp / instagram", en:"your soundcloud / bandcamp / instagram", es:"tu soundcloud / bandcamp / instagram", de:"dein soundcloud / bandcamp / instagram", fr:"ton soundcloud / bandcamp / instagram", ja:"あなたの soundcloud / bandcamp / instagram" },
    demo_l_sclink:   { pt:"link soundcloud (private/secret link preferido)", en:"soundcloud link (private/secret link preferred)", es:"link soundcloud (private/secret link preferido)", de:"SoundCloud-Link (private/secret link bevorzugt)", fr:"lien soundcloud (private/secret link préféré)", ja:"SoundCloud リンク（private/secret link 推奨）" },
    demo_l_genre:    { pt:"gênero principal", en:"main genre", es:"género principal", de:"Hauptgenre", fr:"genre principal", ja:"メインジャンル" },
    demo_l_bpm:      { pt:"bpm range", en:"bpm range", es:"rango bpm", de:"BPM-Bereich", fr:"plage bpm", ja:"BPM レンジ" },
    demo_l_bio:      { pt:"bio · 1 parágrafo curto", en:"bio · 1 short paragraph", es:"bio · 1 párrafo corto", de:"Bio · 1 kurzer Absatz", fr:"bio · 1 paragraphe court", ja:"バイオ · 短い1段落" },
    demo_l_msg:      { pt:"mensagem (opcional)", en:"message (optional)", es:"mensaje (opcional)", de:"Nachricht (optional)", fr:"message (optionnel)", ja:"メッセージ（任意）" },
    demo_l_decl:     { pt:"declarações", en:"declarations", es:"declaraciones", de:"Erklärungen", fr:"déclarations", ja:"宣言" },
    demo_decl_1:     { pt:"faixas inéditas · não lançadas", en:"unreleased tracks · never released", es:"pistas inéditas · sin publicar", de:"unveröffentlichte Tracks · nie veröffentlicht", fr:"morceaux inédits · jamais sortis", ja:"未発表トラック · 未リリース" },
    demo_decl_2:     { pt:"todos os samples / colabs autorizados", en:"all samples / collabs cleared", es:"todos los samples / colabs autorizados", de:"alle Samples / Kollaborationen geklärt", fr:"tous les samples / collabs autorisés", ja:"全サンプル／コラボ承諾済み" },
    demo_decl_3:     { pt:"li o guia acima", en:"I read the guide above", es:"leí la guía de arriba", de:"ich habe den Leitfaden oben gelesen", fr:"j'ai lu le guide ci-dessus", ja:"上記ガイドを読みました" },
    demo_note:       { pt:"// abre seu cliente de email com tudo pré-formatado", en:"// opens your email client with everything pre-filled", es:"// abre tu cliente de email con todo pre-formateado", de:"// öffnet dein E-Mail-Programm mit allem vorformatiert", fr:"// ouvre ton client mail avec tout préformaté", ja:"// メールクライアントに全項目を整形して開きます" },
    demo_submit:     { pt:"▶ enviar demo →", en:"▶ send demo →", es:"▶ enviar demo →", de:"▶ Demo senden →", fr:"▶ envoyer démo →", ja:"▶ デモを送る →" },

    /* ─ events: novos · 2026/27 ─ */
    ev_modem_n:    { pt:"Mo:Dem Festival · Momento Demento 2026", en:"Mo:Dem Festival · Momento Demento 2026", es:"Mo:Dem Festival · Momento Demento 2026", de:"Mo:Dem Festival · Momento Demento 2026", fr:"Mo:Dem Festival · Momento Demento 2026", ja:"Mo:Dem Festival · Momento Demento 2026" },
    ev_modem_lu:   { pt:"<b>Datas:</b> 03 — 09 ago · gates 01 ago · <b>Padang confirmado:</b> Anaïs Lin @ The Swamp · <b>Lineup completo:</b> TBA",
                     en:"<b>Dates:</b> 03 — 09 Aug · gates 01 Aug · <b>Padang confirmed:</b> Anaïs Lin @ The Swamp stage · <b>Full lineup:</b> TBA",
                     es:"<b>Fechas:</b> 03 — 09 ago · gates 01 ago · <b>Padang confirmado:</b> Anaïs Lin @ The Swamp · <b>Line-up completo:</b> TBA",
                     de:"<b>Daten:</b> 03. — 09. Aug · Gates 01. Aug · <b>Padang bestätigt:</b> Anaïs Lin @ The Swamp · <b>Komplettes Lineup:</b> TBA",
                     fr:"<b>Dates :</b> 03 — 09 août · gates 01 août · <b>Padang confirmé :</b> Anaïs Lin @ The Swamp · <b>Lineup complet :</b> TBA",
                     ja:"<b>日程：</b> 8月3〜9日 · gates 8月1日 · <b>Padang 確定：</b> Anaïs Lin @ The Swamp ステージ · <b>全ラインナップ：</b> 未定" },
    ev_modem_loc:  { pt:"croácia · donje primišlje · robinzon kamp", en:"croatia · donje primišlje · robinzon kamp", es:"croacia · donje primišlje · robinzon kamp", de:"Kroatien · Donje Primišlje · Robinzon Kamp", fr:"croatie · donje primišlje · robinzon kamp", ja:"クロアチア · ドンイェ・プリミシュリェ · ロビンゾン・キャンプ" },

    ev_drops_n:    { pt:"Drops Festival 2026 · Eslovênia", en:"Drops Festival 2026 · Slovenia", es:"Drops Festival 2026 · Eslovenia", de:"Drops Festival 2026 · Slowenien", fr:"Drops Festival 2026 · Slovénie", ja:"Drops Festival 2026 · スロベニア" },
    ev_drops_lu:   { pt:"<b>Datas:</b> 11 — 16 ago · <b>Padang confirmado:</b> Soulid · Mallki · <b>Palcos:</b> Drops (Lambda Labs QX3) · Cage (Funktion One) · Chill Station", en:"<b>Dates:</b> 11 — 16 Aug · <b>Padang confirmed:</b> Soulid · Mallki · <b>Stages:</b> Drops (Lambda Labs QX3) · Cage (Funktion One) · Chill Station", es:"<b>Fechas:</b> 11 — 16 ago · <b>Padang confirmado:</b> Soulid · Mallki · <b>Escenarios:</b> Drops (Lambda Labs QX3) · Cage (Funktion One) · Chill Station", de:"<b>Daten:</b> 11. — 16. Aug · <b>Padang bestätigt:</b> Soulid · Mallki · <b>Stages:</b> Drops (Lambda Labs QX3) · Cage (Funktion One) · Chill Station", fr:"<b>Dates :</b> 11 — 16 août · <b>Padang confirmé :</b> Soulid · Mallki · <b>Scènes :</b> Drops (Lambda Labs QX3) · Cage (Funktion One) · Chill Station", ja:"<b>日程：</b> 8月11〜16日 · <b>Padang 確定：</b> Soulid · Mallki · <b>ステージ：</b> Drops (Lambda Labs QX3) · Cage (Funktion One) · Chill Station" },
    ev_drops_loc:  { pt:"eslovênia · kranj · paintball club naklo · floresta udinborst", en:"slovenia · kranj · paintball club naklo · udinborst forest", es:"eslovenia · kranj · paintball club naklo · bosque udinborst", de:"slowenien · kranj · paintball club naklo · udinborst-wald", fr:"slovénie · kranj · paintball club naklo · forêt udinborst", ja:"スロベニア · クラニ · ペイントボール・クラブ・ナクロ · ウディンボルスト森林" },

    ev_foresterra_n:  { pt:"Foresterra Festival 2026 · Croácia", en:"Foresterra Festival 2026 · Croatia", es:"Foresterra Festival 2026 · Croacia", de:"Foresterra Festival 2026 · Kroatien", fr:"Foresterra Festival 2026 · Croatie", ja:"Foresterra Festival 2026 · クロアチア" },
    ev_foresterra_lu: { pt:"<b>Datas:</b> 20 — 23 ago · <b>Padang confirmado:</b> Mallki b2b Aru @ Foresterra Stage (forest/darkpsy) · Mallki solo @ Windmill Stage (dark prog/psytech) · <b>2 palcos</b> · organizado por Forestation & Egzoterra Kolektiv", en:"<b>Dates:</b> 20 — 23 Aug · <b>Padang confirmed:</b> Mallki b2b Aru @ Foresterra Stage (forest/darkpsy) · Mallki solo @ Windmill Stage (dark prog/psytech) · <b>2 stages</b> · hosted by Forestation & Egzoterra Kolektiv", es:"<b>Fechas:</b> 20 — 23 ago · <b>Padang confirmado:</b> Mallki b2b Aru @ Foresterra Stage (forest/darkpsy) · Mallki solo @ Windmill Stage (dark prog/psytech) · <b>2 escenarios</b> · organizado por Forestation & Egzoterra Kolektiv", de:"<b>Daten:</b> 20. — 23. Aug · <b>Padang bestätigt:</b> Mallki b2b Aru @ Foresterra Stage (forest/darkpsy) · Mallki solo @ Windmill Stage (dark prog/psytech) · <b>2 Stages</b> · veranstaltet von Forestation & Egzoterra Kolektiv", fr:"<b>Dates :</b> 20 — 23 août · <b>Padang confirmé :</b> Mallki b2b Aru @ Foresterra Stage (forest/darkpsy) · Mallki solo @ Windmill Stage (dark prog/psytech) · <b>2 scènes</b> · organisé par Forestation & Egzoterra Kolektiv", ja:"<b>日程：</b> 8月20〜23日 · <b>Padang 確定：</b> Mallki b2b Aru @ Foresterra Stage (forest/darkpsy) · Mallki solo @ Windmill Stage (dark prog/psytech) · <b>2ステージ</b> · 主催 Forestation & Egzoterra Kolektiv" },
    ev_foresterra_loc:{ pt:"croácia · fužine · kaubojsko selo roswell-fužine", en:"croatia · fužine · kaubojsko selo roswell-fužine", es:"croacia · fužine · kaubojsko selo roswell-fužine", de:"kroatien · fužine · kaubojsko selo roswell-fužine", fr:"croatie · fužine · kaubojsko selo roswell-fužine", ja:"クロアチア · フジネ · カウボイスコ・セロ・ロスウェル＝フジネ" },

    ev_hadra24_n: { pt:"Hadra Trance Festival 2024 · 15ª edição", en:"Hadra Trance Festival 2024 · 15th edition", es:"Hadra Trance Festival 2024 · 15ª edición", de:"Hadra Trance Festival 2024 · 15. Ausgabe", fr:"Hadra Trance Festival 2024 · 15ᵉ édition", ja:"Hadra Trance Festival 2024 · 第15回" },
    ev_hadra24_lu:{ pt:"<b>Set Padang:</b> Rhabia · <b>4 palcos:</b> Main · Alternative · Live · Dôme · 10.000 público · plan d'eau de vieure", en:"<b>Padang set:</b> Rhabia · <b>4 stages:</b> Main · Alternative · Live · Dôme · 10,000 attendees · plan d'eau de vieure", es:"<b>Set Padang:</b> Rhabia · <b>4 escenarios:</b> Main · Alternative · Live · Dôme · 10.000 asistentes · plan d'eau de vieure", de:"<b>Padang Set:</b> Rhabia · <b>4 Stages:</b> Main · Alternative · Live · Dôme · 10.000 Besucher · plan d'eau de vieure", fr:"<b>Set Padang :</b> Rhabia · <b>4 scènes :</b> Main · Alternative · Live · Dôme · 10 000 personnes · plan d'eau de vieure", ja:"<b>Padang セット：</b> Rhabia · <b>4ステージ：</b> Main · Alternative · Live · Dôme · 1万人来場 · plan d'eau de vieure" },
    ev_hadra24_loc:{ pt:"frança · vieure · allier", en:"france · vieure · allier", es:"francia · vieure · allier", de:"frankreich · vieure · allier", fr:"france · vieure · allier", ja:"フランス · ヴィユール · アリエ" },

    ev_arkana17_n: { pt:"Arkana Festival · edição 17 (2027)", en:"Arkana Festival · 17th edition (2027)", es:"Arkana Festival · edición 17 (2027)", de:"Arkana Festival · 17. Ausgabe (2027)", fr:"Arkana Festival · 17e édition (2027)", ja:"Arkana Festival · 第17回（2027）" },
    ev_arkana17_lu:{ pt:"<b>Curador:</b> Mallki (label DJ Padang) · <b>Vale Sagrado dos Incas</b> · 13+ anos do festival · data exata a confirmar",
                     en:"<b>Curator:</b> Mallki (Padang label DJ) · <b>Sacred Valley of the Incas</b> · 13+ years of the festival · exact date TBC",
                     es:"<b>Curador:</b> Mallki (DJ del sello Padang) · <b>Valle Sagrado de los Incas</b> · 13+ años del festival · fecha exacta a confirmar",
                     de:"<b>Kurator:</b> Mallki (Padang Label-DJ) · <b>Heiliges Tal der Inkas</b> · 13+ Jahre Festival · genaues Datum noch offen",
                     fr:"<b>Curateur :</b> Mallki (DJ du label Padang) · <b>Vallée Sacrée des Incas</b> · 13+ années du festival · date exacte à confirmer",
                     ja:"<b>キュレーター：</b> Mallki（Padang レーベル DJ）· <b>インカの聖なる谷</b> · 開催13年以上 · 正確な日程は未定" },
    ev_arkana17_loc:{ pt:"peru · vale sagrado dos incas", en:"peru · sacred valley of the incas", es:"perú · valle sagrado de los incas", de:"Peru · Heiliges Tal der Inkas", fr:"pérou · vallée sacrée des incas", ja:"ペルー · インカの聖なる谷" },

    /* ─ shop CTAs ─ */
    shop_open:          { pt:"↳ abrir →", en:"↳ open →", es:"↳ abrir →", de:"↳ öffnen →", fr:"↳ ouvrir →", ja:"↳ 開く →" },
    shop_view_products: { pt:"↳ ver produtos →", en:"↳ view products →", es:"↳ ver productos →", de:"↳ Produkte ansehen →", fr:"↳ voir les produits →", ja:"↳ 商品を見る →" }
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
