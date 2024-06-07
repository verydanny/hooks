/**
 * Using node-21.0 open-runtime
 */
import { fileURLToPath } from 'node:url'
import * as path from 'node:path'
import * as fs from 'node:fs'
import { Readable, Stream } from 'node:stream'

import { Hono } from 'hono'
import { serveStatic } from './serveStatic.mjs'
import { getRequestListener } from './getRequestListener.mjs'

const app = new Hono()

/**
   * `root` in serveStatic has to be based on cwd, so when my CURRENT function's root directory is `hooks/hello-world`
   * and my OPEN_RUNTIMES_ENTRYPOINT=`main.js` then process.cwd() should be `/usr/local/server`
   * and my hook should be in `/usr/local/server/src/function/src/main.js`, and that works PERFECTLY locally
   * (I mocked with node 21.0 and open-runtime's `server.js`), it can't find my files in the container
   */
app.use('/static/*', serveStatic({ root: '' }))

// Setting up routes with HONO work ...mostly
app.get('/', (c) => c.html('Hello open-runtime!'))
app.get('/some/other/route', (c) => c.html('<html>Some html</html>'))

export default async ({ req, res, log, error }) => {
  const requestListener = getRequestListener(app.fetch, {
    overrideGlobalObjects: true
  })

  const initRequestListener = requestListener(error)

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const staticFolder = path.join(__dirname, '../static')

  try {
    const response = await initRequestListener(req, res)
    const normalizedStream = Readable.fromWeb(await response.body)
   
    return res.send(normalizedStream, 200, {
      ...response.headers
    })
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
