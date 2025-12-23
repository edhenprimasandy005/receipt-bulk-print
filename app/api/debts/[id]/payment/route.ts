import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// POST - Record a payment
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { amount_paid, notes } = body;

    if (!amount_paid || amount_paid <= 0) {
      return NextResponse.json({ error: 'Valid payment amount is required' }, { status: 400 });
    }

    // Get current debt
    const { data: currentDebt, error: fetchError } = await supabase
      .from('debts')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError || !currentDebt) {
      return NextResponse.json({ error: 'Debt not found' }, { status: 404 });
    }

    const newPaidAmount = currentDebt.paid_amount + amount_paid;
    const newRemainingAmount = currentDebt.amount - newPaidAmount;

    let newStatus = currentDebt.status;
    let paidDate = currentDebt.paid_date;

    if (newRemainingAmount <= 0) {
      newStatus = 'paid';
      paidDate = new Date().toISOString();
    } else if (newPaidAmount > 0) {
      newStatus = 'partial';
    }

    const updateData = {
      paid_amount: newPaidAmount,
      remaining_amount: newRemainingAmount,
      status: newStatus,
      paid_date: paidDate,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedDebt, error } = await supabase
      .from('debts')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create log entry for payment
    await supabase.from('debt_logs').insert({
      debt_id: params.id,
      action: 'payment',
      old_value: currentDebt,
      new_value: updateData,
      amount_paid: amount_paid,
      notes: notes || `Payment of ${amount_paid} recorded`,
    });

    return NextResponse.json({ data: updatedDebt });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
