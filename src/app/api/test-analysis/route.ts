import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  console.log('[Test-Analysis] Endpoint called');
  
  try {
    // Test basic environment
    const envCheck = {
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
      anthropicKeyLength: process.env.ANTHROPIC_API_KEY?.length || 0,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV
    };

    console.log('[Test-Analysis] Environment check:', envCheck);

    // Test imports
    const imports = {
      anthropicSdk: 'Checking...',
      supabase: 'Checking...',
      rentcast: 'Checking...'
    };

    try {
      const Anthropic = await import('@anthropic-ai/sdk');
      imports.anthropicSdk = 'OK - ' + (!!Anthropic.default ? 'Has default export' : 'No default export');
    } catch (e) {
      imports.anthropicSdk = 'FAILED - ' + (e instanceof Error ? e.message : String(e));
    }

    try {
      const { createServerClient } = await import('@supabase/ssr');
      imports.supabase = 'OK - ' + (typeof createServerClient === 'function' ? 'Function available' : 'Not a function');
    } catch (e) {
      imports.supabase = 'FAILED - ' + (e instanceof Error ? e.message : String(e));
    }

    try {
      const { rentCastService } = await import('@/services/rentcast');
      imports.rentcast = 'OK - ' + (!!rentCastService ? 'Service available' : 'Service not found');
    } catch (e) {
      imports.rentcast = 'FAILED - ' + (e instanceof Error ? e.message : String(e));
    }

    console.log('[Test-Analysis] Import check:', imports);

    // Test basic Claude API call
    let claudeTest = {
      status: 'Not tested',
      error: null as string | null,
      response: null as string | null
    };

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const Anthropic = (await import('@anthropic-ai/sdk')).default;
        const client = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY
        });

        const response = await client.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 50,
          messages: [{
            role: "user" as const,
            content: "Say 'test successful' and nothing else"
          }]
        });

        claudeTest.status = 'Success';
        claudeTest.response = response.content[0].type === 'text' ? response.content[0].text : 'No text';
      } catch (e) {
        claudeTest.status = 'Failed';
        claudeTest.error = e instanceof Error ? e.message : String(e);
      }
    }

    console.log('[Test-Analysis] Claude test:', claudeTest);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envCheck,
      imports: imports,
      claudeApiTest: claudeTest
    });

  } catch (error) {
    console.error('[Test-Analysis] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}