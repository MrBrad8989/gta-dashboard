import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 30;

export async function GET() {
  try {
    // @ts-ignore
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?. id) {
      return NextResponse. json([], { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // ✅ Query optimizada con selección específica
    const events = await prisma.event.findMany({
      where: { 
        creatorId: userId
      },
      select: {
        id: true,
        title: true,
        description: true,
        eventDate: true,
        flyerUrl: true,
        publicImageUrl: true,
        needsCars: true,
        needsRadio: true,
        needsMapping: true,
        status: true,
        createdAt: true,
        subscribers: true,
        publicMessageId: true,
        startNotified: true,
        // ✅ No traer campos pesados innecesarios
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // ✅ Limitar resultados
    });

    return NextResponse.json(events);
    
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}