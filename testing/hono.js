import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()
app.get('/', (c) => c.text('Hono meets Node.js'))

serve({
  fetch: app.fetch,
  port: 3002,
  overrideGlobalObjects: true,
}, (info) => {
  console.log(info)
  console.log(`Listening on http://localhost:${info.port}`) // Listening on http://localhost:3000
})
