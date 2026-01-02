import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // @ts-ignore
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?. id) {
      console.log('No session or user ID found');
      return NextResponse.json([], { status: 401 });
    }

    console.log('Fetching events for user:', session.user.id);

    const events = await prisma. event.findMany({
      where: { 
        creatorId: parseInt(session.user.id) 
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('Found events:', events.length);
    return NextResponse.json(events);
    
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}