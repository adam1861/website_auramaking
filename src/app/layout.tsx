import '@/styles/globals.css'
import { prisma } from '@/lib/db'
import { unstable_noStore as noStore } from 'next/cache'
import HeaderNav from '@/components/HeaderNav'

export const metadata = {
  title: 'Auramking — 3D Printing by Auramaking',
  description: 'Anime Figures, Decorations, Board Games — 3D printed in Morocco.'
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  noStore()
  
  let categories = []
  try {
    categories = await prisma.category.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })
  } catch (error) {
    console.error('Failed to load categories:', error)
    // Use fallback categories for navigation
    categories = [
      { id: '1', name: 'Anime Figures', slug: 'anime', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: '2', name: 'Decorations', slug: 'decorations', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: '3', name: 'Board Games', slug: 'board-games', isActive: true, createdAt: new Date(), updatedAt: new Date() }
    ]
  }
  
  // Map slugs to theme hues
  const slugToTheme: Record<string, string> = {
    anime: 'text-emerald-700',
    'board-games': 'text-blue-700',
    decorations: 'text-amber-700',
  }
  return (
    <html lang="en">
      <body>
        <HeaderNav categories={categories} />
        <main className="container py-6">{children}</main>
        <footer className="border-t mt-12">
          <div className="container py-6 text-sm text-gray-500 flex justify-between">
            <span>© {new Date().getFullYear()} Auramaking — All rights reserved.</span>
            <span>Made in Morocco • Currency: MAD</span>
          </div>
        </footer>
      </body>
    </html>
  )
}
