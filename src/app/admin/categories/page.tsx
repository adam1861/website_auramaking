import { isAdminAuthenticated } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import type { Category } from '@prisma/client'

export default async function AdminCategories({ 
  searchParams 
}: { 
  searchParams?: { error?: string; success?: string } 
}) {
  if (!isAdminAuthenticated()) redirect('/admin/login')
  
  const cats: Category[] = await prisma.category.findMany({ orderBy: { createdAt: 'desc' } })
  
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Link className="bg-brand text-white px-3 py-2 rounded-lg" href="/admin/categories/new">New</Link>
      </div>
      
      {/* Error and Success Messages */}
      {searchParams?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {searchParams.error}
        </div>
      )}
      {searchParams?.success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {searchParams.success}
        </div>
      )}
      
      <div className="space-y-2">
        {cats.map((c: Category) => (
          <div key={c.id} className="flex items-center justify-between border rounded-lg p-3">
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-gray-500">{c.slug}</div>
            </div>
            <div className="flex gap-2">
              <Link className="px-3 py-1 border rounded-lg" href={`/admin/categories/${c.id}`}>Edit</Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
