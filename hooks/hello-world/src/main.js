/**
 * Using node-21.0 open-runtime
 */
// import { fileURLToPath } from 'node:url'
import { html } from 'hono/html'
import { Readable } from 'node:stream'
import { getRequestListener } from './getRequestListener.mjs'

import { Hono } from 'hono'
import { serveStatic } from './serveStatic.mjs'

const app = new Hono()

// Static files work perfectly
app.use('/static/*', serveStatic({ root: 'src/function' }))

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

app.get('/api/:param', c => {
  const param = c.req.param('param')
  const query = c.req.query('q')

  return c.json({
    param,
    query
  })
})

app.post('/api/post/:someparam', c => {
  const param = c.req.param('someparam')

  return c.json({
    status: 'success',
    param
  })
})

// JSON-test, confirmed working now
app.get('/some/other/route', (c) => c.json({
  payload: {
    username: 'Testing'
  }
}))

const initListener = getRequestListener(app.fetch, {
  overrideGlobalObjects: true
})

export default async ({ req, res, log, error }) => {
  const listener = initListener(error)

  try {
    const response = await listener(req, res)
    const blob = await response.blob()

    let headers = {}
    for (const [key, value] of response.headers.entries()) {
      headers[key] = value
    }

    // This is only needed on Appwrite, if this isn't included
    // then text and json-based routes will loop forever
    if (!headers['content-length'] && blob.size) {
      headers['content-length'] = blob.size
    }

    headers['Cache-Control'] = "max-age=14400"

    return res.send(Readable.from(blob.stream()), 200, headers)
  } catch (e) {
    error(e)
  }
}
