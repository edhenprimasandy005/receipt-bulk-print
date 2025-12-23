import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { Debt } from '@/types';

// GET - Fetch single debt by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT - Update debt
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get current debt
    const { data: currentDebt, error: fetchError } = await supabase
      .from('debts')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError || !currentDebt) {
      return NextResponse.json({ error: 'Debt not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, amount, paid_amount, due_date, status } = body;

    const updateData: Partial<Debt> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    if (amount !== undefined) updateData.amount = amount;
    if (paid_amount !== undefined) updateData.paid_amount = paid_amount;
    if (due_date !== undefined) updateData.due_date = due_date;
    if (status !== undefined) updateData.status = status;

    // Calculate remaining amount
    const finalAmount = amount !== undefined ? amount : currentDebt.amount;
    const finalPaidAmount = paid_amount !== undefined ? paid_amount : currentDebt.paid_amount;
    updateData.remaining_amount = finalAmount - finalPaidAmount;

    // Update status based on remaining amount
    if (updateData.remaining_amount === 0) {
      updateData.status = 'paid';
      updateData.paid_date = new Date().toISOString();
    } else if (finalPaidAmount > 0) {
      updateData.status = 'partial';
    } else if (status) {
      updateData.status = status;
    }

    updateData.updated_at = new Date().toISOString();

    const { data: updatedDebt, error } = await supabase
      .from('debts')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create log entry
    await supabase.from('debt_logs').insert({
      debt_id: params.id,
      action: 'update',
      old_value: currentDebt,
      new_value: updateData,
      notes: description || 'Debt updated',
    });

    return NextResponse.json({ data: updatedDebt });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete debt
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get current debt for log
    const { data: currentDebt } = await supabase
      .from('debts')
      .select('*')
      .eq('id', params.id)
      .single();

    const { error } = await supabase.from('debts').delete().eq('id', params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create log entry
    if (currentDebt) {
      await supabase.from('debt_logs').insert({
        debt_id: params.id,
        action: 'delete',
        old_value: currentDebt,
        notes: 'Debt deleted',
      });
    }

    return NextResponse.json({ message: 'Debt deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
