import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

// Add your routes here

const port = 8000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
