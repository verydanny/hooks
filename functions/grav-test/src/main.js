import { Hono } from "hono"
import { serve } from "@gravlabs/appwrite-hono-adapter-node"
import { serveStatic } from "@gravlabs/appwrite-hono-adapter-node/serveStatic"

const openRuntimeRoot = 'src/function'
const isOpenRuntimes = existsSync(resolve(process.cwd(), openRuntimeRoot))

const app = new Hono()

app.get("/static/*", serveStatic({
    root: './',
}))

app.get("/", (context) =>
    context.html(`
        <html>
            <h1>Hello world</h1>
        </html>
    `),
)

export default (context) => {
  context.log(isOpenRuntimes)
  
  return serve(app)(context)
}
