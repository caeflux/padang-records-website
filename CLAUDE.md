# CLAUDE.md — Padang Records website runbook

Guia operacional pra qualquer assistente Claude (Claude Code, Cowork, Sonnet-via-API) que abrir este diretório. Este é o site oficial da label Padang Records — estático (HTML/CSS/JS + 1 PHP) — deploy contínuo via git.

## Contexto rápido

- **Live:** https://padangrecords.net (HostGator shared hosting)
- **Owner:** Carlos Dienstmann (fundador da label, artista Dienstmann)
- **Repo:** https://github.com/caeflux/padang-records-website (**precisa ficar público** — o cron do cPanel usa clone HTTPS sem deploy key)
- **Workspace:** `C:\Users\carlo\OneDrive\Documentos\Claude\Projects\Website Padang Records\padang-final\` (todos os arquivos ficam aqui, na raiz do repo)
- **Deploy:** cron cPanel roda a cada 5min → `git fetch origin main + reset --hard + copia pra public_html/` via `.cpanel.yml`

## Fluxo de deploy (padrão que USAR)

```
1. Editar arquivos no workspace (ver "Como editar" abaixo)
2. Clonar repo em /tmp/padang-deploy no sandbox Linux (se não existir)
3. Copiar arquivos editados do workspace → /tmp/padang-deploy
4. git add + commit (mensagem descritiva) + push origin main
5. Cron pega em ≤5min automaticamente — não precisa fazer mais nada
```

Snippet reutilizável de deploy:

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
cd /tmp/padang-deploy
# copiar arquivos alterados do OneDrive:
cp "/sessions/<session>/mnt/Website Padang Records/padang-final/<file>" <file>
git add <files>
git commit -m "clara mensagem descritiva"
git push origin main
```

## Como editar arquivos (importante!)

### ⚠️ NÃO use o `Edit` tool direto em arquivos grandes de `padang-final/`
O OneDrive silenciosamente **trunca** arquivos grandes escritos por Edit/Write. Sintomas: arquivo fica menor do que deveria, script quebra mid-statement, JS não valida.

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
# JS externos:
node --check i18n-bios.js
node --check i18n-extra.js

