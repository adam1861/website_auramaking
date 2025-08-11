import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateImages() {
  try {
    // Update categories with background images
    await prisma.category.updateMany({
      where: { slug: 'anime-figures' },
      data: { imageUrl: '/backgrounds/anime_background.png' }
    })
    
    await prisma.category.updateMany({
      where: { slug: 'decorations' },
      data: { imageUrl: '/backgrounds/decorations_background.png' }
    })

    // Update products with local image paths
    const productUpdates = [
      { slug: 'katana-hero-figure', imageUrl: '/Products/anime.png' },
      { slug: 'fox-spirit-statue', imageUrl: '/Products/anime.png' },
      { slug: 'mecha-pilot-bust', imageUrl: '/Products/anime.png' },
      { slug: 'shadow-ninja-diorama', imageUrl: '/Products/anime.png' },
      { slug: 'voronoi-vase', imageUrl: '/Products/decoration.jpeg' },
      { slug: 'geometric-lamp-shade', imageUrl: '/Products/decoration.jpeg' },
      { slug: 'art-deco-wall-panel', imageUrl: '/Products/decoration.jpeg' },
      { slug: 'spiral-planter', imageUrl: '/Products/decoration.jpeg' },
      { slug: 'custom-d20-dice', imageUrl: '/Products/chess.jpg' },
      { slug: 'meeple-set-10', imageUrl: '/Products/chess.jpg' },
      { slug: 'card-holder-stand', imageUrl: '/Products/chess.jpg' },
      { slug: 'token-tray', imageUrl: '/Products/chess.jpg' }
    ]

    for (const update of productUpdates) {
      // Delete old image
      await prisma.productImage.deleteMany({
        where: {
          product: { slug: update.slug }
        }
      })

      // Create new image with local path
      await prisma.productImage.create({
        data: {
          url: update.imageUrl,
          alt: update.slug,
          product: { connect: { slug: update.slug } }
        }
      })
    }

    console.log('✅ Images updated successfully!')
  } catch (error) {
    console.error('❌ Error updating images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateImages()
