import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const apiKey = process.env.BEEHIIV_API_KEY;
    const publicationId = process.env.BEEHIIV_PUBLICATION_ID;

    if (!apiKey || !publicationId) {
      console.warn('[Newsletter] Beehiiv not configured — BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID missing');
      return NextResponse.json({ subscribed: false, reason: 'not_configured' });
    }

    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          email,
          reactivate_existing: true,
          send_welcome_email: false,
        }),
      }
    );

    if (!res.ok) {
      const body = await res.text();
      console.error('[Newsletter] Beehiiv API error:', res.status, body);
      return NextResponse.json({ subscribed: false, error: 'Beehiiv API error' }, { status: 502 });
    }

    console.log('[Newsletter] Subscribed to Beehiiv:', email);
    return NextResponse.json({ subscribed: true });
  } catch (error) {
    console.error('[Newsletter] Error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
