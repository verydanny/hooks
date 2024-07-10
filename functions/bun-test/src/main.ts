/**
 * Using node-21.0 open-runtime
 */
import { serve } from '@gravlabs/appwrite-hono-adapter-bun'
import { serveStatic } from '@gravlabs/appwrite-hono-adapter-bun/serveStatic'
import { Hono } from 'hono'

const app = new Hono()

app.get('/static/*', serveStatic({
    root: '/server'
}))

app.get('/', (c) =>
    c.html(`
        <h1>Testing Hono</h1>
    `),
)

export default serve(app)

