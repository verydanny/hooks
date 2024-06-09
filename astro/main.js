/**
 * Using node-21.0 open-runtime
 */
import { handler as ssrHandler } from './dist/server/entry.mjs'
import { Readable } from 'node:stream'
import { getRequestListener } from './getRequestListener.mjs'

import { Hono } from 'hono'
import { serveStatic } from './serveStatic.mjs'

const app = new Hono()

// Static files work perfectly
app.use('/*', serveStatic({ root: 'src/function/dist/client' }))
app.use(ssrHandler)

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

    return res.send(Readable.from(blob.stream()), 200, headers)
  } catch (e) {
    error(e)
  }
}
