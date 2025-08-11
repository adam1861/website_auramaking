import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

async function updateProductStock(id: string, formData: FormData) {
  'use server'
  const stock = Number(formData.get('stock') || 0)
  await prisma.product.update({ where: { id }, data: { stock } })
  revalidatePath('/admin/inventory')
}

async function updateVariantStock(_productId: string, variantId: string, formData: FormData) {
  'use server'
  const stock = Number(formData.get('v_stock') || 0)
  await prisma.productVariant.update({ where: { id: variantId }, data: { stock } })
  revalidatePath('/admin/inventory')
}

export default async function InventoryPage() {
  const products = await prisma.product.findMany({
    include: { variants: { orderBy: { name: 'asc' } }, category: true },
    orderBy: { name: 'asc' }
  })
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory</h1>
      </div>
      <div className="space-y-4">
        {products.map(p => (
          <div key={p.id} className="border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm text-gray-500">{p.category?.name || 'Uncategorized'}</div>
              </div>
              <form action={updateProductStock.bind(null, p.id)} className="flex items-end gap-2">
                <div className="grid gap-1">
                  <label className="text-xs text-gray-600">Product Stock</label>
                  <input name="stock" type="number" defaultValue={p.stock} className="border rounded px-3 py-2 w-28" />
                </div>
                <button className="px-3 py-2 border rounded">Save</button>
              </form>
            </div>

            {p.variants.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Variants</div>
                <div className="grid gap-2">
                  {p.variants.map(v => (
                    <form key={v.id} action={updateVariantStock.bind(null, p.id, v.id)} className="grid md:grid-cols-5 items-end gap-2 border rounded-lg p-3">
                      <div className="md:col-span-2">
                        <div className="text-sm font-medium">{v.name}</div>
                        <div className="text-xs text-gray-500">SKU: {v.sku || '-'}</div>
                      </div>
                      <div className="grid gap-1 md:col-span-2">
                        <label className="text-xs text-gray-600">Variant Stock</label>
                        <input name="v_stock" type="number" defaultValue={v.stock} className="border rounded px-3 py-2 w-28" />
                      </div>
                      <div className="md:col-span-1">
                        <button className="px-3 py-2 border rounded">Save</button>
                      </div>
                    </form>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}


