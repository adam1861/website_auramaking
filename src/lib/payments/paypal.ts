import paypal from '@paypal/checkout-server-sdk'

const environment = () => {
  if (process.env.PAYPAL_ENV === 'live') {
    return new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID!, process.env.PAYPAL_CLIENT_SECRET!)
  }
  return new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID!, process.env.PAYPAL_CLIENT_SECRET!)
}
const client = () => new paypal.core.PayPalHttpClient(environment())

export async function paypalCreateOrder(totalCents: number, currency: string, referenceId: string) {
  const req = new paypal.orders.OrdersCreateRequest()
  req.headers['prefer'] = 'return=representation'
  const currencyCode = process.env.PAYPAL_CURRENCY || currency || 'USD'
  req.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{ reference_id: referenceId, amount: { currency_code: currencyCode, value: (totalCents/100).toFixed(2) } }]
  })
  const res = await client().execute(req)
  return res.result
}

export async function paypalCapture(providerOrderId: string) {
  const req = new paypal.orders.OrdersCaptureRequest(providerOrderId)
  req.requestBody({})
  const res = await client().execute(req)
  return res.result
}
