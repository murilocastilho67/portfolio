/**
 * Empacota a função da Vercel: `server/ask.ts` (+ `server/lib/*` + o índice do RAG) vira um único
 * `api/ask.js` em JavaScript puro. A Vercel roda esse arquivo sem compilar TypeScript nem resolver
 * imports `.ts` — foi exatamente isso que quebrava a função em produção.
 *
 * O arquivo gerado vai para o git. Rode `npm run build:api` sempre que mexer em `server/` (o
 * `npm run rag:index` já roda no fim, porque o índice vai embutido no pacote).
 */
import { rolldown } from 'rolldown'

const bundle = await rolldown({
  input: 'server/ask.ts',
  platform: 'node',
})

await bundle.write({
  file: 'api/ask.js',
  format: 'esm',
  banner: '// Gerado por scripts/build-api.mjs a partir de server/ask.ts — não edite à mão.',
})
await bundle.close()

process.stdout.write('api/ask.js gerado\n')
