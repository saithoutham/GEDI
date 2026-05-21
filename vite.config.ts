import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, loadEnv, type PluginOption, type PreviewServer, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// @ts-expect-error Shared server helper is implemented in plain JS for both Vite dev and serverless API usage.
import { handleGeaiRequest } from './server/geai.js'
// @ts-expect-error Shared server helper is implemented in plain JS for both Vite dev and serverless API usage.
import { handlePlacesRequest } from './server/places.js'

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  const plugins: PluginOption[] = [
    react(),
    tailwindcss(),
    {
      name: 'geai-dev-api',
      configureServer(server: ViteDevServer) {
        server.middlewares.use('/api/places', async (req: IncomingMessage, res: ServerResponse) => {
          if (req.method !== 'GET') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }
          const result = await handlePlacesRequest(req.url || '/api/places');
          res.statusCode = result.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(result.body));
        });

        server.middlewares.use('/api/geai', async (req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) => {
          if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            res.end();
            return;
          }

          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }

          let rawBody = '';

          req.on('data', (chunk: Buffer | string) => {
            rawBody += chunk;
          });

          req.on('end', async () => {
            try {
              const payload = rawBody ? JSON.parse(rawBody) : {};
              const result = await handleGeaiRequest(payload, {
                headers: {
                  origin: req.headers.origin,
                },
              });

              res.statusCode = result.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result.body));
            } catch (error) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error: error instanceof Error ? error.message : 'GEAI dev middleware failed.',
                })
              );
            }
          });

          req.on('error', next);
        });
      },
      configurePreviewServer(server: PreviewServer) {
        server.middlewares.use('/api/places', async (req: IncomingMessage, res: ServerResponse) => {
          if (req.method !== 'GET') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }
          const result = await handlePlacesRequest(req.url || '/api/places');
          res.statusCode = result.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(result.body));
        });
      },
    },
  ];
  try {
    // @ts-ignore
    const m = await import('./.vite-source-tags.js');
    plugins.push(m.sourceTags());
  } catch {}
  return {
    plugins,
    define: {
      'import.meta.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY': JSON.stringify(env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''),
    },
  };
})
