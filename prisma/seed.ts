import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('ChangeMe123!', 10)
  await prisma.user.upsert({
    where: { email: 'admin@auramking.com' },
    update: {},
    create: { email: 'admin@auramking.com', name: 'Admin', passwordHash, role: 'ADMIN' }
  })

  const categories = [
    { name: 'Anime Figures', slug: 'anime-figures', description: '3D-printed anime collectibles', imageUrl: '' },
    { name: 'Decorations', slug: 'decorations', description: 'Unique decorative items', imageUrl: '' },
    { name: 'Board Games', slug: 'board-games', description: 'Game pieces & accessories', imageUrl: '' },
  ]
  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c })
  }

  const products = [
    { name: 'Katana Hero Figure', slug: 'katana-hero-figure', price: 49900, categorySlug: 'anime-figures', description: '20cm PLA, detailed finish', material: 'PLA', color: 'Black', scale: '1:10' },
    { name: 'Fox Spirit Statue', slug: 'fox-spirit-statue', price: 59900, categorySlug: 'anime-figures', description: '18cm Resin-like', material: 'PLA+', color: 'White', scale: '1:12' },
    { name: 'Mecha Pilot Bust', slug: 'mecha-pilot-bust', price: 39900, categorySlug: 'anime-figures', description: '12cm bust', material: 'PLA', color: 'Gray', scale: '1:12' },
    { name: 'Shadow Ninja Diorama', slug: 'shadow-ninja-diorama', price: 89900, categorySlug: 'anime-figures', description: 'Diorama base included', material: 'PLA', color: 'Black', scale: '1:8' },
    { name: 'Voronoi Vase', slug: 'voronoi-vase', price: 24900, categorySlug: 'decorations', description: 'Watertight with insert', material: 'PETG', color: 'Clear', scale: '20cm' },
    { name: 'Geometric Lamp Shade', slug: 'geometric-lamp-shade', price: 34900, categorySlug: 'decorations', description: 'E27 mount', material: 'PLA', color: 'Gold', scale: '25cm' },
    { name: 'Art Deco Wall Panel', slug: 'art-deco-wall-panel', price: 29900, categorySlug: 'decorations', description: '30x30cm tile', material: 'PLA', color: 'Bronze', scale: '30cm' },
    { name: 'Spiral Planter', slug: 'spiral-planter', price: 19900, categorySlug: 'decorations', description: '15cm planter', material: 'PLA', color: 'Green', scale: '15cm' },
    { name: 'Custom D20 Dice', slug: 'custom-d20-dice', price: 14900, categorySlug: 'board-games', description: 'Precision printed', material: 'Resin', color: 'Purple', scale: '20mm' },
    { name: 'Meeple Set (10)', slug: 'meeple-set-10', price: 12900, categorySlug: 'board-games', description: 'Classic meeples', material: 'PLA', color: 'Assorted', scale: 'standard' },
    { name: 'Card Holder Stand', slug: 'card-holder-stand', price: 15900, categorySlug: 'board-games', description: '4-slot stand', material: 'PLA', color: 'Black', scale: '—' },
    { name: 'Token Tray', slug: 'token-tray', price: 17900, categorySlug: 'board-games', description: 'Modular tray', material: 'PLA', color: 'Gray', scale: '—' },
  ]

  for (const p of products) {
    const category = await prisma.category.findUnique({ where: { slug: p.categorySlug } })
    if (!category) continue
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        price: p.price,
        description: p.description,
        material: p.material,
        color: p.color,
        scale: p.scale,
        categoryId: category.id,
        images: { create: [{ url: 'https://picsum.photos/seed/' + p.slug + '/800/800', alt: p.name }] }
      }
    })
  }

  console.log('Seed complete. Admin: admin@auramking.com / ChangeMe123!')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(async () => { await prisma.$disconnect() })
