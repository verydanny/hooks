/**
 * Using node-21.0 open-runtime
 */
// import { fileURLToPath } from 'node:url'
import { html } from 'hono/html'
// import * as path from 'node:path'
// import * as fs from 'node:fs'
import { Readable } from 'node:stream'

import { Hono } from 'hono'
import { serveStatic } from './serveStatic.mjs'

const app = new Hono()

// Static files work perfectly
app.use('/static/*', serveStatic({ root: 'src/function' }))

// Anything text or JSON-based fails
app.get('/', (c) => c.html(html`
  <html>
  <html lang="en">
  <head>
  </head>
  <body>
    <h1>Hello World</h1>
  </body>
  </html>
`))

// JSON-test, also not working
app.get('/some/other/route', (c) => c.json({
  payload: {
    username: 'Testing'
  }
}))

export default async ({ req, res, log, error }) => {
  const body = req?.method === 'GET' || req?.method === 'HEAD' ? undefined : req.body

  try {
    const request = new Request(
      new URL(req.url),
      {
        headers: req.headers,
        method: req.method,
        body
      }
    )

    const response = await app.fetch(request)
    const blob = await response.blob()

    log(blob.type)
    log(blob.size)

    let headers = {}
    for (const [key, value] of response.headers.entries()) {
      headers[key] = value
    }

    if (!headers['content-length'] && blob.size) {
      headers['content-length'] = blob.size
    }

    log(JSON.stringify(headers, null, 2))

    return res.send(Readable.from(blob.stream()), 200, headers)
  } catch (e) {
    error(e)
  }
}
