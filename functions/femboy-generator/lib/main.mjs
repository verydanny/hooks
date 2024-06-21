/**
 * Using node-21.0 open-runtime
 */
// import { fileURLToPath } from 'node:url'
import { html } from "hono/html";
import { Readable } from "node:stream";
import { getRequestListener } from "./getRequestListener.mjs";
import { Hono } from "hono";
const app = new Hono();
const fetchAPI = `https://gelbooru.com/index.php?api_key=${process.env.GELBOORU_API}&user_id=${process.env.GELBOORU_USER_ID}&page=dapi&s=post&q=index&json=1&tags=trap+-rating:e`;
const cachedFemboys = [];
// Lazy fetch all the bois
if (cachedFemboys.length === 0) {
    fetch(fetchAPI).then(async (result) => {
        const response = await result.json();
        for (let { file_url } of response.post) {
            cachedFemboys.push(file_url);
        }
    });
}
app.get("/", (c) => {
    if (cachedFemboys.length > 0) {
        const pluckAboy = cachedFemboys[Math.floor(Math.random() * cachedFemboys.length)];
        return c.html(html `
      <html>
        <html lang="en">
          <head>
            <style>
              img {
                max-width: 500px;
              }
            </style>
          </head>
          <body>
            <img src="${pluckAboy}" />
          </body>
        </html>
      </html>
    `);
    }
    return c.html(html `
    <html>
      <html lang="en">
        <head> </head>
        <body>
          <h1>I haven't cached yet, please reload me</h1>
        </body>
      </html>
    </html>
  `);
});
app.get("/api/:param", (c) => {
    const param = c.req.param("param");
    const query = c.req.query("q");
    return c.json({
        param,
        query,
    });
});
const initListener = getRequestListener(app.fetch, {
    overrideGlobalObjects: true,
});
export default async ({ req, res, error }) => {
    const listener = initListener(error);
    try {
        const response = await listener(req, res);
        if (response) {
            const blob = await response.blob();
            const headers = Object.fromEntries(response.headers.entries());
            // This is only needed on Appwrite, if this isn't included
            // then text and json-based routes will loop forever
            if (!headers["content-length"] && blob.size) {
                headers["content-length"] = blob.size.toString();
            }
            headers["Cache-Control"] = "public,max-age=31536000";
            return res.send(Readable.from(blob.stream()), 200, headers);
        }
    }
    catch (e) {
        error(e);
    }
};
