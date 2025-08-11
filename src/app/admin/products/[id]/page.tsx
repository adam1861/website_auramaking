import { prisma } from '@/lib/db'
import { isAdminAuthenticated } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { promises as fs } from 'fs'
import path from 'path'

async function updateProduct(id: string, formData: FormData) {
  'use server'
  const name = (formData.get('name') || '').toString().trim()
  const slug = (formData.get('slug') || '').toString().trim()
  const price = Number(formData.get('price') || 0)
  const description = (formData.get('description') || '').toString().trim() || null
  const material = (formData.get('material') || '').toString().trim() || null
  const color = (formData.get('color') || '').toString().trim() || null
  const scale = (formData.get('scale') || '').toString().trim() || null
  const categoryId = (formData.get('categoryId') || '').toString().trim()
  let imageUrl = (formData.get('imageUrl') || '').toString().trim()
  let backgroundImageUrl = (formData.get('backgroundImageUrl') || '').toString().trim()
  const isActive = formData.get('isActive') === 'on'
  const isFeatured = formData.get('isFeatured') === 'on'

  const file = formData.get('imageFile') as File | null
  if (file && file.size > 0) {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadDir, { recursive: true })
    const ext = path.extname(file.name) || '.png'
    const fileName = `${Date.now()}-${slug}${ext}`
    const fullPath = path.join(uploadDir, fileName)
    await fs.writeFile(fullPath, buffer)
    imageUrl = `/uploads/${fileName}`
  }

  const backgroundFile = formData.get('backgroundImageFile') as File | null
  if (backgroundFile && backgroundFile.size > 0) {
    const arrayBuffer = await backgroundFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadDir, { recursive: true })
    const ext = path.extname(backgroundFile.name) || '.png'
    const fileName = `bg-${Date.now()}-${slug}${ext}`
    const fullPath = path.join(uploadDir, fileName)
    await fs.writeFile(fullPath, buffer)
    backgroundImageUrl = `/uploads/${fileName}`
  }

  if (!name || !slug || !price || !categoryId) {
    throw new Error('Name, slug, price and category are required')
  }

  await prisma.product.update({
    where: { id },
    data: {
      name,
      slug,
      price: Math.round(price),
      description: description || undefined,
      material: material || undefined,
      color: color || undefined,
      scale: scale || undefined,
      categoryId,
      backgroundImageUrl: backgroundImageUrl || undefined,
      isActive,
      isFeatured,
      // Keep it simple: if imageUrl provided, replace first image by deleting all and creating one
      images: imageUrl
        ? {
            deleteMany: {},
            create: [{ url: imageUrl, alt: name }],
          }
        : undefined,
    }
  })

  revalidatePath('/admin/products')
  redirect('/admin/products')
}

async function deleteProduct(id: string) {
  'use server'
  // Ensure dependent cart items are removed before deleting product (DB FK may not be CASCADE yet)
  await prisma.cartItem.deleteMany({ where: { productId: id } })
  await prisma.product.delete({ where: { id } })
  revalidatePath('/admin/products')
  redirect('/admin/products')
}

async function addVariant(productId: string, formData: FormData) {
  'use server'
  const name = (formData.get('v_name') || '').toString().trim()
  const sku = (formData.get('v_sku') || '').toString().trim() || null
  const priceOverride = formData.get('v_price') ? Number(formData.get('v_price')) : null
  const stock = Number(formData.get('v_stock') || 0)
  if (!name) return
  await prisma.productVariant.create({ data: { productId, name, sku, priceOverride: priceOverride ?? null, stock } })
  revalidatePath(`/admin/products/${productId}`)
}

async function updateVariant(productId: string, variantId: string, formData: FormData) {
  'use server'
  const name = (formData.get('v_name') || '').toString().trim()
  const sku = (formData.get('v_sku') || '').toString().trim() || null
  const priceOverride = formData.get('v_price') ? Number(formData.get('v_price')) : null
  const stock = Number(formData.get('v_stock') || 0)
  const isActive = formData.get('v_active') === 'on'
  await prisma.productVariant.update({ where: { id: variantId }, data: { name, sku, priceOverride: priceOverride ?? null, stock, isActive } })
  revalidatePath(`/admin/products/${productId}`)
}

async function deleteVariant(productId: string, variantId: string) {
  'use server'
  await prisma.productVariant.delete({ where: { id: variantId } })
  revalidatePath(`/admin/products/${productId}`)
}

