import { prisma } from '@/lib/db'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatMoney } from '@/lib/pricing'

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await prisma.category.findUnique({ where: { slug: params.slug } })
  if (!category) return notFound()
  const products = await prisma.product.findMany({ where: { categoryId: category.id, isActive: true }, include: { images: true } })
  const slugLc = category.slug.toLowerCase()
  const bgUrl =
    category.imageUrl ||
    (slugLc.includes('anime')
      ? '/backgrounds/anime_background.png'
      : slugLc.includes('decor')
      ? '/backgrounds/decorations_background.png'
      : null)
  const themeClass = slugLc.includes('anime')
    ? 'text-emerald-700'
    : slugLc.includes('board')
    ? 'text-blue-700'
    : slugLc.includes('decor')
    ? 'text-amber-700'
    : 'text-black'

  return (
    <>
      {bgUrl ? (
        <div
          className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-cover bg-center bg-no-repeat min-h-[85vh] py-16"
          style={{ backgroundImage: `url(${bgUrl})` }}
        >
          <div className="container">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h1 className={`text-3xl font-bold ${themeClass}`}>{category.name}</h1>
                {category.description && <p className={`mt-1 ${themeClass}`}>{category.description}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <Link key={p.id} href={`/products/${p.slug}`} className="card overflow-hidden group">
                  <div className="h-56 overflow-hidden">
                    <img src={p.images[0]?.url || '/placeholder.png'} alt={p.images[0]?.alt || p.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  </div>
              <div className="p-4 flex items-center justify-between">
                <div className="font-medium text-black">{p.name}</div>
                    <div className="text-sm text-gray-500">{formatMoney(p.price)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${themeClass}`}>{category.name}</h1>
              {category.description && <p className={`mt-1 ${themeClass}`}>{category.description}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(p => (
              <Link key={p.id} href={`/products/${p.slug}`} className="card overflow-hidden group">
                <div className="h-56 overflow-hidden">
                  <img src={p.images[0]?.url || '/placeholder.png'} alt={p.images[0]?.alt || p.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div className="font-medium group-hover:text-brand-700 transition-colors">{p.name}</div>
                  <div className="text-sm text-gray-500">{formatMoney(p.price)}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
