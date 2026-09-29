# murilo.dev — portfólio

Site pessoal de Murilo Castilho: sistemas internos, dados e IA aplicada.
Página única em React 19 + TypeScript (strict) + Vite + Tailwind CSS v4, com PT/EN, paleta de comandos (`Ctrl/Cmd+K` ou `/`) e um terminal interativo no hero.

## Stack

- Vite + React 19 + TypeScript strict
- Tailwind CSS v4 (configuração CSS-first: tokens em `@theme`, em `src/index.css`)
- Fontes self-hosted (`@fontsource-variable/space-grotesk` e `jetbrains-mono`), sem requisições ao Google Fonts
- i18n próprio (`src/i18n`): `pt.ts` é a fonte de verdade do formato e `en.ts` é tipado como `typeof pt`, então chave faltando quebra o `tsc`
- Sem biblioteca de UI ou de animação: CSS + hooks pequenos em `src/hooks`
- Lint com oxlint (regras de a11y do JSX incluídas) e formatação com Prettier

## Desenvolvimento

```bash
npm install
npm run dev       # servidor local em http://localhost:5173
npm run lint      # oxlint
npm run format    # prettier
npm run build     # tsc -b + vite build (saída em dist/)
npm run preview   # serve o build de produção localmente
npm test          # testes das funções puras de api/_lib (node --test)
npm run rag:index # regera o índice do assistente (ver "Pergunte ao Murilo")
```

## Estrutura

```
src/
  components/   seções e peças de UI (Nav, Hero, Terminal, CommandPalette, ...)
  data/         dados estáticos (projetos, carreira, stack) — textos vêm do i18n por id
  hooks/        useTyping, useInView, useScrollSpy, useFocusTrap, ...
  i18n/         dicionários pt/en, LangProvider e useT
  lib/          utilitários puros (comandos do terminal, cliente da API, clipboard, scroll)
api/
  ask.ts        Vercel Function do assistente (POST /api/ask)
  _lib/         funções puras: retrieve, buildPrompt, parseGeminiSse, rateLimit, ...
  _data/        rag-index.json, o índice vetorial gerado por `npm run rag:index`
rag/            sobre-mim.md, conteúdo escrito à mão que entra no índice
scripts/        build-rag-index.ts
tests/          testes das funções de api/_lib
```

## Deploy (Vercel)

Site estático mais uma Vercel Function (`api/ask.ts`) para o assistente.

1. Suba o repositório para o GitHub.
2. Na Vercel: **Add New → Project**, importe o repositório. O preset **Vite** é detectado sozinho (`npm run build`, saída `dist`).
3. Cada push na branch principal gera um novo deploy. O `vercel.json` já define cache imutável para `/assets` e cabeçalhos básicos de segurança.

Via CLI: `npx vercel --prod`.

## Pergunte ao Murilo (RAG)

O terminal do hero responde perguntas sobre o Murilo (`ask <pergunta>`, `pergunte <pergunta>`, ou qualquer linha terminada em `?` ou com 4+ palavras). A resposta usa **só o conteúdo do site**:

1. `npm run rag:index` quebra o conteúdo de `src/i18n/pt.ts` e de `rag/sobre-mim.md` em trechos e gera embeddings (`gemini-embedding-001`, 768 dimensões) em `api/_data/rag-index.json`.
2. `POST /api/ask` vetoriza a pergunta, busca os trechos mais parecidos (similaridade de cosseno) e chama o Gemini com streaming (SSE). O frontend mostra o texto chegando e as fontes citadas, cada uma com link para a seção.
3. Limite best-effort por IP (6/min e 40/dia, em memória). O teto real de custo é a cota gratuita do Gemini.

Configuração:

1. Crie uma chave em https://aistudio.google.com/apikey **em um projeto do Google Cloud sem billing**. Assim ela nunca gera cobrança: quando a cota gratuita acaba, o Gemini só para de responder e o site mostra "assistente offline".
2. Coloque `GEMINI_API_KEY=...` em `.env.local` (ignorado pelo git).
3. Rode `npm run rag:index` e **commite** `api/_data/rag-index.json`. Rode de novo sempre que o conteúdo do site (ou `rag/sobre-mim.md`) mudar. Sem embeddings no índice a API responde `index_missing` e o site mostra "assistente offline".
4. `npm run dev` já serve `/api/ask` (plugin do Vite, só em desenvolvimento, lendo o `.env.local`).
5. Na Vercel: Project Settings → Environment Variables → `GEMINI_API_KEY`. Opcionais: `GEMINI_MODEL` (padrão `gemini-3.5-flash-lite`) e `GEMINI_EMBED_MODEL` (padrão `gemini-embedding-001`; se trocar, regere o índice).

`node --experimental-strip-types scripts/build-rag-index.ts --no-embed` grava os trechos sem embeddings (não precisa de chave).

## Analytics

O site usa o Vercel Web Analytics (`@vercel/analytics`), sem cookies e sem dado pessoal. O componente `<Analytics />` só carrega em produção na Vercel; em desenvolvimento não faz nada.

1. Depois do primeiro deploy, no projeto da Vercel abra a aba **Analytics** e clique em **Enable**.
2. Não há mais nada para configurar: as visualizações de página funcionam no plano gratuito.
3. Os eventos customizados (`src/lib/analytics.ts`: `ask_question`, `copy_email`, `open_linkedin`, `open_github`, `open_palette`, `switch_lang`, `switch_theme`, `konami`, `boot_skipped`) podem exigir um plano pago; confira no painel. O texto das perguntas feitas ao terminal nunca é enviado.

## Tema, abertura e extras

- **Tema claro/escuro:** variáveis `--c-*` em `src/index.css` trocam por `html[data-theme]`. A escolha fica em `localStorage` (`theme`); sem escolha, segue o sistema ao vivo. Um script inline no `index.html` aplica o tema antes da primeira pintura. O terminal e a abertura são escuros nos dois temas de propósito (`.theme-dark-island`).
- **Abertura (boot):** toca só na primeira visita (`localStorage` `booted`). `?boot` na URL força; o comando `reboot` no terminal repete. Não toca com redução de movimento.
- **Easter eggs:** cada um é isolado e fácil de apagar. Comandos do terminal em `src/lib/extras.ts` (mais os textos em `terminal.out`/`terminal.extras` do i18n); Konami e chuva âmbar em `src/hooks/useKonami.ts` e `src/components/MatrixRain.tsx`; recado do console em `src/hooks/useConsoleBanner.ts`.

## Pendências antes de publicar

- Descomentar e preencher o `<link rel="canonical">` em `index.html` com o domínio final.
- Adicionar `public/og.png` (1200x630) e as tags `og:image` / `twitter:image` (e trocar `twitter:card` para `summary_large_image`). A imagem não está no repositório, então as tags foram omitidas para não apontar para um arquivo inexistente.

## Acessibilidade

Skip link, landmarks semânticos, foco visível, alvos de toque de 44px, `prefers-reduced-motion` respeitado (sem digitação, marquee, contagem, pulso ou traçado de diagramas), botão de pausar o marquee (WCAG 2.2.2) e contraste AA nos tokens de cor dos dois temas.
