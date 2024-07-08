/**
 * Using node-21.0 open-runtime
 */
// import { fileURLToPath } from 'node:url'
import { html } from "hono/html"
import { serve } from "@gravlabs/appwrite-hono-adapter-node"
import { extname } from "node:path"

import { Hono } from "hono"

interface Post {
  file_url: string
}

interface Booru {
  post: Array<Post>
}

const app = new Hono()
const fetchAPI = `https://gelbooru.com/index.php?api_key=${process.env.GELBOORU_API}&user_id=${process.env.GELBOORU_USER_ID}&page=dapi&s=post&q=index&json=1&tags=trap+-rating:e`

const cachedFemboys: { file_url: string; mime?: string }[] = []
const baseMimes = {
  aac: "audio/aac",
  avi: "video/x-msvideo",
  avif: "image/avif",
  av1: "video/av1",
  bin: "application/octet-stream",
  bmp: "image/bmp",
  css: "text/css",
  csv: "text/csv",
  eot: "application/vnd.ms-fontobject",
  epub: "application/epub+zip",
  gif: "image/gif",
  gz: "application/gzip",
  htm: "text/html",
  html: "text/html",
  ico: "image/x-icon",
  ics: "text/calendar",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "text/javascript",
  json: "application/json",
  jsonld: "application/ld+json",
  map: "application/json",
  mid: "audio/x-midi",
  midi: "audio/x-midi",
  mjs: "text/javascript",
  mp3: "audio/mpeg",
  mp4: "video/mp4",
  mpeg: "video/mpeg",
  oga: "audio/ogg",
  ogv: "video/ogg",
  ogx: "application/ogg",
  opus: "audio/opus",
  otf: "font/otf",
  pdf: "application/pdf",
  png: "image/png",
  rtf: "application/rtf",
  svg: "image/svg+xml",
  tif: "image/tiff",
  tiff: "image/tiff",
  ts: "video/mp2t",
  ttf: "font/ttf",
  txt: "text/plain",
  wasm: "application/wasm",
  webm: "video/webm",
  weba: "audio/webm",
  webp: "image/webp",
  woff: "font/woff",
  woff2: "font/woff2",
  xhtml: "application/xhtml+xml",
  xml: "application/xml",
  zip: "application/zip",
  "3gp": "video/3gpp",
  "3g2": "video/3gpp2",
  gltf: "model/gltf+json",
  glb: "model/gltf-binary",
} as const

// Lazy fetch all the bois edfsdf
if (cachedFemboys.length === 0) {
  fetch(fetchAPI).then(async (result) => {
    const response = (await result.json()) as Booru

    for (let { file_url } of response.post) {
      cachedFemboys.push({
        mime: baseMimes[extname(file_url).slice(1) as keyof typeof baseMimes],
        file_url,
      })
    }
  })
}

app.get("/", (c) => {
  if (cachedFemboys.length > 0) {
    const pluckAboy =
      cachedFemboys[Math.floor(Math.random() * cachedFemboys.length)]

    c.header("Link", `<${pluckAboy?.file_url}>; rel="preconnect"`)

    return c.html(html`
      <html>
        <html lang="en">
          <head>
            <style>
              img {
                max-width: 800px;
                margin: 0 auto;
              }
            </style>
            <link rel="prefetch" href="${pluckAboy?.file_url}" />
            <link rel="preload" href="${pluckAboy?.file_url}" as="image" type="${pluckAboy?.mime}" />
          </head>
          <body>
            <img src="${pluckAboy?.file_url}" />
          </body>
        </html>
      </html>
    `)
  }

  return c.html(html`
    <html>
      <html lang="en">
        <head> </head>
        <body>
          <h1>I haven't cached yet, please reload me</h1>
        </body>
      </html>
    </html>
  `)
})

app.get("/api/:param", (c) => {
  const param = c.req.param("param")
  const query = c.req.query("q")

  return c.json({
    param,
    query,
  })
})

export default serve(app)
