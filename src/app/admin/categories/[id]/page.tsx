import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect, notFound } from 'next/navigation'
import { promises as fs } from 'fs'
import path from 'path'

async function updateCategory(id: string, formData: FormData) {
  'use server'
  
  try {
    const name = (formData.get('name') || '').toString().trim()
    const slug = (formData.get('slug') || '').toString().trim()
    const description = (formData.get('description') || '').toString().trim() || null
    let imageUrl = (formData.get('imageUrl') || '').toString().trim() || null
    const isActive = formData.get('isActive') === 'on'

    if (!name || !slug) {
      throw new Error('Name and slug are required')
    }

    const file = formData.get('imageFile') as File | null
    if (file && file.size > 0) {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        await fs.mkdir(uploadDir, { recursive: true })
        const ext = path.extname(file.name) || '.png'
        const fileName = `${Date.now()}-${slug}${ext}`
        const fullPath = path.join(uploadDir, fileName)
        await fs.writeFile(fullPath, buffer)
        imageUrl = `/uploads/${fileName}`
      } catch (fileError) {
        console.error('File upload error:', fileError)
        // Continue without file upload if it fails
      }
    }

    await prisma.category.update({
      where: { id },
      data: { name, slug, description: description || undefined, imageUrl: imageUrl || undefined, isActive }
    })
    
    revalidatePath('/admin/categories')
    redirect('/admin/categories')
  } catch (error) {
    console.error('Category update error:', error)
    // In production, you might want to redirect to an error page
    throw error
  }
}

async function deleteCategory(id: string) {
  'use server'
  
  try {
    const productCount = await prisma.product.count({ where: { categoryId: id } })
    if (productCount > 0) {
      throw new Error('Cannot delete a category that has products')
    }
    
    await prisma.category.delete({ where: { id } })
    revalidatePath('/admin/categories')
    redirect('/admin/categories')
  } catch (error) {
    console.error('Category deletion error:', error)
    // In production, you might want to redirect to an error page
    throw error
  }
}

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const category = await prisma.category.findUnique({ where: { id: params.id } })
  if (!category) return notFound()
  return (
    <section className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Category</h1>
        <form action={deleteCategory.bind(null, category.id)}>
          <button type="submit" className="px-3 py-2 border rounded-lg text-red-600 border-red-300">Delete</button>
        </form>
      </div>
      <form action={updateCategory.bind(null, category.id)} className="space-y-4" encType="multipart/form-data">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="name">Name</label>
          <input id="name" name="name" defaultValue={category.name} className="border rounded-lg px-3 py-2" required />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="slug">Slug</label>
          <input id="slug" name="slug" defaultValue={category.slug} className="border rounded-lg px-3 py-2" required />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="description">Description</label>
          <textarea id="description" name="description" defaultValue={category.description || ''} className="border rounded-lg px-3 py-2" rows={3} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="imageUrl">Image URL</label>
          <input id="imageUrl" name="imageUrl" defaultValue={category.imageUrl || ''} className="border rounded-lg px-3 py-2" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="imageFile">Or upload image</label>
          <input id="imageFile" name="imageFile" type="file" accept="image/*" className="border rounded-lg px-3 py-2" />
        </div>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" name="isActive" defaultChecked={category.isActive} />
          <span className="text-sm">Active</span>
        </label>
        <div className="flex gap-2">
          <button type="submit" className="bg-brand text-white px-4 py-2 rounded-lg">Save</button>
          <a href="/admin/categories" className="px-4 py-2 border rounded-lg">Cancel</a>
        </div>
      </form>
    </section>
  )
}


