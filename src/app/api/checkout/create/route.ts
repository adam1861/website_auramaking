import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'

export async function POST(_req: NextRequest) {
  const cookieStore = await cookies()
  const cartId = cookieStore.get('cart_id')?.value
  if (!cartId) return NextResponse.json({ ok: false, error: 'NO_CART' }, { status: 400 })

  const cart = await prisma.cart.findUnique({ where: { id: cartId }, include: { items: { include: { product: true, variant: true } } } })
  if (!cart || cart.items.length === 0) return NextResponse.json({ ok: false, error: 'EMPTY_CART' }, { status: 400 })

  const total = cart.items.reduce((s, i) => s + i.priceAtAdd * i.quantity, 0)
  const order = await prisma.order.create({
    data: {
      email: 'guest@example.com',
      status: 'PENDING',
      subtotal: total,
      grandTotal: total,
      provider: 'paypal',
      currency: process.env.PAYPAL_CURRENCY || 'USD',
      cartId
    }
  })

  return NextResponse.json({ ok: true, id: order.id, total: order.grandTotal, currency: order.currency })
}


