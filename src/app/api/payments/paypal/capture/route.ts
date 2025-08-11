import { NextRequest, NextResponse } from 'next/server'
import { paypalCapture } from '@/lib/payments/paypal'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { providerOrderId, orderId } = await req.json()
  if (!providerOrderId || !orderId) return NextResponse.json({ ok: false }, { status: 400 })
  const capture = await paypalCapture(providerOrderId)
  // On capture, materialize order items from the order's cart and deduct stock
  const orderRecord = await prisma.order.findUnique({ where: { id: orderId } })
  const cartId = orderRecord?.cartId || null
  const cart = cartId ? await prisma.cart.findUnique({ where: { id: cartId }, include: { items: { include: { product: true, variant: true } } } }) : null
  if (cart && cart.items.length) {
    await prisma.$transaction(async (tx) => {
      // create order items
      for (const item of cart.items) {
        await tx.orderItem.create({
          data: {
            orderId,
            productId: item.productId,
            variantId: item.variantId || null,
            name: item.product.name,
            variantName: item.variant?.name || null,
            unitPrice: item.priceAtAdd,
            quantity: item.quantity,
          }
        })
        if (item.variantId) {
          // deduct variant stock
          await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { decrement: item.quantity } } })
        } else {
          // decrement product-level stock
          await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } })
          await tx.inventoryMovement.create({ data: { productId: item.productId, delta: -item.quantity, reason: 'Order capture' } })
        }
      }
      // clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } })
    })
  }
  const order = await prisma.order.update({ where: { id: orderId }, data: { status: 'PAID', providerCaptureId: capture?.purchase_units?.[0]?.payments?.captures?.[0]?.id || null } })
  return NextResponse.json({ ok: true, captureId: order.providerCaptureId })
}
