'use client'

import { useEffect, useRef } from 'react'

type Props = {
  clientId: string
  currency?: string
}

export default function PayPalButtons({ clientId, currency = (process.env.NEXT_PUBLIC_PAYPAL_CURRENCY as string) || 'USD' }: Props) {
  const localOrderIdRef = useRef<string | null>(null)

  useEffect(() => {
    function initButtons() {
      // @ts-ignore
      if (!window.paypal) return
      const container = document.getElementById('paypal-button-container')
      if (!container) return
      container.innerHTML = ''

      // @ts-ignore
      window.paypal
        .Buttons({
          createOrder: async () => {
            const res = await fetch('/api/checkout/create', { method: 'POST' })
            const data = await res.json()
            if (!data?.ok) throw new Error('Failed to create local order')
            localOrderIdRef.current = data.id

            const res2 = await fetch('/api/payments/paypal/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ total: data.total, currency: data.currency, referenceId: data.id })
            })
            const data2 = await res2.json()
            if (!data2?.ok) throw new Error('Failed to create PayPal order')
            return data2.id
          },
          onApprove: async (data: any) => {
            const localId = localOrderIdRef.current
            await fetch('/api/payments/paypal/capture', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ providerOrderId: data.orderID, orderId: localId })
            })
            window.location.href = '/?paid=1'
          },
        })
        .render('#paypal-button-container')
    }

    const existing = document.querySelector('script[src^="https://www.paypal.com/sdk/js"]') as HTMLScriptElement | null
    if (existing) {
      if ((window as any).paypal) initButtons()
      else existing.addEventListener('load', initButtons, { once: true })
      return
    }
    const s = document.createElement('script')
    // Enable card funding option explicitly
    s.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&components=buttons,funding-eligibility&enable-funding=card`
    s.async = true
    s.addEventListener('load', initButtons, { once: true })
    document.body.appendChild(s)
  }, [clientId, currency])

  return <div id="paypal-button-container" />
}


