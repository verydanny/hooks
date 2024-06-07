/**
 * Using node-21.0 open-runtime
 */
import { fileURLToPath } from 'node:url'
import { html, raw } from 'hono/html'
import * as path from 'node:path'
import * as fs from 'node:fs'
import { Readable, Stream } from 'node:stream'

import { Hono } from 'hono'
import { serveStatic } from './serveStatic.mjs'
import { getRequestListener } from './getRequestListener.mjs'

const app = new Hono()

app.use('/static/*', serveStatic({ root: 'src/function' }))

app.get('/', (c) => c.html('Hello open-runtime!'))
app.get('/some/other/route', (c) => c.html(
  html`<html>
    <h1>Hello World</h1>
  </html>`
))

export default async ({ req, res, log, error }) => {
  const requestListener = getRequestListener(app.fetch, {
    overrideGlobalObjects: true
  })

  const initRequestListener = requestListener(error)

  // const __filename = fileURLToPath(import.meta.url)
  // const __dirname = path.dirname(__filename)
  // const staticFolder = path.join(__dirname, '../static')
  const body = req?.method === 'GET' || req?.method === 'HEAD' ? undefined : req.body

  try {
    const response = await initRequestListener(req, res)
    // const normalizedRequest = new Request(new URL(req.url), {
    //   headers: req.headers,
    //   body,
    //   method: req.method
    // })
    // const response = await app.fetch(normalizedRequest)
    // const text = await response.text()

    // If it's text, then send text

    // If it's data, send Readable


    let headers = {}
    for (const [key, value] of response.headers.entries()) {
      headers[key] = value
    }

    const normalizedStream = Readable.fromWeb(response.body)

    return res.send(normalizedStream, 200, headers)
  } catch (e) {
    error(e)
  }

  return res.json(
    {
      hello: 'world',
    },
    200
  )
}

// This is your Appwrite function
// It's executed each time we get a request
// export default async ({ req, res, log, error }) => {
//   // Why not try the Appwrite SDK?
//   //
//   // const client = new Client()
//   //    .setEndpoint('https://cloud.appwrite.io/v1')
//   //    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
//   //    .setKey(process.env.APPWRITE_API_KEY);

//   // You can log messages to the console
//   log('Hello, Logs!');

//   // If something goes wrong, log an error
//   error('Hello, Errors!');

//   // The `req` object contains the request data
//   if (req.method === 'GET') {
//     // Send a response with the res object helpers
//     // `res.send()` dispatches a string back to the client
//     return res.send('Hello, World!');
//   }
// };
