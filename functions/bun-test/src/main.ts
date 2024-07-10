/**
 * Using bun-1.0 open-runtime
 */
import { serve } from '@gravlabs/appwrite-hono-adapter-bun'
import { serveStatic } from '@gravlabs/appwrite-hono-adapter-bun/serveStatic'
import { AppwriteBindings } from '@gravlabs/appwrite-hono-adapter-bun/types'
import { Hono } from 'hono'

const app = new Hono<{ Bindings: AppwriteBindings }>()

app.get('/static/*', serveStatic({
    root: './'
}))

app.get('/', (c) => {
    c.env.log('Logs are logging')

    return c.html(`
        <h1>Testing Hono</h1>
    `)
})

export default serve(app)

