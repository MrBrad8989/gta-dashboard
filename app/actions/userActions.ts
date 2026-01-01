"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

// Verificar permisos de seguridad
async function checkAdminPermissions() {
  // @ts-ignore
  const session = await getServerSession(authOptions);
  if (!session || !['FOUNDER', 'ADMIN'].includes(session.user.role)) {
    throw new Error("No tienes permisos para realizar esta acción.");
  }
  return session;
}

// 1. CAMBIAR ROL
export async function updateUserRole(userId: number, newRole: string) {
  await checkAdminPermissions();

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole }
  });

  revalidatePath("/admin/users");
}

// 2. VETAR / DESVETAR USUARIO
export async function toggleUserBan(userId: number) {
  const session = await checkAdminPermissions();

  // Protección: Un Admin no puede banearse a sí mismo
  if (parseInt(session.user.id) === userId) {
      throw new Error("No puedes auto-banearte.");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) throw new Error("Usuario no encontrado");

  await prisma.user.update({
    where: { id: userId },
    data: { isBanned: !user.isBanned }
  });

  revalidatePath("/admin/users");
}