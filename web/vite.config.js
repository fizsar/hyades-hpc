// SPDX-License-Identifier: AGPL-3.0-only
import { defineConfig } from 'vite'

// Strict CSP for production (set it in Caddy too). No 'unsafe-inline', no
// 'wasm-unsafe-eval' (there is no WebAssembly here) and no third-party origins.
// `npm run preview` serves the build with it. The dev server does not send it:
// Vite's hot reload injects inline <style> tags.
const CSP = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; " +
  "connect-src 'self'; object-src 'none'; worker-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"

export default defineConfig({
  base: './',
  server: { host: '127.0.0.1', port: 5176, strictPort: true },
  preview: { host: '127.0.0.1', port: 5177, strictPort: true, headers: { 'Content-Security-Policy': CSP } },
  build: { target: 'es2022', assetsInlineLimit: 0 },
})
