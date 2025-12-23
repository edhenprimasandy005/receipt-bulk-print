import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { Debt, DebtLog } from '@/types';

// GET - Fetch all debts with optional filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const dueDate = searchParams.get('due_date');

    let query = supabase.from('debts').select('*').order('created_at', { ascending: false });

    // Apply filters
    if (name) {
      query = query.ilike('name', `%${name}%`);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (date) {
      query = query.gte('created_at', date).lte('created_at', `${date}T23:59:59`);
    }
    if (dueDate) {
      query = query.gte('due_date', dueDate).lte('due_date', `${dueDate}T23:59:59`);
    }

    const { data, error } = await query;

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

// POST - Create new debt
export async function POST(request: Request) {
  try {
    const body: Omit<Debt, 'id' | 'created_at' | 'updated_at'> = await request.json();
    
    const { name, description, amount, paid_amount = 0, due_date, status = 'pending' } = body;
    
    if (!name || !amount) {
      return NextResponse.json({ error: 'Name and amount are required' }, { status: 400 });
    }

    const remaining_amount = amount - paid_amount;
    const finalStatus = remaining_amount === 0 ? 'paid' : paid_amount > 0 ? 'partial' : status;
    const paid_date = remaining_amount === 0 ? new Date().toISOString() : null;

    const debtData = {
      name,
      description: description || null,
      amount,
      paid_amount,
      remaining_amount,
      status: finalStatus,
      due_date: due_date || null,
      paid_date,
    };

    const { data: debt, error } = await supabase
      .from('debts')
      .insert(debtData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create log entry
    await supabase.from('debt_logs').insert({
      debt_id: debt.id,
      action: 'create',
      new_value: debtData,
      notes: description || 'Debt created',
    });

    return NextResponse.json({ data: debt }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
