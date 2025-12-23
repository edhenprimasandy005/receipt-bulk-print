import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { passcode } = await request.json();
    const correctPasscode = process.env.DEBT_LIST_PASSCODE;

    if (!correctPasscode) {
      return NextResponse.json(
        { error: 'Passcode not configured' },
        { status: 500 }
      );
    }

    if (passcode === correctPasscode) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Passcode salah' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Error verifying passcode:', error);
    return NextResponse.json(
      { error: 'Gagal memverifikasi passcode' },
      { status: 500 }
    );
  }
}
