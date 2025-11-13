import { NextResponse } from 'next/server';
import { getCallData } from '@/lib/storage/data-manager';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const callId = params.id;
    const callData = await getCallData(callId);

    if (!callData) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }

    return NextResponse.json(callData);
  } catch (error) {
    console.error('Error fetching call:', error);
    return NextResponse.json(
      { error: 'Failed to fetch call data' },
      { status: 500 }
    );
  }
}
