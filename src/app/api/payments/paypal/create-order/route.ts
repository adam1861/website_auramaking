import { NextRequest, NextResponse } from 'next/server'
import { paypalCreateOrder } from '@/lib/payments/paypal'

export async function POST(req: NextRequest) {
  const { total, currency, referenceId } = await req.json()
  if (!total || !currency || !referenceId) return NextResponse.json({ ok: false }, { status: 400 })
  const result = await paypalCreateOrder(total, currency, referenceId)
  return NextResponse.json({ ok: true, id: result.id, links: result.links })
}
