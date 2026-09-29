import type { IncomingMessage, ServerResponse } from 'node:http'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

/** Lê o corpo da requisição do Node inteiro em memória. */
async function readBody(req: IncomingMessage): Promise<Buffer> {
  const parts: Buffer[] = []
  for await (const part of req) parts.push(part as Buffer)
  return Buffer.concat(parts)
}

/** Converte a requisição do Node na `Request` padrão que a função da Vercel espera. */
async function toWebRequest(req: IncomingMessage): Promise<Request> {
  const headers = new Headers()
  for (const [name, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) value.forEach((item) => headers.append(name, item))
    else if (value !== undefined) headers.set(name, value)
  }
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD'
  return new Request(new URL(req.url ?? '/', 'http://localhost'), {
    method: req.method,
    headers,
    body: hasBody ? new Uint8Array(await readBody(req)) : undefined,
  })
}

/** Copia a `Response` padrão para a resposta do Node, repassando o stream aos poucos. */
async function sendWebResponse(response: Response, res: ServerResponse) {
  res.writeHead(response.status, Object.fromEntries(response.headers))
  if (!response.body) return res.end()

  const reader = response.body.getReader()
  res.on('close', () => void reader.cancel())
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    res.write(value)
  }
  res.end()
}

/**
 * Só no `vite dev`: a pasta `api/` é da Vercel e o Vite não a serve. Este plugin encaminha
 * `POST /api/ask` para o mesmo handler, carregado via `ssrLoadModule` (recarrega ao editar).
 */
function devApi(): Plugin {
  return {
    name: 'dev-api-ask',
    apply: 'serve',
    configureServer(server) {
      // `.env.local` vira `process.env`, como as variáveis de ambiente na Vercel.
      const env = loadEnv(server.config.mode, server.config.root, '')
      for (const [key, value] of Object.entries(env)) process.env[key] ??= value

      server.middlewares.use('/api/ask', async (req, res, next) => {
        try {
          const handler = (await server.ssrLoadModule('/api/ask.ts')) as {
            POST: (request: Request) => Promise<Response>
          }
          await sendWebResponse(await handler.POST(await toWebRequest(req)), res)
        } catch (error) {
          next(error)
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), devApi()],
})
