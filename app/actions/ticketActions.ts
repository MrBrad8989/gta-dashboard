"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 

export async function createTicket(formData: FormData) {
  // @ts-ignore
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new Error("No estás logueado");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const type = formData.get("type") as any;
  const proofUrl = formData.get("proofUrl") as string; // <--- RECOGEMOS EL LINK

  if (!title || !description || !type) {
    throw new Error("Faltan datos");
  }

  await prisma.ticket.create({
    data: {
      title,
      description,
      type,
      proofUrl: proofUrl || null, // <--- LO GUARDAMOS
      creatorId: parseInt(session.user.id),
      status: "OPEN"
    }
  });

  revalidatePath("/tickets");
  revalidatePath("/admin/reports"); 
  redirect("/tickets");
}
// ... (Tus imports y la función createTicket que ya tenías) ...

// ACCIÓN: ENVIAR MENSAJE AL CHAT
export async function sendMessage(ticketId: number, formData: FormData) {
  // @ts-ignore
  const session = await getServerSession(authOptions);
  if (!session) return;

  const content = formData.get("content") as string;
  if (!content.trim()) return;

  // Creamos el mensaje
  await prisma.ticketMessage.create({
    data: {
      content,
      ticketId,
      authorId: parseInt(session.user.id),
    }
  });

  // Actualizamos la fecha del ticket para que suba arriba en la lista
  await prisma.ticket.update({
    where: { id: ticketId },
    data: { updatedAt: new Date() }
  });

  revalidatePath(`/tickets/${ticketId}`);
}

// ACCIÓN: CAMBIAR ESTADO (Cerrar/Reabrir) - SOLO ADMIN O PROPIETARIO
export async function updateTicketStatus(ticketId: number, newStatus: string) {
    // @ts-ignore
    const session = await getServerSession(authOptions);
    // Aquí podrías añadir validación extra de seguridad si quieres

    await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: newStatus as any }
    });

    revalidatePath(`/tickets/${ticketId}`);
    revalidatePath("/admin/reports");
}