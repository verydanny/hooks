/**
 * Using bun-1.0 open-runtime
 */
import path from 'node:path'
import { serve } from '@gravlabs/appwrite-hono-adapter-bun'
import { serveStatic } from '@gravlabs/appwrite-hono-adapter-bun/serveStatic'
import type { AppwriteBindings } from '@gravlabs/appwrite-hono-adapter-bun/types'
import { Hono } from 'hono'

const app = new Hono<{ Bindings: AppwriteBindings }>()

app.get('/static/*', serveStatic({
    root: './'
}))

app.get('/', (c) => {
    c.env.log(
        path.relative(process.cwd(), path.resolve(import.meta.dirname, '../static'))
    )

    return c.html(`
        <h1>Testing Hono</h1>
    `)
})

export default serve(app)

