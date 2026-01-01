"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 

// 1. CREAR TICKET (Cualquier usuario logueado)
export async function createTicket(formData: FormData) {
  // @ts-ignore
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new Error("No estás logueado");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const type = formData.get("type") as any;
  const proofUrl = formData.get("proofUrl") as string;

  if (!title || !description || !type) {
    throw new Error("Faltan datos");
  }

  await prisma.ticket.create({
    data: {
      title,
      description,
      type,
      proofUrl: proofUrl || null,
      creatorId: parseInt(session.user.id),
      status: "OPEN"
    }
  });

  revalidatePath("/tickets");
  revalidatePath("/admin/reports"); 
  redirect("/tickets");
}

// 2. ENVIAR MENSAJE (Cualquier usuario logueado en el ticket)
export async function sendMessage(ticketId: number, formData: FormData) {
  // @ts-ignore
  const session = await getServerSession(authOptions);
  if (!session) return;

  const content = formData.get("content") as string;
  if (!content.trim()) return;

  await prisma.ticketMessage.create({
    data: {
      content,
      ticketId,
      authorId: parseInt(session.user.id),
    }
  });

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { updatedAt: new Date() }
  });

  revalidatePath(`/tickets/${ticketId}`);
}

// 3. CAMBIAR ESTADO (SOLO ADMIN) - Seguridad aplicada aquí
export async function updateTicketStatus(ticketId: number, newStatus: string) {
    // @ts-ignore
    const session = await getServerSession(authOptions);
    
    // Si no es admin, cortamos la ejecución
    if (!session || session.user.role !== 'ADMIN') {
        throw new Error("Acceso denegado: Solo administradores pueden gestionar tickets.");
    }

    await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: newStatus as any }
    });

    revalidatePath(`/tickets/${ticketId}`);
    revalidatePath("/admin/reports");
}
// NUEVA FUNCIÓN: AÑADIR USUARIO AL TICKET (SOLO ADMIN)
export async function addUserToTicket(ticketId: number, formData: FormData) {
  // @ts-ignore
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
      throw new Error("Solo los administradores pueden añadir usuarios.");
  }

  const username = formData.get("username") as string;
  if (!username) return;

  // 1. Buscar al usuario por nombre exacto
  const userToAdd = await prisma.user.findFirst({
    where: { name: username }
  });

  if (!userToAdd) {
    // Si no lo encuentra, podríamos lanzar error, pero por ahora no hacemos nada 
    // (en un sistema real mostraríamos una alerta)
    return;
  }

  // 2. Añadirlo a la lista de participantes
  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      participants: {
        connect: { id: userToAdd.id }
      }
    }
  });

  // 3. Dejar un mensaje automático de sistema avisando
  await prisma.ticketMessage.create({
    data: {
      content: `🔒 SISTEMA: El administrador ha añadido a ${userToAdd.name} al ticket.`,
      ticketId: ticketId,
      authorId: parseInt(session.user.id), // Lo firma el admin
    }
  });

  revalidatePath(`/tickets/${ticketId}`);
}