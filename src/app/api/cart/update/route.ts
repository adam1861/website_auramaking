import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { itemId, quantity } = await req.json()
  if (!itemId || typeof quantity !== 'number' || quantity < 1) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  const cookieStore = await cookies()
  const cartId = cookieStore.get('cart_id')?.value
  if (!cartId) return NextResponse.json({ ok: false }, { status: 400 })
  const item = await prisma.cartItem.findUnique({ where: { id: itemId }, include: { variant: true } })
  if (!item) return NextResponse.json({ ok: false }, { status: 404 })
  if (item.variantId && item.variant) {
    if (quantity > item.variant.stock) {
      return NextResponse.json({ ok: false, error: 'Not enough stock' }, { status: 400 })
    }
  } else {
    const product = await prisma.product.findUnique({ where: { id: item.productId } })
    if (product && quantity > product.stock) {
      return NextResponse.json({ ok: false, error: 'Not enough stock' }, { status: 400 })
    }
  }
  await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } })
  return NextResponse.json({ ok: true })
}


