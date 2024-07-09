/**
 * Using node-21.0 open-runtime
 */
import { handler as ssrHandler } from './dist/server/entry.mjs'

import { Hono } from 'hono'
import { serve } from "@gravlabs/appwrite-hono-adapter-node"
import { serveStatic } from "@gravlabs/appwrite-hono-adapter-node/serveStatic"

const app = new Hono()

// Static files work perfectly
app.use('/*', serveStatic({ root: './dist/client' }))
app.use(ssrHandler)

export default serve(app)
