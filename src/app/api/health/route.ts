import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    // Test database connection
    await prisma.$connect()
    const count = await prisma.category.count()
    
    return Response.json({ 
      status: 'ok', 
      database: 'connected',
      categories: count,
      env: {
        hasDatabase: !!process.env.DATABASE_URL,
        hasAdmin: !!process.env.ADMIN_EMAIL,
        nodeEnv: process.env.NODE_ENV
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return Response.json({ 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Unknown error',
      env: {
        hasDatabase: !!process.env.DATABASE_URL,
        hasAdmin: !!process.env.ADMIN_EMAIL,
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
