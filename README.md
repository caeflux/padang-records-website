# Padang Records — site final

Pasta canônica com os 7 HTMLs definitivos do mockup + sistema de tradução (i18n) em 6 idiomas. Para publicar, basta hospedar a pasta inteira (Netlify, Vercel, GitHub Pages, etc.) — o `index.html` é a entrada padrão.

## Páginas

| Arquivo | Tamanho | Conteúdo |
|---|---|---|
| **index.html** | 33 KB | Home: hero, manifesto, 18 releases (Bandcamp embeds), preview de 11 artistas, latest signal, embed PadangTV, CTA demo |
| **roster.html** | 38 KB | 56 artistas (17 confirmados, 39 pendentes) · cards clicáveis com foto real · modal de bio + email + embed SoundCloud + vídeos YouTube |
| **lab.html** | 19 KB | Playlist completa (21 EPs) + 8 episódios da Lab Series em destaque |
| **about.html** | 14 KB | Manifesto longo + timeline 2017-2026 + stats |
| **events.html** | 16 KB | 3 próximos + 7 históricos de eventos/festivais |
| **demo.html** | 16 KB | Form de submission com 12 campos + mailto pré-formatado |
| **shop.html** | 22 KB | 5 designs Spreadshirt + iframe live da loja |
| **i18n.js** | 32 KB | Sistema de tradução em 6 idiomas (~100 chaves) |
| **README.md** | 4 KB | Esta documentação |

Total: ~194 KB.

## Navegação

Todos os 7 HTMLs compartilham o mesmo nav fixo no topo, com 9 itens + seletor de idioma:

`Selo · Releases · Roster · Lab Series · PadangTV · Sobre · Eventos · Demo · Shop` · **`PT · EN · ES · DE · FR · JA`**

O item correspondente à página atual fica destacado em verde lime (`.on`). "Selo", "Releases" e "PadangTV" são anchors internos da home — clicar a partir de outra página leva pra home e rola. O idioma ativo no switcher também aparece em verde lime.

## Sistema de tradução (i18n)

**Como funciona:**
- O arquivo `i18n.js` carrega em todas as 7 páginas (via `<script src="./i18n.js" defer>`).
- Elementos com atributo `data-i18n="chave"` são automaticamente traduzidos quando o usuário troca o idioma.
- A escolha de idioma persiste em `localStorage` (`padang-lang`), então uma vez que o usuário escolhe DE/JA/etc., navegar entre páginas mantém a língua.
- Auto-detecta o idioma do navegador na primeira visita (`navigator.language`) e cai pra PT como default se não for um dos 6 suportados.

**Idiomas suportados:**
- 🇧🇷 **PT** · Português (padrão · idioma original do conteúdo)
- 🇬🇧 **EN** · English
- 🇪🇸 **ES** · Español
- 🇩🇪 **DE** · Deutsch
- 🇫🇷 **FR** · Français
- 🇯🇵 **JA** · 日本語

**Cobertura atual (~100 chaves traduzidas):**

Traduzidas em todos os 6 idiomas: itens do menu, headlines, taglines de hero, manifesto principal, labels de stats, CTAs (botões e títulos de demo), labels da seção PadangTV, filtros e badges do roster (confirmado/pendente/com vídeo), labels do formulário de demo, labels da página shop (5 designs, ver produtos, abrir), descrições da Lab Series, intros das seções de eventos, headers/footers compartilhados.

**Não-traduzidas ainda (ficam em PT):**

Bios individuais dos 56 artistas no roster (`roster.html`) · descrições detalhadas do timeline em `about.html` · descrições individuais de eventos em `events.html` · texto do guia "antes de enviar · leia" no `demo.html` · textos longos nos info-boxes do shop. Esses são conteúdos extensos que ficam melhor traduzidos em batches dedicados — fácil de adicionar incrementalmente: basta criar a chave no `i18n.js` e marcar o elemento com `data-i18n="nova_chave"`.

**Adicionando novas traduções:**

```js
// Em i18n.js, dentro do objeto DICT:
nova_chave: {
  pt: "Texto em português",
  en: "English text",
  es: "Texto en español",
  de: "Deutscher Text",
  fr: "Texte en français",
  ja: "日本語のテキスト"
}
```

```html
<!-- No HTML, marcar o elemento: -->
<p data-i18n="nova_chave">Texto em português</p>
```

O JS detecta automaticamente. Conteúdo HTML dentro do valor é preservado (usa `innerHTML` se detecta tags, `textContent` caso contrário).

## Identidade visual

- **Cores neon**: `--neon-1` lime `#c4ff3d` · `--neon-2` magenta `#ff2bd6` · `--neon-3` cyan `#42e8ff` · `--neon-4` orange `#ff7a18`
- **Fundo**: dark `#070710` com overlay de scanlines (`body::after`)
- **Tipografia**: `Space Grotesk` (corpo) · `JetBrains Mono` (UI/uppercase) · `Major Mono Display` (headlines lowercase)
- **Hero**: blobs psicodélicos animados em todos os heros, com gradiente lime no `h1`

## Integrações externas

- **Bandcamp**: 18 release embeds + link store · `padang.bandcamp.com`
- **SoundCloud**: 17 perfis de artistas + playlist Lab Series · `soundcloud.com/padangrec`
- **YouTube PadangTV**: canal embedado na home + vídeos individuais (MNGRM, Tekmall) na modal do roster · `youtube.com/channel/UCOFQWuWtL1njucmHIXf0R3A`
- **Spreadshirt**: 5 designs com imagens da CDN + iframe live · `padang.myspreadshop.com`
- **Beatport · Discogs · Instagram · Facebook**: links nos footers

## Para publicar

```bash
# Netlify drop
# Arraste a pasta padang-final/ inteira para app.netlify.com/drop

# Vercel
cd padang-final/
npx vercel --prod

# GitHub Pages
# Suba como repositório, ative Pages na branch main, pasta root
```

Domínio sugerido: `padangrecords.net` (substituindo o atual hospedado em construtor de sites).

## Próximos passos sugeridos

- [ ] Traduzir bios individuais dos 39 artistas pendentes (depois de validá-los) — adicionar chaves `bio_NomeArtista` no `i18n.js`
- [ ] Traduzir timeline detalhado em about.html, descrições de eventos
- [ ] Validar os 39 artistas pendentes do roster (encontrar SC + foto + email)
- [ ] Páginas individuais por artista (`/artist/headweller.html` etc.)
- [ ] Migrar para Next.js / React (stack original solicitado · facilita gerenciamento de i18n via `next-i18next`)
- [ ] Atualizar dados de eventos com agenda real do selo
