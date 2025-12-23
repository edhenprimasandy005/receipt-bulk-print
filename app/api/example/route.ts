import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

/**
 * Example API route demonstrating Supabase usage
 * 
 * GET /api/example - Example endpoint
 * POST /api/example - Example endpoint with body
 */
export async function GET() {
  try {
    // Example: Fetch data from Supabase
    // Replace 'your_table' with your actual table name
    // const { data, error } = await supabase
    //   .from('your_table')
    //   .select('*')
    //   .limit(10);

    return NextResponse.json({
      message: 'Example API route',
      timestamp: new Date().toISOString(),
      // data: data || [],
      // error: error?.message,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Example: Insert data into Supabase
    // Replace 'your_table' with your actual table name
    // const { data, error } = await supabase
    //   .from('your_table')
    //   .insert(body)
    //   .select();

    return NextResponse.json({
      message: 'Data received',
      // data: data,
      // error: error?.message,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Invalid request body',
      },
      { status: 400 }
    );
  }
}
