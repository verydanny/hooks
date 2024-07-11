/**
 * Using bun-1.0 open-runtime
 */
import { Hono } from 'hono'
import { cache } from 'hono/cache'

import { serve } from '@gravlabs/appwrite-hono-adapter-bun'
import { serveStatic } from '@gravlabs/appwrite-hono-adapter-bun/serveStatic'
import type { AppwriteBindings } from '@gravlabs/appwrite-hono-adapter-bun/types'

const app = new Hono<{ Bindings: AppwriteBindings }>()

app.get(
    '*',
    cache({
        cacheName: 'my-app',
        cacheControl: 'max-age=3600'
    })
)

app.get('/static/*', serveStatic({
    root: './'
}))

app.get('/', (c) => {
    return c.html(`
        <h1>Testing Hono</h1>
    `)
})

export default serve(app)

