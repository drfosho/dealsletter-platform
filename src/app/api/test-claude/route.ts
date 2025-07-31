import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function GET(_request: NextRequest) {
  console.log('[Test-Claude] Starting Claude API test...');
  
  // Check if API key exists
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[Test-Claude] ANTHROPIC_API_KEY is not set');
    return NextResponse.json({
      success: false,
      error: 'ANTHROPIC_API_KEY is not configured',
      hasKey: false
    }, { status: 500 });
  }

  console.log('[Test-Claude] API key found, length:', process.env.ANTHROPIC_API_KEY.length);

  try {
    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    console.log('[Test-Claude] Making API call to Claude...');

    // Make a simple test call
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022", // Updated to latest available model
      max_tokens: 100,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: "Please respond with exactly: 'Claude API is working!'"
        }
      ]
    });

    console.log('[Test-Claude] Response received:', response);

    const responseText = response.content[0].type === 'text' ? response.content[0].text : 'No text response';

    return NextResponse.json({
      success: true,
      message: 'Claude API test successful',
      response: responseText,
      model: response.model,
      usage: response.usage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Test-Claude] Error calling Claude API:', error);
    
    let errorDetails = {
      message: 'Unknown error',
      type: 'unknown',
      details: {}
    };

    if (error instanceof Error) {
      errorDetails.message = error.message;
      errorDetails.type = error.constructor.name;
      
      // Check for specific Anthropic API errors
      if ('status' in error) {
        errorDetails.details = {
          status: (error as any).status,
          headers: (error as any).headers,
          error: (error as any).error
        };
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to call Claude API',
      details: errorDetails,
      hasKey: true,
      keyLength: process.env.ANTHROPIC_API_KEY.length
    }, { status: 500 });
  }
}