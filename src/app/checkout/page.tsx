import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import PayPalButtons from './PayPalButtons'

export default async function CheckoutPage() {
  const cookieStore = await cookies()
  const cartId = cookieStore.get('cart_id')?.value
  let total = 0
  if (cartId) {
    const cart = await prisma.cart.findUnique({ where: { id: cartId }, include: { items: true } })
    total = cart?.items.reduce((s, i) => s + i.priceAtAdd * i.quantity, 0) ?? 0
  }

  const paypalClientId = process.env.PAYPAL_CLIENT_ID
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <p>Total: {(total/100).toFixed(2)} MAD</p>

      {paypalClientId ? (
        <PayPalButtons clientId={paypalClientId} />
      ) : (
        <p className="text-sm text-red-600">PAYPAL_CLIENT_ID is not configured.</p>
      )}
    </section>
  )
}
