import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest'
import { scoutNightlyRun } from '@/lib/scout/scout-job'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [scoutNightlyRun],
})
