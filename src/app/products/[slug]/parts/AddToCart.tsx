'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded shadow z-50">
      {message}
    </div>
  )
}

type Variant = { id: string; name: string; priceOverride: number | null; stock: number }

export default function AddToCart({ productId, price, variants = [] as Variant[] }: { productId: string, price: number, variants?: Variant[] }) {
  const [qty, setQty] = useState(1)
  const [variantId, setVariantId] = useState<string | null>(variants.length ? variants[0].id : null)
  const router = useRouter()
  const [toast, setToast] = useState<string | null>(null)
  const selectedVariant = variants.find(v => v.id === variantId) || null
  const unitPrice = selectedVariant?.priceOverride ?? price
  const canAdd = selectedVariant ? selectedVariant.stock >= qty : true

  return (
    <div className="flex items-center gap-3 relative flex-wrap">
      {variants.length > 0 && (
        <select value={variantId ?? ''} onChange={e => setVariantId(e.target.value || null)} className="border rounded px-2 py-2">
          {variants.map(v => (
            <option key={v.id} value={v.id}>{v.name} {typeof v.priceOverride === 'number' ? `- ${(v.priceOverride/100).toFixed(2)}` : ''} {`(stock: ${v.stock})`}</option>
          ))}
        </select>
      )}
      <input type="number" min={1} value={qty} onChange={e => setQty(parseInt(e.target.value || '1'))} className="border rounded px-2 py-1 w-20" />
      <button
        disabled={variants.length > 0 && (!variantId || !canAdd)}
        onClick={async () => {
          const res = await fetch('/api/cart/add', { method: 'POST', body: JSON.stringify({ productId, variantId, quantity: qty }) })
          if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            setToast(data?.error || 'Failed to add to cart')
          } else {
            setToast('Added to cart')
            router.refresh()
          }
          setTimeout(() => setToast(null), 2000)
        }}
        className="bg-black text-white px-4 py-2 rounded-lg disabled:opacity-50"
      >Add to Cart</button>
      {toast && <Toast message={toast} />}
      <div className="w-full text-sm text-black">Unit price: {(unitPrice/100).toFixed(2)}</div>
    </div>
  )
}
