"use client"
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

type Category = { id: string; name: string; slug: string }

function getThemeForPath(pathname: string) {
  const p = pathname.toLowerCase()
  // Home uses new purple brand
  if (p === '/' || p === '') return { themeClass: 'text-brand-700', logo: '/logo-purple.svg' }
  // Cart and Admin should use purple theme/logo
  if (p.startsWith('/cart') || p.startsWith('/admin') || p.startsWith('/checkout')) {
    return { themeClass: 'text-brand-700', logo: '/logo-purple.svg' }
  }
  // Category themes
  if (p.includes('/categories/anime')) return { themeClass: 'text-emerald-700', logo: '/logo.svg' }
  if (p.includes('/categories/board') || p.includes('/categories/board-games')) return { themeClass: 'text-blue-700', logo: '/logo-blue.svg' }
  if (p.includes('/categories/decor')) return { themeClass: 'text-amber-700', logo: '/logo-amber.svg' }
  return { themeClass: 'text-black', logo: '/logo.svg' }
}

function themeForCategorySlug(slug: string) {
  const s = slug.toLowerCase()
  if (s.includes('anime')) return { themeClass: 'text-emerald-700', logo: '/logo.svg' }
  if (s.includes('board')) return { themeClass: 'text-blue-700', logo: '/logo-blue.svg' }
  if (s.includes('decor')) return { themeClass: 'text-amber-700', logo: '/logo-amber.svg' }
  return { themeClass: 'text-brand-700', logo: '/logo-purple.svg' }
}

export default function HeaderNav({ categories }: { categories: Category[] }) {
  const pathname = usePathname() || '/'
  const [theme, setTheme] = useState(getThemeForPath(pathname))

  useEffect(() => {
    // Detect product detail page theme via DOM signal from server component
    if (pathname.toLowerCase().startsWith('/products/')) {
      const el = document.getElementById('page-theme') as HTMLElement | null
      const slug = el?.getAttribute('data-theme') || ''
      if (slug) {
        setTheme(themeForCategorySlug(slug))
        return
      }
    }
    setTheme(getThemeForPath(pathname))
  }, [pathname])
  return (
    <header className="border-b">
      <div className="container flex items-center justify-between py-3">
        <Link href="/" className={`flex items-center gap-3 ${theme.themeClass}`}>
          <Image src={theme.logo} alt="Auramaking" width={180} height={40} priority />
        </Link>
        <nav className={`flex flex-wrap gap-4 items-center text-sm`}>
          {categories.map(c => (
            <Link key={c.id} href={`/categories/${c.slug}`} className={`${theme.themeClass}`}>
              {c.name}
            </Link>
          ))}
          <Link href="/cart" className={`btn btn-outline ${theme.themeClass.replace('text-', 'border-')}`}>Cart</Link>
          <Link href="/admin" className="text-gray-500">Admin</Link>
        </nav>
      </div>
    </header>
  )
}


