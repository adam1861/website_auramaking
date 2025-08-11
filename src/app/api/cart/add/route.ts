import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.productId || !body?.quantity) return NextResponse.json({ ok: false }, { status: 400 })

  const product = await prisma.product.findUnique({ where: { id: body.productId }, include: { variants: true } })
  if (!product) return NextResponse.json({ ok: false, error: 'Product not found' }, { status: 404 })

  let priceAtAdd = product.price
  let variantId: string | undefined
  if (body.variantId) {
    const variant = product.variants.find(v => v.id === body.variantId)
    if (!variant || !variant.isActive) {
      return NextResponse.json({ ok: false, error: 'Variant not available' }, { status: 400 })
    }
    if (variant.stock < Number(body.quantity)) {
      return NextResponse.json({ ok: false, error: 'Not enough stock' }, { status: 400 })
    }
    priceAtAdd = variant.priceOverride ?? product.price
    variantId = variant.id
  }
  if (!variantId) {
    if (product.stock < Number(body.quantity)) {
      return NextResponse.json({ ok: false, error: 'Not enough stock' }, { status: 400 })
    }
  }

  const cookieStore = await cookies()
  let cartId = cookieStore.get('cart_id')?.value
  if (!cartId) {
    const cart = await prisma.cart.create({ data: {} })
    cartId = cart.id
    cookieStore.set('cart_id', cartId, { path: '/', httpOnly: false })
  }

  await prisma.cartItem.create({
    data: {
      cartId,
      productId: product.id,
      variantId,
      quantity: Number(body.quantity) || 1,
      priceAtAdd
    }
  })

  return NextResponse.json({ ok: true })
}
