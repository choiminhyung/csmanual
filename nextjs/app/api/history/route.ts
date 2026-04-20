import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const staffName  = searchParams.get('staff_name') ?? ''
  const customerId = searchParams.get('customer_id') ?? ''
  const fromDate   = searchParams.get('from_date') ?? ''
  const toDate     = searchParams.get('to_date') ?? ''

  const userMessages = await prisma.chatMessage.findMany({
    where: {
      role: 'user',
      ...(staffName  && { staff_name:  { contains: staffName } }),
      ...(customerId && { session_id:  { contains: customerId } }),
      ...(fromDate   && { created_at:  { gte: new Date(fromDate) } }),
      ...(toDate     && { created_at:  { lte: new Date(`${toDate}T23:59:59`) } }),
    },
    orderBy: { created_at: 'desc' },
  })

  const result = await Promise.all(
    userMessages.map(async (um) => {
      const assistant = await prisma.chatMessage.findFirst({
        where: { session_id: um.session_id, role: 'assistant', id: { gt: um.id } },
        orderBy: { id: 'asc' },
      })
      return {
        id:          um.id,
        staff_name:  um.staff_name,
        customer_id: um.session_id,
        question:    um.content,
        answer:      assistant?.content ?? '',
        created_at:  um.created_at,
      }
    })
  )

  return NextResponse.json(result)
}
