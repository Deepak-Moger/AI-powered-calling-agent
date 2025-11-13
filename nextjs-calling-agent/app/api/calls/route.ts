import { NextResponse } from 'next/server';
import { listCalls } from '@/lib/storage/data-manager';

export async function GET() {
  try {
    const calls = await listCalls(50);
    return NextResponse.json({ calls });
  } catch (error) {
    console.error('Error fetching calls:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calls' },
      { status: 500 }
    );
  }
}