# JS embutido em HTML (extraia primeiro):
python3 -c "
s = open('index.html').read()
i = s.find('<script>')
j = s.find('</script>', i)
open('/tmp/check.js','w').write(s[i+8:j])
"
node --check /tmp/check.js
```

## Mapa de arquivos

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Home · hero, roster carrossel, releases 12 mais recentes, Latest Signal, PadangTV grid |
| `roster.html` | 58 artistas · card grid + modal de bio · array JS embutido |
| `releases.html` | 108 releases · por ano, com Bandcamp embed 470px altura |
| `events.html` | 21 eventos · card + modal expansível · EVDATA dict inline |
| `lab.html` | 21 episódios Padang Lab Series · SoundCloud embeds |
| `about.html` | Timeline da label 2013→2026 |
| `demo.html` | Formulário de submissão · valida SC/Drive/Dropbox URL · manda pra `send-demo.php` |
| `shop.html` | Spreadshirt embed |
| `send-demo.php` | Backend do demo form · envia email pra `contact@padangrecords.net` |
| `data/releases.json` | Fonte canônica do catálogo (108 entradas ordenadas por data desc) |
| `i18n.js` | 6 idiomas (PT/EN/ES/DE/FR/JA) · chaves nav + genéricas |
| `i18n-bios.js` | Bios traduzidas dos artistas (EN/ES/DE/FR/JA — PT é source em roster.html) |
| `i18n-extra.js` | Chaves de events, lab, demo, shop |
| `i18n-lab.js` | Metadados dos 21 Lab episodes |
| `img/artists/` | Fotos locais dos artistas (fallback pra SC avatar, ver "Avatares") |
| `img/logo-full.png`, `img/padang-logo.png` | Logos |
| `fotos artistas/<slug>/` | Pasta onde o user dropa fotos+bios originais (input, não é servido) |
| `.cpanel.yml` | Script de deploy (rsync-like via `cp -R`) |
| `.htaccess` | HTML `no-cache` · CSS/JS 5min · imagens 30 dias |

## Estruturas de dados chave

### Roster entry (roster.html)
```js
{n:"NomeArtístico",c:"BR",s:1,sc:"https://soundcloud.com/handle",p:"https://i1.sndcdn.com/avatars-XXX.jpg",yt:null,r:[["album_id","Album Name"]],va:[["va_id","VA Name"]],b:"<b>Real Name</b>, Cidade, País. Bio...",e:"contact@email OU D"}
```
- `n`: nome de palco (usado como display + chave)
- `c`: código país (BR/PT/GR/etc)
- `s`: 1=confirmed (verde), 0=pending review
- `sc`: URL SC completa (pode ser search fallback)
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
- `data/releases.json`: source of truth
- `index.html`: card no grid latest-12, número de counter (`107 releases`), Latest Signal iframe
- `releases.html`: card no ano correspondente + counter do ano

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
1. `data/releases.json`: prepend nova entrada (formato: slug, url, title, artist, released ISO, released_label, lastmod, tracks, album_id)
2. `index.html`: swap ★ LATEST card, demote release anterior pra tipo normal, incrementa counter 107→108 (todas ocorrências), atualiza caption + iframe da Latest Signal
3. `releases.html`: swap ★ LATEST do ano correspondente, incrementa counter do ano
4. Bandcamp album_id vem do URL do embed player oficial (formato `album=XXXXXXX`)

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

- **`mcp__workspace__bash`** — shell Linux com Python, Node, git. Use pra tudo que não é edição
- **`mcp__workspace__web_fetch`** — pega URL como markdown renderizado; BLOQUEADO pra alguns domínios (SC CDN); NÃO renderiza JS
- **`WebSearch`** — search web via Anthropic search
- **Chrome MCP** (`mcp__claude-in-chrome__*`) — pra páginas JS-heavy (YouTube, Bandcamp, Google Sheets, cPanel). Load via ToolSearch primeiro. Usa `browser_batch` pra múltiplas ações em 1 call
- **`Read` / `Write` / `Edit`** — file tools; **evita Edit em roster.html/events.html/i18n-bios.js** (grandes → OneDrive trunca)

## Analytics

Meta Pixel `2047697899170790` instalado em todas as 8 páginas.

Eventos custom disparados:
- `PageView` — automático em todas as páginas
- `Lead` — demo.html quando `send-demo.php` retorna ok (payload inclui gênero)
- `ViewContent` — roster.html abrir modal de artista (payload: artist name)
- `ViewContent` — events.html abrir modal de evento (payload: event id)
- `Contact` — universal mailto: click tracker

## Gotchas conhecidos

- **OneDrive truncation** — nunca use Edit/Write direto em arquivos grandes em `padang-final/`. Use Python via sandbox.
- **Repo público obrigatório** — se ficar privado, cron para de puxar silenciosamente. Livre pra ver, só push precisa PAT.
- **SC CDN 403** — SoundCloud às vezes bloqueia hotlink de avatares. O roster.html tem fallback JS (`probe.onerror`) que degrada pra gradient + iniciais. Solução permanente: baixar foto pra `img/artists/`.
- **`.crdownload`** — quando o user dropa foto via Chrome save-as, aparece `.jpg.crdownload` primeiro. Espera terminar antes de copiar.
- **YouTube web_fetch timeout** — página do canal é JS-heavy, timeout via `web_fetch`. Use Chrome MCP + `ytInitialData` walker (padrão já usado em index.html VIDS).
- **Bandcamp release_date** — não vem em `og:` meta; extraia de `window.TralbumData.album_release_date` (ver patch de releases).

## Contatos e recursos

- **Email geral / eventos:** contact@padangrecords.net
- **Demos submission:** demos@padangrecords.net (só no `send-demo.php`)
- **cPanel:** https://padangrecords.net:2083 (user tem acesso, cron do Git Version Control roda a cada 5min)
- **GitHub PAT** — necessário só pra `git push` (leitura é pública). Pedir ao user via prompt/env var no início da sessão; nunca commitar. User gerou um com escopo `contents:write` no repo `caeflux/padang-records-website`.
- **Google Drive** com bios/EPKs originais dos artistas (referenciado na memória, não indexado aqui)
- **Google Sheet** de aniversários: `Padangers Birthday's Date.xlsx` (id `164cOl_2paNfluWBO5U65JOQfLRJn09X3`)

## Estado atual (snapshot 2026-06-24)

- 58 artistas no roster (32 com foto local ou SC avatar, restante gradient+iniciais)
- 108 releases catalogados (mais recente: Orbsynth — Integrated, 24 Jun 2026)
- 21 eventos (16 futuros / 5 históricos)
- 21 episódios Padang Lab Series
- Meta Pixel ativo
- Cron pipeline funcionando (repo público, deploy ≤5min)

## Ao final de qualquer edição — checklist

- [ ] JS válido (`node --check`)
- [ ] Contagem de linhas comparável ao antes (detectar truncation)
- [ ] Committed com mensagem clara descrevendo *o que + porquê*
- [ ] Pushado pra `main`
- [ ] Verificado ao vivo em ≤5min (via `mcp__workspace__web_fetch` ou Chrome MCP)

---

Última atualização: 2026-06-24 · commit `0eb5d95`
