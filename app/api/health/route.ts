import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
  try {
    // Test Supabase connection by checking if client is initialized
    const isConnected = !!supabase && !!process.env.NEXT_PUBLIC_SUPABASE_URL;

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      supabase: {
        connected: isConnected,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'not configured',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
