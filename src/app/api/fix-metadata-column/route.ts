import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_request: NextRequest) {
  console.log('[Fix Metadata] Checking and fixing metadata column...')
  
  try {
    const supabase = await createClient()
    
    // First, let's check if the column exists by trying to query it
    const { error: queryError } = await supabase
      .from('subscriptions')
      .select('id, metadata')
      .limit(1)
    
    if (queryError) {
      console.log('[Fix Metadata] Column query error:', queryError.message)
      
      // If the column doesn't exist, try to add it
      if (queryError.message.includes('metadata')) {
        console.log('[Fix Metadata] Attempting to add metadata column...')
        
        // Use raw SQL to add the column
        const { error: alterError } = await supabase.rpc('exec_sql', {
          query: `
            DO $$ 
            BEGIN
              IF NOT EXISTS (
                SELECT 1 
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'subscriptions' 
                AND column_name = 'metadata'
              ) THEN
                ALTER TABLE public.subscriptions 
                ADD COLUMN metadata JSONB DEFAULT '{}';
              END IF;
            END $$;
          `
        })
        
        if (alterError) {
          console.error('[Fix Metadata] Failed to add column:', alterError)
          
          // Try a simpler approach - just return instructions
          return NextResponse.json({
            status: 'error',
            message: 'Cannot automatically fix. Please run this SQL in Supabase SQL Editor:',
            sql: `ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';`,
            error: alterError.message
          })
        }
        
        return NextResponse.json({
          status: 'fixed',
          message: 'Metadata column added successfully'
        })
      }
      
      return NextResponse.json({
        status: 'error',
        message: 'Unknown query error',
        error: queryError.message
      })
    }
    
    // Column exists
    console.log('[Fix Metadata] Metadata column exists')
    
    // Check current subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('id, user_id, metadata, tier, status')
    
    if (subError) {
      return NextResponse.json({
        status: 'error',
        message: 'Error fetching subscriptions',
        error: subError.message
      })
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Metadata column exists and is working',
      subscriptionCount: subscriptions?.length || 0,
      sample: subscriptions?.[0] || null
    })
    
  } catch (error: any) {
    console.error('[Fix Metadata] Unexpected error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Unexpected error occurred',
      error: error.message,
      hint: 'Run this SQL in Supabase SQL Editor: ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT \'{}\';'
    }, { status: 500 })
  }
}