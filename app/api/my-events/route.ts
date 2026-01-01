import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  // @ts-ignore
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json([], { status: 401 });

  const events = await prisma.event.findMany({
    where: { creatorId: parseInt(session.user.id) },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(events);
}