# CLAUDE.md — Padang Records website runbook

Guia operacional pra qualquer assistente Claude (Claude Code, Cowork, Sonnet-via-API) que abrir este diretório. Este é o site oficial da label Padang Records — estático (HTML/CSS/JS + 2 PHP), gerado por idioma pelo `build-i18n.js` — deploy contínuo via git.

## Contexto rápido

- **Live:** https://padangrecords.net (HostGator shared hosting)
- **Owner:** Carlos Dienstmann (fundador da label, artista Dienstmann)
- **Repo:** https://github.com/caeflux/padang-records-website (**precisa ficar público** — o cron do cPanel usa clone HTTPS sem deploy key)
- **Workspaces** (dois computadores):
  - **Mac:** `~/Library/Mobile Documents/com~apple~CloudDocs/Padang Records/` — clone direto do repo. `gh` logado como `caeflux` e Node 22 em `~/.local/bin` (`export PATH="$HOME/.local/bin:$PATH"`). Push funciona sem token.
  - **Windows:** `C:\Users\carlo\OneDrive\Documentos\Claude\Projects\Website Padang Records\padang-final\` — cópia de trabalho no OneDrive + clone em `/tmp/padang-deploy` no sandbox (ver "Fluxo de deploy").
  - **Antes de começar em qualquer um dos dois: `git pull`** — o outro computador pode ter publicado.
- **Deploy:** cron cPanel roda **a cada 20 min, nos minutos :00, :20 e :40** (medido em 18/09/2026) → `git fetch origin main + reset --hard + copia pra public_html/` via `.cpanel.yml`. Arquivo ou pasta nova só vai ao ar se estiver listado no `.cpanel.yml`.

## Build por idioma — OBRIGATÓRIO antes de todo push

O site tem uma URL por idioma: PT na raiz (`/releases.html`) e `/en/`, `/es/`, `/de/`, `/fr/`, `/ja/` (`/de/releases.html`). As versões de idioma são **geradas** — nunca edite nada dentro de `en/ es/ de/ fr/ ja/`, nem o bloco `<!-- seo:start … seo:end -->` do `<head>`.

```bash
node build-i18n.js
```

Rode **depois de qualquer mudança** em uma das 8 páginas, em `i18n*.js` ou em `data/*.json`, e **antes de todo commit/push**. O build:
- aplica as traduções dos `data-i18n` (PT fica gravado na raiz, que é fonte e saída ao mesmo tempo; os outros idiomas vão para as subpastas);
- gera `<title>`, `meta description`, `canonical`, `hreflang` (6 idiomas + `x-default` → `/en/`) e `og:locale` a partir das chaves `seo_title_<página>` / `seo_desc_<página>` do `i18n.js`;
- reescreve `sitemap.xml` e `robots.txt`;
- valida a sintaxe de todo `<script>` inline gerado (erro aborta o build).

É idempotente: rodar duas vezes seguidas deve dizer `0 arquivos alterados`. Texto novo em HTML deve ganhar `data-i18n="chave"` + a chave nos 6 idiomas; sem chave, o texto sai igual em todos os idiomas. Página nova precisa entrar em `PAGES` no `build-i18n.js`, ganhar as duas chaves `seo_*` e entrar no `.cpanel.yml`.

Troca de idioma no navegador: o botão navega para a URL do idioma e salva a escolha em `localStorage` (`padang-lang`). Na chegada, só essa escolha explícita redireciona — nunca o idioma do navegador (o Googlebot precisa ver cada URL no idioma dela).

## Fluxo de deploy (padrão que USAR)

```
1. git pull                       (o outro computador pode ter publicado)
2. Editar a FONTE: as 8 páginas da raiz, i18n*.js, data/*.json, track.js, blocks.css…
   (nunca en/ es/ de/ fr/ ja/ release/ nem sitemap.xml/robots.txt — são gerados)
3. node build-i18n.js             (deve terminar sem erro; 2ª rodada = "0 arquivos alterados")
4. node --check <cada .js editado>
5. git add -A && git commit -m "mensagem descritiva" && git push origin main
6. Cron publica na próxima rodada (:00, :20 ou :40) — conferir ao vivo com ?cb=<aleatório>
```

**Mac** (clone direto, `gh` já autenticado):

```bash
cd "$HOME/Library/Mobile Documents/com~apple~CloudDocs/Padang Records"
export PATH="$HOME/.local/bin:$PATH"
git pull && node build-i18n.js && git add -A && git commit -m "…" && git push origin main
```

**Windows / sandbox Linux** (workspace no OneDrive + clone em `/tmp`):

```bash
cd /tmp
[ -d padang-deploy ] || {
  GH_PAT="<pat_here>"  # PAT só é preciso pra push; leitura é pública
  git clone "https://caeflux:${GH_PAT}@github.com/caeflux/padang-records-website.git" padang-deploy
  cd padang-deploy
  git config user.email "caealemao@gmail.com"
  git config user.name "Carlos Eduardo"
  cd ..
}
cd /tmp/padang-deploy && git pull
# copiar arquivos-FONTE alterados do OneDrive:
cp "/sessions/<session>/mnt/Website Padang Records/padang-final/<file>" <file>
node build-i18n.js                # gera en/ es/ de/ fr/ ja/ release/ sitemap robots
git add -A
git commit -m "clara mensagem descritiva"
git push origin main
# depois do push, traga de volta para o OneDrive o que o build reescreveu na raiz
# (as 8 páginas recebem o PT e o bloco <!-- seo -->), senão a próxima cópia desfaz o build
```

## Como editar arquivos (importante!)

### ⚠️ NÃO use o `Edit` tool direto em arquivos grandes de `padang-final/`
O OneDrive silenciosamente **trunca** arquivos grandes escritos por Edit/Write (no Mac, o repo fica no iCloud Drive — mesmo cuidado: patches via Python e conferir tamanho/sintaxe depois). Sintomas: arquivo fica menor do que deveria, script quebra mid-statement, JS não valida.

**Ao invés disso**, escreva um script Python que atua no sandbox mount:

```python
from pathlib import Path
p = Path("/sessions/<session>/mnt/Website Padang Records/padang-final/roster.html")
s = p.read_text(encoding='utf-8')
s = s.replace("old string", "new string")
p.write_text(s, encoding='utf-8')
```

Salve em `/tmp/patch.py` (não no OneDrive) e execute via bash. Isso escreve direto no arquivo do disco sem passar por Edit/OneDrive sync.

### Sempre valide antes de commit
```bash
node --check i18n.js i18n-extra.js i18n-lab.js i18n-bios.js track.js newsletter.js build-i18n.js
node build-i18n.js   # compila todo <script> inline das 708 páginas geradas; erro aborta
```

## Mapa de arquivos

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Home · hero, roster carrossel, releases recentes, **Padang Complete**, Latest Signal, PadangTV, **newsletter** |
| `roster.html` | 58 artistas · card grid + modal de bio · array JS embutido · deep link `roster.html#artist=<slug>` abre o modal |
| `releases.html` | 110 releases · por ano, Bandcamp embed · nome do artista no card linka `/release/<slug>/` (feito pelo build) · Padang Complete no fim |
| `events.html` | eventos · card + modal expansível · EVDATA dict inline |
| `lab.html` | 24 episódios Padang Lab Series · SoundCloud embeds |
| `about.html` | Timeline da label 2013→2026 |
| `demo.html` | Formulário de submissão · valida SC/Drive/Dropbox URL · manda pra `send-demo.php` |
| `shop.html` | Spreadshirt embed |
| `send-demo.php` | Backend do demo form · envia email pra `contact@padangrecords.net` |
| `send-newsletter.php` | Backend da newsletter · honeypot + validação · e-mail `[newsletter] <lang> <email>` pra `contact@` |
| `build-i18n.js` | **Build** (Node, sem deps): idiomas, SEO, páginas de release, sitemap, robots — ver seção própria |
| `track.js` | Medição GA4 nas 8 páginas + releases: outbound_click, UTMs, language_selected, embed_play |
| `newsletter.js` | Envio do form `.nl-form` (PHP → fallback FormSubmit) + evento `newsletter_signup` |
| `blocks.css` | Estilos compartilhados de `.pcomp` (Padang Complete) e `.nl` (newsletter) |
| `en/ es/ de/ fr/ ja/` | **Gerado** — as 8 páginas por idioma + `release/` de cada idioma |
| `release/<slug>/` | **Gerado** — página PT de cada release; `release/release.css` = estilo do releases.html + layout da página |
| `sitemap.xml`, `robots.txt` | **Gerados** — 708 URLs com alternates hreflang; robots bloqueia `/admin/` e `/artist/` |
| `admin/` | Área restrita da label · login Supabase (allowlist), upload CSV Bandcamp, relatórios/royalties, checklist merch/e-mail, insights · **sem GA/Pixel, noindex** · docs: `../ARQUITETURA-AREA-RESTRITA.md` (fora do repo) |
| `artist/` | Portal do artista · login próprio, net revenue/share 60%/saldo via RPCs sem PII · bilíngue PT/EN · **sem GA/Pixel, noindex** · não linkar no site principal |
| `data/releases.json` | Fonte canônica do catálogo (110 entradas, data desc) — alimenta páginas de release, sitemap e contadores |
| `data/lab-series.json` | Episódios da Lab Series |
| `i18n.js` | 6 idiomas (PT/EN/ES/DE/FR/JA) · nav + genéricas + `seo_*` + `rel_*` + `pc_*` + `nl_*` · troca de idioma por URL |
| `i18n-bios.js` | Bios traduzidas dos artistas (EN/ES/DE/FR/JA — PT é source em roster.html) |
| `i18n-extra.js` | Chaves de events, lab, demo, shop |
| `i18n-lab.js` | Metadados dos Lab episodes |
| `img/artists/` | Fotos locais dos artistas (fallback pra SC avatar, ver "Avatares") |
| `img/logo-full.png`, `img/padang-logo.png` | Logos |
| `fotos artistas/<slug>/` | Pasta onde o user dropa fotos+bios originais (input, não é servido) |
| `.cpanel.yml` | Script de deploy (`cp -R`) — **arquivo/pasta nova só vai ao ar se entrar aqui** |
| `.htaccess` | HTML `no-cache` · CSS/JS 5min · imagens 30 dias |

## Estruturas de dados chave

### Roster entry (roster.html)
```js
{n:"NomeArtístico",c:"BR",s:1,sc:"https://soundcloud.com/handle",bc:null,p:"https://i1.sndcdn.com/avatars-XXX.jpg",yt:null,r:[["album_id","Album Name"]],va:[["va_id","VA Name"]],b:"<b>Real Name</b>, Cidade, País. Bio...",e:"contact@email OU D"}
```
- `n`: nome de palco (usado como display + chave)
- `c`: código país (BR/PT/GR/etc)
- `s`: 1=confirmed (verde), 0=pending review
- `sc`: URL SC completa (pode ser search fallback)
- `bc`: Bandcamp próprio do artista (`"https://x.bandcamp.com/"`) ou `null` — quando preenchido, aparece "on bandcamp" no modal
- `p`: URL avatar (SC hotlink OU `./img/artists/<slug>.jpg` local — tem fallback JS pra gradient+iniciais se falhar)
- `yt`: `null` ou `[["Label","yt_video_id"]]`
- `r`: releases EP/LP no Padang, formato `[["bandcamp_album_id","Title"]]`
- `va`: participações em VAs Padang, mesmo formato
- `b`: bio em PT com `<b>` para destaques
- `e`: email do artista OU `D` (constante que expande pra `demos@padangrecords.net`)

### Event entry (events.html)
```html
<div class="ev">
  <div class="dt">
    <div class="fest-logo" style="..."><span>XX</span></div>
    <div class="day">DD</div><div class="mo">mmm/YY</div>
  </div>
  <div class="body">
    <span class="tag fest">festival</span>
    <span class="tag label">padang artists</span>
    <div class="name" data-i18n="ev_<slug>_n">Default English text</div>
    <div class="lineup" data-i18n="ev_<slug>_lu">Dates, stages, Padang confirmed</div>
    <div class="lineup-avs"><a href="..." class="av"><img src="..."><span>Artist</span></a></div>
    <div class="loc" data-i18n="ev_<slug>_loc">country · city · venue</div>
  </div>
  <span class="arr">→</span>
</div>
```
Também precisa registrar no EVDATA (inline JS) e nas 3 i18n keys nos 6 idiomas em `i18n-extra.js`.

### Release entry
- `data/releases.json`: source of truth. Campos: `slug`, `url`, `title`, `artist` (`null` = VA), `released` (ISO), `released_label` ("02 Sep 2026"), `lastmod`, `tracks`, `album_id`, `type` (`EP`/`LP`/`VA`), `beatport_url` (ou `null` — sem botão Beatport), `cover_url` (`https://f4.bcbits.com/img/a<art_id>_10.jpg`), `description_en` e `credits` (texto do Bandcamp, ou `null`), `tracklist` (`[{"n":1,"title":"…","duration":449}]`, uma faixa por linha)
- `build-i18n.js` gera `/release/<slug>/` × 6 idiomas (capa, tracklist, embed, Buy on Bandcamp/Beatport, frase indexável traduzida, JSON-LD `MusicAlbum`, link pro roster) e põe no sitemap
- `index.html`: card no grid, Latest Signal iframe e contadores manuais (`110 releases`, `+98`)
- `releases.html`: card no ano correspondente + counter do ano
- Contadores `<b class="pc-n">` (Padang Complete) e `<span class="rel-count">` (hero do catálogo) são **sincronizados pelo build** — não editar

## Convenções de conteúdo (do memory + user preferences)

- **Nunca** cite outras labels em bios (não escreva "Zenon Records", "Space Baby Rec", "Digital Om")
- "Zenonesque" como descritor de gênero é OK (é vocabulário psy comum, várias bios usam)
- **Nunca** revelar o nome real de AOOS (regra explícita da label)
- Falzar e MNGRM **não são** artistas do roster (aparecem só em VAs históricos)
- Vocabulário Padang: "spiritual beat seekers", "world wild artists", "save your ears from sameness", "minimal techno + pitada de psy", "freaky groovy tribal"
- **Nunca** use "Psytechno" (usa "psy tech" ou "dark progressive")
- Não use "Forest" como label/gênero cast — usa "forest psy" descritivamente
- Não duplicar email do artista no corpo da bio (o campo `e:` já resolve)
- Não usar filtros/tabs no roster (removidos por decisão de design)
- Não usar badges de status nos cards (removidos)

## Padrões pra tarefas comuns

### Adicionar artista ao roster
1. Fetch SC via `mcp__workspace__web_fetch` pra pegar bio + avatar
2. Escrever entry em roster.html na posição alfabética correta (`grep -nE '^\{n:"' roster.html`)
3. Adicionar bios traduzidas em `i18n-bios.js` (EN/ES/DE/FR/JA) — insira antes do próximo artista alfabético
4. Se o user tem foto local em `fotos artistas/<slug>/`, copia pra `img/artists/<slug>.jpg` e usa `p:"./img/artists/<slug>.jpg"`
5. Fluxo padrão de deploy

### Adicionar release
1. Dados do Bandcamp: abrir `https://padang.bandcamp.com/album/<slug>` e ler o JSON `data-tralbum` (`current.id` = album_id, `art_id`, `trackinfo`, `current.about`, `current.credits`, `current.release_date`)
2. `data/releases.json`: prepend a entrada **com todos os campos** (ver "Release entry"); `beatport_url` quando o release estiver no Beatport
3. `index.html`: swap ★ LATEST card, demote release anterior pra tipo normal, incrementa `110 releases` (todas ocorrências) e o `+98`, atualiza caption + iframe da Latest Signal
4. `releases.html`: swap ★ LATEST do ano correspondente, incrementa counter do ano
5. Se o artista está no roster: `r:[["album_id","Título"]]` na entry
6. `node build-i18n.js` → gera as 6 páginas do release, linka o card, atualiza sitemap e contadores `pc-n`/`rel-count`
7. Fluxo padrão de deploy

### Adicionar evento
1. Card HTML em `events.html` inserido cronologicamente na seção "2026 upcoming" (ou history se passado)
2. EVDATA entry na constante inline (title, about, site, tickets)
3. 3 chaves em `i18n-extra.js` (`ev_<slug>_n`, `_lu`, `_loc`) nos 6 idiomas
4. Chips do lineup usam SC avatars (hotlink) OU foto local se tiver

### Trocar foto de artista pra local
1. User dropa foto em `fotos artistas/<slug>/` OU `fotos artistas/<slug>.jpg` (raiz)
2. Python copia pra `img/artists/<slug>.jpg`
3. Update `p:` no roster.html + qualquer chip em events.html que use o SC avatar antigo
4. Deploy

## Ferramentas úteis nesta sessão

(Windows/Cowork. No Mac: `Bash` local tem git, `gh`, Node 22 e python3; o painel de preview não lê a pasta do iCloud — para testar, espelhe com `rsync` para uma pasta temporária e sirva com `python3 -m http.server`.)


- **`mcp__workspace__bash`** — shell Linux com Python, Node, git. Use pra tudo que não é edição
- **`mcp__workspace__web_fetch`** — pega URL como markdown renderizado; BLOQUEADO pra alguns domínios (SC CDN); NÃO renderiza JS
- **`WebSearch`** — search web via Anthropic search
- **Chrome MCP** (`mcp__claude-in-chrome__*`) — pra páginas JS-heavy (YouTube, Bandcamp, Google Sheets, cPanel). Load via ToolSearch primeiro. Usa `browser_batch` pra múltiplas ações em 1 call
- **`Read` / `Write` / `Edit`** — file tools; **evita Edit em roster.html/events.html/i18n-bios.js** (grandes → OneDrive trunca)

## Analytics

### GA4 `G-355LVX96J2` (8 páginas + páginas de release; nunca em `/admin/` e `/artist/`)

| Evento | Onde | Parâmetros |
|---|---|---|
| `outbound_click` | `track.js` — clique (e clique do meio) em link para Bandcamp, Beatport, SoundCloud, Spotify, YouTube, Spreadshop | `platform`, `page`, `release_slug`, `lang`, `link_url` |
| `language_selected` | `track.js` — botão de idioma | `lang`, `from_lang`, `page` |
| `embed_play` | `track.js` — janela perde o foco para um iframe (heurística; 1× por iframe por pageview) | `platform`, `page`, `release_slug`, `album_id`, `lang` |
| `demo_submit` | `demo.html` — envio aceito | `genre`, `lang` |
| `newsletter_signup` | `newsletter.js` — inscrição aceita | `lang`, `page` |

**Eventos-chave** (marcar na interface do GA4 → Admin → Eventos): `outbound_click`, `demo_submit`, `newsletter_signup`. Para ver os parâmetros nos relatórios, registrar como dimensões personalizadas (escopo evento): `platform`, `page`, `release_slug`, `lang`, `from_lang`, `genre`, `album_id`.

**UTMs**: `track.js` acrescenta em runtime, em todo link para Bandcamp/Beatport, `utm_source=padangrecords.net&utm_medium=<page>&utm_campaign=<release_slug|catalog>&utm_content=<lang>` (o bloco Padang Complete usa `utm_campaign=full-discography` via `data-release`). Não mexe em UTMs de terceiros; preserva query strings.

`page` = `index`, `releases`, `roster`, `lab`, `events`, `about`, `demo`, `shop` ou `release`. `lang` = idioma da URL.

### Meta Pixel `2047697899170790` (8 páginas + páginas de release)

- `PageView` — automático em todas as páginas
- `Lead` — demo.html quando `send-demo.php` retorna ok (payload inclui gênero)
- `ViewContent` — roster.html abrir modal de artista (payload: artist name)
- `ViewContent` — events.html abrir modal de evento (payload: event id)
- `Contact` — universal mailto: click tracker

## Gotchas conhecidos

- **Cron de 20 min, não 5** — push logo depois de :00/:20/:40 espera até a rodada seguinte. Conferir com `?cb=<aleatório>` na URL.
- **Cache de JS/CSS de 5 min** (`.htaccess`) — logo após o deploy, o navegador pode juntar HTML novo com JS antigo; se algo parecer não funcionar, espere 5 min ou recarregue forçado.
- **Pastas geradas** — editar `en/…`, `release/…`, `sitemap.xml` ou o bloco `<!-- seo -->` à mão é perdido no próximo build.
- **Sem redirecionamento pelo idioma do navegador** — de propósito (SEO). Só a escolha salva (`padang-lang`) redireciona.
- **OneDrive truncation** — nunca use Edit/Write direto em arquivos grandes em `padang-final/`. Use Python via sandbox.
- **Repo público obrigatório** — se ficar privado, cron para de puxar silenciosamente. Livre pra ver, só push precisa PAT.
- **SC CDN 403** — SoundCloud às vezes bloqueia hotlink de avatares. O roster.html tem fallback JS (`probe.onerror`) que degrada pra gradient + iniciais. Solução permanente: baixar foto pra `img/artists/`.
- **`.crdownload`** — quando o user dropa foto via Chrome save-as, aparece `.jpg.crdownload` primeiro. Espera terminar antes de copiar.
- **YouTube web_fetch timeout** — página do canal é JS-heavy, timeout via `web_fetch`. Use Chrome MCP + `ytInitialData` walker (padrão já usado em index.html VIDS).
- **Bandcamp release_date** — não vem em `og:` meta; extraia de `window.TralbumData.album_release_date` (ver patch de releases).

## Contatos e recursos

- **Email geral / eventos:** contact@padangrecords.net
- **Demos submission:** demos@padangrecords.net (só no `send-demo.php`)
- **cPanel:** https://padangrecords.net:2083 (user tem acesso, cron do Git Version Control roda a cada 20 min: :00/:20/:40)
- **GitHub** — push só com autenticação (leitura é pública). Mac: `gh` logado (`gh auth status`), sem token manual. Windows/sandbox: PAT pedido ao user no início da sessão; nunca commitar.
- **Google Drive** com bios/EPKs originais dos artistas (referenciado na memória, não indexado aqui)
- **Google Sheet** de aniversários: `Padangers Birthday's Date.xlsx` (id `164cOl_2paNfluWBO5U65JOQfLRJn09X3`)

## Estado atual (snapshot 2026-09-18)

- 58 artistas no roster (campo `bc` ainda `null` em todos — preencher conforme o user informar)
- 110 releases catalogados (mais recente: Champirolls — Beyond Fences, 02 Sep 2026); 72 com Beatport
- 24 episódios Padang Lab Series (mais recente: EP.24 VORG live @ Arkana Festival 2026)
- 708 URLs: 8 páginas × 6 idiomas + 110 releases × 6 idiomas
- GA4 com 5 eventos + UTMs; Meta Pixel ativo; newsletter capturando via e-mail para `contact@`
- Cron pipeline funcionando (repo público, deploy a cada 20 min)

## Ao final de qualquer edição — checklist

- [ ] `node build-i18n.js` rodado (2ª rodada = 0 arquivos alterados)
- [ ] JS válido (`node --check`)
- [ ] Contagem de linhas comparável ao antes (detectar truncation)
- [ ] Committed com mensagem clara descrevendo *o que + porquê*
- [ ] Pushado pra `main`
- [ ] Verificado ao vivo na rodada seguinte do cron (≤20 min), com `?cb=` para furar cache

---

Última atualização: 2026-09-18 · blocos de crescimento (medição, SEO internacional, páginas de release, conversão)
