import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(_request: NextRequest) {
  console.log('[Test-Supabase] Starting Supabase test...');
  
  try {
    // Check environment variables
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0
    };
    
    console.log('[Test-Supabase] Environment:', envCheck);
    
    if (!envCheck.hasSupabaseUrl || !envCheck.hasSupabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase configuration',
        environment: envCheck
      }, { status: 500 });
    }

    // Create Supabase client
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    console.log('[Test-Supabase] Client created');

    // Test 1: Check auth status
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('[Test-Supabase] Auth check:', { hasUser: !!user, error: authError });

    // Test 2: Check analyzed_properties table instead
    const { data: analyzedPropsData, error: analyzedPropsError } = await supabase
      .from('analyzed_properties')
      .select('*')
      .limit(0); // Don't fetch data, just check if table exists

    console.log('[Test-Supabase] Analyzed properties table check:', { 
      success: !analyzedPropsError, 
      error: analyzedPropsError,
      errorType: typeof analyzedPropsError,
      errorKeys: analyzedPropsError ? Object.keys(analyzedPropsError) : []
    });

    // Test 3: Try to insert a test record (if authenticated)
    let insertTest = { attempted: false, success: false, error: null as any };
    
    if (user) {
      const testData = {
        user_id: user.id,
        address: 'Test Address',
        strategy: 'rental',
        purchase_price: 100000,
        down_payment_percent: 20,
        loan_term: 30,
        interest_rate: 7,
        status: 'test',
        ai_analysis: { test: true }
      };

      console.log('[Test-Supabase] Attempting insert with data:', testData);
      
      const { data: insertData, error: insertError } = await supabase
        .from('user_analyses')
        .insert(testData)
        .select()
        .single();

      insertTest = {
        attempted: true,
        success: !!insertData,
        error: insertError,
        data: insertData
      };

      console.log('[Test-Supabase] Insert result:', insertTest);

      // If insert succeeded, delete the test record
      if (insertData?.id) {
        await supabase
          .from('user_analyses')
          .delete()
          .eq('id', insertData.id);
        console.log('[Test-Supabase] Test record deleted');
      }
    }

    // Test 4: Check if table exists using a different approach
    let tableInfo = { attempted: false, exists: false, error: null as any };
    try {
      const { error: tableError } = await supabase
        .from('user_analyses')
        .select('id')
        .limit(1);
      
      tableInfo = {
        attempted: true,
        exists: !tableError || !(tableError as any)?.message?.includes('relation'),
        error: tableError
      };
    } catch (err) {
      tableInfo.error = err;
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envCheck,
      authentication: {
        isAuthenticated: !!user,
        userId: user?.id,
        userEmail: user?.email,
        authError: authError
      },
      analyzedPropertiesTable: {
        exists: !analyzedPropsError,
        error: analyzedPropsError,
        errorMessage: (analyzedPropsError as any)?.message,
        errorCode: (analyzedPropsError as any)?.code
      },
      insertTest,
      tableInfo
    });

  } catch (error) {
    console.error('[Test-Supabase] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}