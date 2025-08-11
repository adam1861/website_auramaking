import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { itemId } = await req.json()
  if (!itemId) return NextResponse.json({ ok: false }, { status: 400 })
  const cookieStore = await cookies()
  const cartId = cookieStore.get('cart_id')?.value
  if (!cartId) return NextResponse.json({ ok: false }, { status: 400 })
  await prisma.cartItem.delete({ where: { id: itemId } })
  return NextResponse.json({ ok: true })
}


