import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { unstable_noStore as noStore } from 'next/cache';


// GET - Fetch logs for a specific debt
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    noStore();
    const { data, error } = await supabase
      .from('debt_logs')
      .select('*')
      .eq('debt_id', params.id)
      .order('created_at', { ascending: false })

      console.log(data);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}