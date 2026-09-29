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
```

## Estrutura

```
src/
  components/   seções e peças de UI (Nav, Hero, Terminal, CommandPalette, ...)
  data/         dados estáticos (projetos, carreira, stack) — textos vêm do i18n por id
  hooks/        useTyping, useInView, useScrollSpy, useFocusTrap, ...
  i18n/         dicionários pt/en, LangProvider e useT
  lib/          utilitários puros (comandos do terminal, clipboard, scroll)
```

## Deploy (Vercel)

Site estático, sem backend.

1. Suba o repositório para o GitHub.
2. Na Vercel: **Add New → Project**, importe o repositório. O preset **Vite** é detectado sozinho (`npm run build`, saída `dist`).
3. Cada push na branch principal gera um novo deploy. O `vercel.json` já define cache imutável para `/assets` e cabeçalhos básicos de segurança.

Via CLI: `npx vercel --prod`.

## Pendências antes de publicar

- Descomentar e preencher o `<link rel="canonical">` em `index.html` com o domínio final.
- Adicionar `public/og.png` (1200x630) e as tags `og:image` / `twitter:image` (e trocar `twitter:card` para `summary_large_image`). A imagem não está no repositório, então as tags foram omitidas para não apontar para um arquivo inexistente.

## Acessibilidade

Skip link, landmarks semânticos, foco visível, alvos de toque de 44px, `prefers-reduced-motion` respeitado (sem digitação, marquee, contagem, pulso ou traçado de diagramas), botão de pausar o marquee (WCAG 2.2.2) e contraste AA nos tokens de cor.
