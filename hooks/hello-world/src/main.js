import { Hono } from 'hono'
import { Client } from 'node-appwrite'
import { serveStatic } from '@hono/node-server/serve-static'
import { Buffer } from 'node:buffer'
import * as fs from 'node:fs'
import * as path from 'node:path'

const app = new Hono()

app.use('/static/*', serveStatic({ root: './src/function/static' }))
app.get('/', (c) => c.text('Hello Node.js!'))
app.get('/some/other/route', (c) => c.html('<html>Some html</html>'))

// async function streamToBuffer(readableStream) {
//   return new Promise((resolve, reject) => {
//     const chunks = [];

//     readableStream.on('data', data => {
//       if (typeof data === 'string') {
//         chunks.push(Buffer.from(data, 'utf-8'))
//       } else if (data instanceof Buffer) {
//         chunks.push(data)
//       } else {
//         const jsonData = JSON.stringify(data);
//         chunks.push(Buffer.from(jsonData, 'utf-8'))
//       }
//     });

//     readableStream.on('end', () => {
//       resolve(Buffer.concat(chunks))
//     })

//     readableStream.on('error', reject)
//   })
// }

export default async ({ req, res, log, error }) => {
  const { url, body, bodyRaw, ...rest } = req
  const newRequest = new Request(new URL(url), rest)

  const output = await app.fetch(newRequest)

  const contentType = output.headers.get('Content-Type')
  const awaitArrayBuffer = await output.arrayBuffer()
  const bufferFromArrayBuffer = Buffer.from(awaitArrayBuffer, 'utf-8')

  log(process.cwd())

  log(fs.readdirSync(path.resolve(process.cwd(), './src/function/static')).toString())

  return res.send(bufferFromArrayBuffer, 200, {
    'Content-Type': contentType,
  })
}

// export default async ({ req, res, log, error }) => {
//   const customListener = getRequestListener(app.fetch, {
//     errorHandler: (err) => {
//       if (err) {
//         return error(err)
//       }

//       return res.json(err)
//     },
//     overrideGlobalObjects: true,
//   })

//   return customListener(req, res.send)
// }

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
