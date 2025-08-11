import { prisma } from '@/lib/db'
import { isAdminAuthenticated } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatMoney } from '@/lib/pricing'
import type { Product, Category } from '@prisma/client'   // ⬅ add types

type ProductWithCategory = Product & { category: Category }  // ⬅ helper type

export default async function AdminProducts({ 
  searchParams 
}: { 
  searchParams: { error?: string; success?: string } 
}) {
  if (!isAdminAuthenticated()) redirect('/admin/login')
  const products: ProductWithCategory[] = await prisma.product.findMany({
    include: { category: true }, orderBy: { createdAt: 'desc' }
  })
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link className="bg-brand text-white px-3 py-2 rounded-lg" href="/admin/products/new">New</Link>
      </div>
      
      {/* Error and Success Messages */}
      {searchParams.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {searchParams.error}
        </div>
      )}
      {searchParams.success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {searchParams.success}
        </div>
      )}
      
      <div className="space-y-2">
        {products.map((p: ProductWithCategory) => (  // ⬅ type the param
          <div key={p.id} className="grid md:grid-cols-4 items-center border rounded-lg p-3 gap-2">
            <div className="font-medium">{p.name}</div>
            <div className="text-sm text-gray-500">{p.category.name}</div>
            <div>{formatMoney(p.price)}</div>
            <div className="text-right">
              <Link className="px-3 py-1 border rounded-lg" href={`/admin/products/${p.id}`}>Edit</Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
