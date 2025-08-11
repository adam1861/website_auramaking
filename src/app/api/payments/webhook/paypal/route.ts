import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const eventId = req.headers.get('paypal-transmission-id') || 'unknown'
  await prisma.webhookEvent.upsert({
    where: { eventId },
    update: { payload: JSON.parse(body || '{}'), processedAt: new Date() },
    create: { provider: 'paypal', eventId, type: req.headers.get('paypal-event-type') || 'unknown', payload: JSON.parse(body || '{}') }
  })
  return NextResponse.json({ ok: true })
}
