import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import AddToCart from './parts/AddToCart'

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({ where: { slug: params.slug }, include: { images: true, category: true, variants: { where: { isActive: true } } } })
  if (!product) return notFound()

  return (
    <div className="relative min-h-screen">
            {/* Background Image */}
      {product.backgroundImageUrl && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 z-0"
          style={{
            backgroundImage: `url(${product.backgroundImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'brightness(0.3)',
            marginTop: '80px' // Start below the header
          }}
        />
      )}
      


      {/* Content */}
      <div className="relative z-10">
        <section className="grid md:grid-cols-2 gap-10 max-w-7xl mx-auto px-4 py-8">
          <div id="page-theme" data-theme={product.category.slug} className="hidden" />
          
          {/* Product Image */}
          <div>
            <img src={product.images[0]?.url || '/placeholder.png'} alt={product.images[0]?.alt || product.name} className="w-full h-auto border-4 border-white rounded-lg shadow-lg" />
          </div>
          
          {/* Product Info */}
          <div className="space-y-6">
            {/* Page Title */}
            <div className="mb-4">
              <h1 className="text-5xl font-bold text-black mb-3">Product Details</h1>
            </div>
            
            {/* Product Name */}
            <div>
              <h2 className="text-4xl font-bold text-black mb-2">{product.name}</h2>
              <h3 className="text-xl font-semibold text-black">{product.category.name}</h3>
            </div>
            
            {/* Description */}
            {product.description && (
              <p className="text-black leading-relaxed">{product.description}</p>
            )}
            
            {/* Product Details */}
            <div className="grid grid-cols-3 gap-4">
              {product.material && (
                <div>
                  <div className="text-xs text-black font-medium">Material</div>
                  <div className="text-black font-semibold">{product.material}</div>
                </div>
              )}
              {product.color && (
                <div>
                  <div className="text-xs text-black font-medium">Color</div>
                  <div className="text-black font-semibold">{product.color}</div>
                </div>
              )}
              {product.scale && (
                <div>
                  <div className="text-xs text-black font-medium">Scale</div>
                  <div className="text-black font-semibold">{product.scale}</div>
                </div>
              )}
            </div>
            
            {/* Unit Price */}
            <div>
              <div className="text-black font-semibold">
                Unit price: {(product.price / 100).toFixed(2)} MAD
              </div>
            </div>
            
            {/* Add to Cart */}
            <div>
              <AddToCart productId={product.id} price={product.price} variants={product.variants as any} />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
