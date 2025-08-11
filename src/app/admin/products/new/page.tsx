import { prisma } from '@/lib/db'
import { isAdminAuthenticated } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { promises as fs } from 'fs'
import path from 'path'

async function createProduct(formData: FormData) {
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

  await prisma.product.create({
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
      images: imageUrl ? { create: [{ url: imageUrl, alt: name }] } : undefined,
    }
  })
  revalidatePath('/admin/products')
  redirect('/admin/products')
}

export default async function NewProductPage() {
  if (!isAdminAuthenticated()) redirect('/admin/login')
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
  return (
    <section className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">New Product</h1>
      </div>
      <form action={createProduct} className="space-y-4" encType="multipart/form-data">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="name">Name</label>
          <input id="name" name="name" className="border rounded-lg px-3 py-2" required />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="slug">Slug</label>
          <input id="slug" name="slug" className="border rounded-lg px-3 py-2" placeholder="my-product" required />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="price">Price (cents)</label>
          <input id="price" name="price" type="number" min="0" step="1" className="border rounded-lg px-3 py-2" required />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="categoryId">Category</label>
          <select id="categoryId" name="categoryId" className="border rounded-lg px-3 py-2" required>
            <option value="">Select a category...</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="imageUrl">Image URL</label>
          <input id="imageUrl" name="imageUrl" className="border rounded-lg px-3 py-2" placeholder="https://..." />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="imageFile">Or upload image</label>
          <input id="imageFile" name="imageFile" type="file" accept="image/*" className="border rounded-lg px-3 py-2" />
        </div>
        
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-3">Background Image (for product page)</h3>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="backgroundImageUrl">Background Image URL</label>
            <input id="backgroundImageUrl" name="backgroundImageUrl" className="border rounded-lg px-3 py-2" placeholder="https://..." />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="backgroundImageFile">Or upload background image</label>
            <input id="backgroundImageFile" name="backgroundImageFile" type="file" accept="image/*" className="border rounded-lg px-3 py-2" />
          </div>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="description">Description</label>
          <textarea id="description" name="description" className="border rounded-lg px-3 py-2" rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="material">Material</label>
            <input id="material" name="material" className="border rounded-lg px-3 py-2" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="color">Color</label>
            <input id="color" name="color" className="border rounded-lg px-3 py-2" />
          </div>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="scale">Scale</label>
          <input id="scale" name="scale" className="border rounded-lg px-3 py-2" />
        </div>
        <div className="flex gap-6">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="isActive" defaultChecked />
            <span className="text-sm">Active</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="isFeatured" />
            <span className="text-sm">Featured</span>
          </label>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-brand text-white px-4 py-2 rounded-lg">Create</button>
          <a href="/admin/products" className="px-4 py-2 border rounded-lg">Cancel</a>
        </div>
      </form>
    </section>
  )
}


