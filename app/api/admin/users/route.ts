import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // @ts-ignore
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que el usuario sea FOUNDER o ADMIN
    const user = await prisma.user.findUnique({
      where: { discordId: session.user.discordId },
    });

    if (!user || ! ['FOUNDER', 'ADMIN']. includes(user.role)) {
      return NextResponse.json({ error: "No tienes permisos" }, { status: 403 });
    }

    // Obtener todos los usuarios
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    // @ts-ignore
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que el usuario sea FOUNDER o ADMIN
    const admin = await prisma.user.findUnique({
      where: { discordId: session.user. discordId },
    });

    if (!admin || !['FOUNDER', 'ADMIN'].includes(admin.role)) {
      return NextResponse.json({ error: "No tienes permisos" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, role, isBanned } = body;

    // El FOUNDER no puede ser editado por otros
    const targetUser = await prisma.user. findUnique({
      where:  { id: userId }
    });

    if (targetUser?. role === 'FOUNDER' && admin.role !== 'FOUNDER') {
      return NextResponse.json({ error: "No puedes editar al fundador" }, { status: 403 });
    }

    // Actualizar usuario
    const updateData:  any = {};
    if (role !== undefined) updateData.role = role;
    if (isBanned !== undefined) updateData.isBanned = isBanned;

    const updatedUser = await prisma.user. update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}