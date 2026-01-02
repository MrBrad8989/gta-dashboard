import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[... nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getCachedData, setCachedData } from "@/lib/cache";

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidar cada 60 segundos

export async function GET() {
  try {
    // @ts-ignore
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse. json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que el usuario sea FOUNDER o ADMIN
    const user = await prisma.user.findUnique({
      where: { discordId: session.user.discordId },
      select: { role: true }, // ✅ Solo traer lo necesario
    });

    if (!user || !['FOUNDER', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: "No tienes permisos" }, { status: 403 });
    }

    // ✅ Intentar obtener de caché
    const cacheKey = 'all-users';
    const cachedUsers = getCachedData<any[]>(cacheKey, 30000); // 30 segundos

    if (cachedUsers) {
      return NextResponse.json(cachedUsers, {
        headers: { 'X-Cache': 'HIT' },
      });
    }

    // Obtener todos los usuarios
    const users = await prisma.user.findMany({
      orderBy: { createdAt:  "desc" },
      select:  { // ✅ Solo campos necesarios
        id: true,
        discordId: true,
        name: true,
        avatar: true,
        role: true,
        createdAt: true,
        lastLogin: true,
        isBanned: true,
      },
    });

    // ✅ Guardar en caché
    setCachedData(cacheKey, users);

    return NextResponse.json(users, {
      headers: { 'X-Cache': 'MISS' },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse. json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(req:  Request) {
  try {
    // @ts-ignore
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse. json({ error: "No autorizado" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { discordId: session.user. discordId },
      select:  { role: true, id: true }, // ✅ Solo lo necesario
    });

    if (!admin || !['FOUNDER', 'ADMIN'].includes(admin.role)) {
      return NextResponse.json({ error: "No tienes permisos" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, role, isBanned } = body;

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }, // ✅ Solo lo necesario
    });

    if (targetUser?.role === 'FOUNDER' && admin.role !== 'FOUNDER') {
      return NextResponse.json({ error: "No puedes editar al fundador" }, { status: 403 });
    }

    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (isBanned !== undefined) updateData.isBanned = isBanned;

    const updatedUser = await prisma.user.update({
      where: { id:  userId },
      data: updateData,
    });

    // ✅ Limpiar caché
    const { clearCache } = await import("@/lib/cache");
    clearCache('all-users');

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}