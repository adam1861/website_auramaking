import { prisma } from '@/lib/db'
import { isAdminAuthenticated } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatMoney } from '@/lib/pricing'

export default async function AdminOrders() {
  if (!isAdminAuthenticated()) redirect('/admin/login')
  
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true, addresses: true, user: true }
  })
  
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
      </div>
      <div className="space-y-2">
        {orders.map(o => (
          <div key={o.id} className="grid md:grid-cols-6 items-center border rounded-lg p-3 gap-2">
            <div className="font-mono text-xs">{o.id.slice(0, 8)}</div>
            <div>{o.email}</div>
            <div className="text-sm">{o.status}</div>
            <div>{formatMoney(o.grandTotal, o.currency)}</div>
            <div className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleString()}</div>
            <div className="text-right">
              <Link className="px-3 py-1 border rounded-lg" href={`/admin/orders/${o.id}`}>View</Link>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="text-sm text-gray-500">No orders yet.</div>
        )}
      </div>
    </section>
  )
}


