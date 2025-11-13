import { NextResponse } from 'next/server';
import { getCallStats } from '@/lib/storage/data-manager';

export async function GET() {
  try {
    const stats = await getCallStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
