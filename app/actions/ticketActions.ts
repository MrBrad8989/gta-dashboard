"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 

// 1. CREAR TICKET O REPORTE
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
  
  // NUEVO: Capturamos el nombre del reportado
  const reportedUserName = formData.get("reportedUserName") as string;

  if (!title || !description || !type) {
    throw new Error("Faltan datos obligatorios");
  }

  // Lógica para buscar el ID del usuario reportado (si existe)
  let reportedUserId = null;
  if (reportedUserName) {
    const userFound = await prisma.user.findFirst({
        where: { name: reportedUserName } // Busca por nombre exacto
    });
    if (userFound) {
        reportedUserId = userFound.id;
    }
  }

  await prisma.ticket.create({
    data: {
      title,
      description,
      type,
      proofUrl: proofUrl || null,
      creatorId: parseInt(session.user.id),
      status: "OPEN",
      reportedUserId: reportedUserId // <--- Guardamos al acusado
    }
  });

  // Revalidamos ambas listas por si acaso
  revalidatePath("/tickets");
  revalidatePath("/my-reports");
  revalidatePath("/admin/reports"); 

  // Redirigimos según el tipo
  if (type === 'USER_REPORT' || type === 'FACTION_REPORT') {
      redirect("/my-reports");
  } else {
      redirect("/tickets");
  }
}

// 2. ENVIAR MENSAJE
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

// 3. CAMBIAR ESTADO (SOLO ADMIN)
export async function updateTicketStatus(ticketId: number, newStatus: string) {
    // @ts-ignore
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
        throw new Error("Acceso denegado.");
    }

    await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: newStatus as any }
    });

    revalidatePath(`/tickets/${ticketId}`);
    revalidatePath("/admin/reports");
}

// 4. AÑADIR USUARIO AL TICKET (SOLO ADMIN)
export async function addUserToTicket(ticketId: number, formData: FormData) {
  // @ts-ignore
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
      throw new Error("Solo los administradores pueden añadir usuarios.");
  }

  const username = formData.get("username") as string;
  if (!username) return;

  const userToAdd = await prisma.user.findFirst({
    where: { name: username }
  });

  if (!userToAdd) return;

  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      participants: {
        connect: { id: userToAdd.id }
      }
    }
  });

  await prisma.ticketMessage.create({
    data: {
      content: `🔒 SISTEMA: El administrador ha añadido a ${userToAdd.name} al ticket.`,
      ticketId: ticketId,
      authorId: parseInt(session.user.id),
    }
  });

  revalidatePath(`/tickets/${ticketId}`);
}