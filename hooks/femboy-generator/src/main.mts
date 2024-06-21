/**
 * Using node-21.0 open-runtime
 */
// import { fileURLToPath } from 'node:url'
import { html } from "hono/html"
import { Readable } from "node:stream"
import { getRequestListener } from "./getRequestListener.mjs"

import { Hono } from "hono"
import type { Context } from "./types.js"

const app = new Hono()

app.get("/", (c) =>
  c.html(html`
    <html>
      <html lang="en">
        <head> </head>
        <body>
          <h1>Hello World</h1>
        </body>
      </html>
    </html>
  `),
)

app.get("/api/:param", (c) => {
  const param = c.req.param("param")
  const query = c.req.query("q")

  return c.json({
    param,
    query,
  })
})

const initListener = getRequestListener(app.fetch, {
  overrideGlobalObjects: true,
})

export default async ({ req, res, error }: Context) => {
  const listener = initListener(error)

  try {
    const response = await listener(req, res)

    if (response) {
      const blob = await response.blob()

      const headers = Object.fromEntries(response.headers.entries())

      // This is only needed on Appwrite, if this isn't included
      // then text and json-based routes will loop forever
      if (!headers["content-length"] && blob.size) {
        headers["content-length"] = blob.size.toString()
      }

      headers["Cache-Control"] = "public,max-age=31536000"

      return res.send(Readable.from(blob.stream()), 200, headers)
    }
  } catch (e) {
    error(e)
  }
}