export default async function EditProductPage({ params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) redirect('/admin/login')
  const product = await prisma.product.findUnique({ where: { id: params.id }, include: { images: true, variants: { orderBy: { createdAt: 'asc' } } } })
  if (!product) return notFound()
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
  const primaryImage = product.images[0]?.url || ''
  return (
    <section className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <form action={deleteProduct.bind(null, product.id)}>
          <button type="submit" className="px-3 py-2 border rounded-lg text-red-600 border-red-300">Delete</button>
        </form>
      </div>
      <form action={updateProduct.bind(null, product.id)} className="space-y-4" encType="multipart/form-data">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="name">Name</label>
          <input id="name" name="name" defaultValue={product.name} className="border rounded-lg px-3 py-2" required />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="slug">Slug</label>
          <input id="slug" name="slug" defaultValue={product.slug} className="border rounded-lg px-3 py-2" required />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="price">Price (cents)</label>
          <input id="price" name="price" type="number" min="0" step="1" defaultValue={product.price} className="border rounded-lg px-3 py-2" required />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="categoryId">Category</label>
          <select id="categoryId" name="categoryId" defaultValue={product.categoryId} className="border rounded-lg px-3 py-2" required>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="imageUrl">Image URL</label>
          <input id="imageUrl" name="imageUrl" defaultValue={primaryImage} className="border rounded-lg px-3 py-2" placeholder="https://..." />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="imageFile">Or upload image</label>
          <input id="imageFile" name="imageFile" type="file" accept="image/*" className="border rounded-lg px-3 py-2" />
        </div>
        
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-3">Background Image (for product page)</h3>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="backgroundImageUrl">Background Image URL</label>
            <input id="backgroundImageUrl" name="backgroundImageUrl" defaultValue={product.backgroundImageUrl || ''} className="border rounded-lg px-3 py-2" placeholder="https://..." />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="backgroundImageFile">Or upload background image</label>
            <input id="backgroundImageFile" name="backgroundImageFile" type="file" accept="image/*" className="border rounded-lg px-3 py-2" />
          </div>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="description">Description</label>
          <textarea id="description" name="description" defaultValue={product.description || ''} className="border rounded-lg px-3 py-2" rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="material">Material</label>
            <input id="material" name="material" defaultValue={product.material || ''} className="border rounded-lg px-3 py-2" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="color">Color</label>
            <input id="color" name="color" defaultValue={product.color || ''} className="border rounded-lg px-3 py-2" />
          </div>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="scale">Scale</label>
          <input id="scale" name="scale" defaultValue={product.scale || ''} className="border rounded-lg px-3 py-2" />
        </div>
        <div className="flex gap-6">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="isActive" defaultChecked={product.isActive} />
            <span className="text-sm">Active</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="isFeatured" defaultChecked={product.isFeatured} />
            <span className="text-sm">Featured</span>
          </label>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-brand text-white px-4 py-2 rounded-lg">Save</button>
          <a href="/admin/products" className="px-4 py-2 border rounded-lg">Cancel</a>
        </div>
      </form>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Variants</h2>
        <div className="space-y-3">
          {product.variants.map(v => (
            <div key={v.id} className="border rounded-lg p-3">
              <div className="grid gap-3 md:grid-cols-12">
                <form className="contents" action={updateVariant.bind(null, product.id, v.id)}>
                  <div className="grid gap-1 md:col-span-3">
                    <label className="text-xs text-gray-600">Name</label>
                    <input name="v_name" defaultValue={v.name} className="border rounded px-3 py-2 w-full" />
                  </div>
                  <div className="grid gap-1 md:col-span-2">
                    <label className="text-xs text-gray-600">SKU</label>
                    <input name="v_sku" defaultValue={v.sku || ''} className="border rounded px-3 py-2 w-full" />
                  </div>
                  <div className="grid gap-1 md:col-span-3">
                    <label className="text-xs text-gray-600">Price Override (cents)</label>
                    <input type="number" name="v_price" defaultValue={v.priceOverride ?? ''} className="border rounded px-3 py-2 w-full" />
                  </div>
                  <div className="grid gap-1 md:col-span-2">
                    <label className="text-xs text-gray-600">Stock</label>
                    <input type="number" name="v_stock" defaultValue={v.stock} className="border rounded px-3 py-2 w-full" />
                  </div>
                  <div className="flex items-center md:col-span-1 mt-6">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" name="v_active" defaultChecked={v.isActive} />
                      <span className="text-sm">Active</span>
                    </label>
                  </div>
                  <div className="md:col-span-1 flex items-end justify-end gap-2 mt-2 md:mt-0">
                    <button className="px-3 py-2 border rounded">Save</button>
                  </div>
                </form>
                <div className="md:col-span-1 flex items-end justify-start md:justify-end">
                  <form action={deleteVariant.bind(null, product.id, v.id)}>
                    <button className="px-3 py-2 border rounded text-red-600">Delete</button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>

        <form action={addVariant.bind(null, product.id)} className="border rounded-lg p-3">
          <div className="grid gap-3 md:grid-cols-12">
            <div className="grid gap-1 md:col-span-3">
              <label className="text-xs text-gray-600">Name</label>
              <input name="v_name" placeholder="Size L / 6 cm" className="border rounded px-3 py-2 w-full" />
            </div>
            <div className="grid gap-1 md:col-span-2">
              <label className="text-xs text-gray-600">SKU</label>
              <input name="v_sku" className="border rounded px-3 py-2 w-full" />
            </div>
            <div className="grid gap-1 md:col-span-3">
              <label className="text-xs text-gray-600">Price Override (cents)</label>
              <input type="number" name="v_price" className="border rounded px-3 py-2 w-full" />
            </div>
            <div className="grid gap-1 md:col-span-2">
              <label className="text-xs text-gray-600">Initial Stock</label>
              <input type="number" name="v_stock" defaultValue={0} className="border rounded px-3 py-2 w-full" />
            </div>
            <div className="md:col-span-2 flex items-end">
              <button className="px-3 py-2 border rounded">Add Variant</button>
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}


