"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function createTicket(formData: FormData) {
  // 1. Obtener sesión para saber quién crea el ticket
  // @ts-ignore
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new Error("No estás logueado");
  }

  // 2. Recoger datos del formulario
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const type = formData.get("type") as any; // TicketType

  // 3. Validar
  if (!title || !description || !type) {
    throw new Error("Faltan datos");
  }

  // 4. Guardar en Base de Datos
  await prisma.ticket.create({
    data: {
      title,
      description,
      type,
      creatorId: parseInt(session.user.id), // Convertimos el ID de string a número
      status: "OPEN"
    }
  });

  // 5. Actualizar y redirigir
  revalidatePath("/tickets");
  revalidatePath("/admin/reports"); // Para que los admins lo vean al instante
  redirect("/tickets");
}