import { prisma } from '@/lib/db'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { formatMoney } from '@/lib/pricing'
import { revalidatePath } from 'next/cache'

export default async function CartPage() {
  const cookieStore = await cookies()
  const cartId = cookieStore.get('cart_id')?.value
  let items: any[] = []
  if (cartId) {
    const cart = await prisma.cart.findUnique({ where: { id: cartId }, include: { items: { include: { product: true, variant: true } } } })
    items = cart?.items ?? []
  }
  const subtotal = items.reduce((s, i) => s + i.priceAtAdd * i.quantity, 0)

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Your Cart</h1>
      {items.length === 0 ? (
        <p>Your cart is empty. <Link href="/">Go shopping</Link></p>
      ) : (
        <div className="space-y-3">
          {items.map(i => (
            <div key={i.id} className="flex items-center justify-between border rounded-lg p-3 gap-3">
              <div className="flex items-center gap-3">
                <div className="font-medium text-black">{i.product.name}{i.variant ? ` – ${i.variant.name}` : ''}</div>
                <form
                  action={async (formData: FormData) => {
                    'use server'
                    const qty = Number(formData.get('q') || i.quantity)
                    if (qty < 1 || Number.isNaN(qty)) return
                    const item = await prisma.cartItem.findUnique({ where: { id: i.id }, include: { variant: true } })
                    if (!item) return
                    if (item.variantId && item.variant && qty > item.variant.stock) return
                    await prisma.cartItem.update({ where: { id: i.id }, data: { quantity: qty } })
                    revalidatePath('/cart')
                  }}
                >
                  <input name="q" defaultValue={i.quantity} type="number" min={1} className="border rounded px-2 py-1 w-20" />
                  <button className="ml-2 px-3 py-1 border rounded">Update</button>
                </form>
              </div>
              <div className="flex items-center gap-3">
                <div>{formatMoney(i.priceAtAdd * i.quantity)}</div>
                <form
                  action={async () => {
                    'use server'
                    await prisma.cartItem.delete({ where: { id: i.id } })
                    revalidatePath('/cart')
                  }}
                >
                  <button className="text-red-600 px-3 py-1 border rounded">Remove</button>
                </form>
              </div>
            </div>
          ))}
          <div className="text-right font-semibold">Subtotal: {formatMoney(subtotal)}</div>
          <div className="text-right">
            <Link href="/checkout" className="bg-brand text-white px-4 py-2 rounded-lg inline-block">Checkout</Link>
          </div>
        </div>
      )}
    </section>
  )
}
