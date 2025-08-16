import Link from 'next/link'
import { prisma } from '@/lib/db'
import { unstable_noStore as noStore } from 'next/cache'

export default async function HomePage() {
  noStore()
  
  let categories = []
  try {
    categories = await prisma.category.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })
  } catch (error) {
    console.error('Failed to load categories:', error)
    // Use fallback categories
    categories = [
      { id: '1', name: 'Anime Figures', slug: 'anime', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: '2', name: 'Decorations', slug: 'decorations', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: '3', name: 'Board Games', slug: 'board-games', isActive: true, createdAt: new Date(), updatedAt: new Date() }
    ]
  }
  return (
    <section className="space-y-8">
      <div
        className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-cover bg-center bg-no-repeat min-h-[85vh] py-24 md:py-36"
        style={{ backgroundImage: "url(/home.png)" }}
      >
        <div className="container">
          <h1 className="text-3xl font-bold mb-3 text-black">Auramking Store</h1>
          <p className="text-gray-700 max-w-2xl">High‑quality prints across Anime Figures, Decorations, and Board Games — shipped from Morocco.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {categories.map((c, idx) => (
              <Link
                key={c.id}
                className={`btn ${idx % 2 === 0 ? 'bg-brand text-white hover:opacity-90' : 'border-brand text-brand hover:bg-brand/10'}`}
                href={`/categories/${c.slug}`}
              >
                Shop {c.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div>
          <h2 className="text-2xl font-semibold mb-3">About Auramaking</h2>
          <p className="text-gray-700 leading-relaxed">
            Auramaking is a small studio in Morocco dedicated to premium 3D‑printed anime figures,
            board‑game pieces, and home decorations. We blend careful craftsmanship with modern
            printing to deliver pieces that look great on your shelf and last for years.
          </p>
          <ul className="mt-4 space-y-2 text-gray-700">
            <li>• High‑quality materials (resin / PLA) with smooth, durable finishes</li>
            <li>• Made in Morocco — fast local shipping and secure packaging</li>
            <li>• Sizes and variants tailored to your preferences</li>
            <li>• Fair prices and friendly support</li>
          </ul>
          <p className="mt-4 text-gray-700">
            Whether you collect anime, enhance your board games, or decorate your space, choose
            Auramaking for detail, reliability, and care in every print.
          </p>
        </div>
        <div className="rounded-xl border p-6 bg-white/60">
          <h3 className="text-lg font-semibold mb-2">Contact Us</h3>
          <p className="text-gray-700 mb-3">Reach out anytime — we’d love to help.</p>
          <ul className="space-y-2 text-gray-700">
            <li>
              <span className="font-medium">Email:</span>{' '}
              <a className="text-brand" href="mailto:contact@auramaking.com">contact@auramaking.com</a>
            </li>
            <li>
              <span className="font-medium">Phone:</span>{' '}
              <a className="text-brand" href="tel:+212600000000">+212 6 00 00 00 00</a>
            </li>
            <li>
              <span className="font-medium">Instagram:</span>{' '}
              <a className="text-brand" href="https://instagram.com/auramaking" target="_blank" rel="noreferrer noopener">@auramaking</a>
            </li>
          </ul>
        </div>
      </div>
      
      {/* New Simple Dark Footer */}
      <footer className="bg-black text-white mt-0">
        <div className="py-16">
          <div className="px-0">
            <div className="grid md:grid-cols-3 gap-12">
              {/* Brand Section */}
              <div className="text-center md:text-left">
                <div className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  AURAMAKING
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Where creativity meets craftsmanship. 
                  Every piece tells a story, every detail matters.
                </p>
                <div className="flex justify-center md:justify-start space-x-4">
                  <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-all duration-300 hover:scale-110">
                    <span className="text-lg">📱</span>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-all duration-300 hover:scale-110">
                    <span className="text-lg">📧</span>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-all duration-300 hover:scale-110">
                    <span className="text-lg">🎯</span>
                  </a>
                </div>
              </div>
              
              {/* Fun Facts Section */}
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-6 text-purple-300">Did You Know? 🤔</h3>
                <div className="space-y-4">
                  <div className="bg-gray-900 p-4 rounded-lg border-l-4 border-purple-500">
                    <p className="text-sm text-gray-300">Our 3D printers run 24/7</p>
                  </div>
                  <div className="bg-gray-900 p-4 rounded-lg border-l-4 border-pink-500">
                    <p className="text-sm text-gray-300">Each figure takes 6-12 hours</p>
                  </div>
                  <div className="bg-gray-900 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm text-gray-300">Made with love in Morocco 🇲🇦</p>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="text-center md:text-right">
                <h3 className="text-xl font-semibold mb-6 text-purple-300">Ready to Create? ✨</h3>
                <div className="space-y-3">
                  <a href="/categories/anime" className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105">
                    Explore Anime Figures
                  </a>
                  <a href="/categories/decorations" className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                    View Decorations
                  </a>
                                     <a href="/cart" className="block w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105">
                     🛒 Your Cart
                   </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Line */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="px-0 text-center">
              <p className="text-gray-400 text-sm">
                © 2025 Auramaking • Crafted with 💜 in Morocco • 
                <span className="text-purple-400 font-semibold"> Free shipping on orders over 500 MAD!</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </section>
  )
}

function CategoryCard({ name, slug }: { name: string, slug: string }) {
  return (
    <Link href={`/categories/${slug}`} className="rounded-xl border p-6 hover:shadow">
      <div className="text-lg font-semibold">{name}</div>
      <div className="text-gray-500">Explore {name}</div>
    </Link>
  )
}
