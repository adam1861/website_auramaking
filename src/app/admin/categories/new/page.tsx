import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { promises as fs } from 'fs'
import path from 'path'

async function createCategory(formData: FormData) {
  'use server'
  const name = (formData.get('name') || '').toString().trim()
  const slug = (formData.get('slug') || '').toString().trim()
  const description = (formData.get('description') || '').toString().trim() || null
  let imageUrl = (formData.get('imageUrl') || '').toString().trim() || null
  const isActive = formData.get('isActive') === 'on'

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

  if (!name || !slug) {
    throw new Error('Name and slug are required')
  }

  await prisma.category.create({
    data: { name, slug, description: description || undefined, imageUrl: imageUrl || undefined, isActive }
  })
  revalidatePath('/admin/categories')
  redirect('/admin/categories')
}

export default function NewCategoryPage() {
  return (
    <section className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">New Category</h1>
      </div>
      <form action={createCategory} className="space-y-4" encType="multipart/form-data">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="name">Name</label>
          <input id="name" name="name" className="border rounded-lg px-3 py-2" required />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="slug">Slug</label>
          <input id="slug" name="slug" className="border rounded-lg px-3 py-2" placeholder="my-category" required />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="description">Description</label>
          <textarea id="description" name="description" className="border rounded-lg px-3 py-2" rows={3} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="imageUrl">Image URL</label>
          <input id="imageUrl" name="imageUrl" className="border rounded-lg px-3 py-2" placeholder="https://..." />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="imageFile">Or upload image</label>
          <input id="imageFile" name="imageFile" type="file" accept="image/*" className="border rounded-lg px-3 py-2" />
        </div>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" name="isActive" defaultChecked />
          <span className="text-sm">Active</span>
        </label>
        <div className="flex gap-2">
          <button type="submit" className="bg-brand text-white px-4 py-2 rounded-lg">Create</button>
          <a href="/admin/categories" className="px-4 py-2 border rounded-lg">Cancel</a>
        </div>
      </form>
    </section>
  )
}


