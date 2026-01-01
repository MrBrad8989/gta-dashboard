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
  const reportedUserName = formData.get("reportedUserName") as string;

  if (!title || !description || !type) {
    throw new Error("Faltan datos obligatorios");
  }

  let reportedUserId = null;
  if (reportedUserName) {
    const userFound = await prisma.user.findFirst({
        where: { name: reportedUserName }
    });
    if (userFound) reportedUserId = userFound.id;
  }

  await prisma.ticket.create({
    data: {
      title,
      description,
      type,
      proofUrl: proofUrl || null,
      creatorId: parseInt(session.user.id),
      status: "OPEN",
      reportedUserId: reportedUserId
    }
  });

  revalidatePath("/tickets");
  revalidatePath("/my-reports");
  revalidatePath("/admin/reports"); 

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

// 3. CAMBIAR ESTADO (STAFF)
export async function updateTicketStatus(ticketId: number, newStatus: string) {
    // @ts-ignore
    const session = await getServerSession(authOptions);
    const allowedRoles = ['FOUNDER', 'ADMIN', 'TRIAL_ADMIN', 'SUPPORT'];
    
    if (!session || !allowedRoles.includes(session.user.role)) {
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
  
  if (!session || !['FOUNDER', 'ADMIN'].includes(session.user.role)) {
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

// 5. RECLAMAR TICKET (AUTO-ASIGNACIÓN CON LÍMITE)
export async function claimTicket(ticketId: number) {
  // @ts-ignore
  const session = await getServerSession(authOptions);
  
  const allowedRoles = ['FOUNDER', 'ADMIN', 'TRIAL_ADMIN', 'SUPPORT'];
  if (!session || !allowedRoles.includes(session.user.role)) {
      throw new Error("No tienes permisos para reclamar tickets.");
  }

  const currentUserId = parseInt(session.user.id);
  const currentUserRole = session.user.role;

  // --- LÓGICA ANTI-FARMEO (Límite 5) ---
  if (['SUPPORT', 'TRIAL_ADMIN'].includes(currentUserRole)) {
      const activeTicketsCount = await prisma.ticket.count({
          where: {
              assignedToId: currentUserId,
              status: { in: ['OPEN', 'IN_PROGRESS'] } // Solo cuentan los activos
          }
      });

      if (activeTicketsCount >= 5) {
          throw new Error("⛔ Límite alcanzado (5 tickets). Cierra alguno antes de reclamar.");
      }
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (ticket?.assignedToId && ticket.assignedToId !== currentUserId) {
      throw new Error("Este ticket ya tiene dueño.");
  }

  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      assignedToId: currentUserId,
      status: 'IN_PROGRESS'
    }
  });

  await prisma.ticketMessage.create({
    data: {
      content: `🔒 SISTEMA: El staff ${session.user.name} ha reclamado este ticket.`,
      ticketId: ticketId,
      authorId: currentUserId,
    }
  });

  revalidatePath("/admin/reports");
  revalidatePath(`/tickets/${ticketId}`);
}

// 6. ASIGNACIÓN MANUAL (SOLO ADMINS - SIN LÍMITE)
export async function assignTicketManually(formData: FormData) {
  // @ts-ignore
  const session = await getServerSession(authOptions);

  if (!session || !['FOUNDER', 'ADMIN'].includes(session.user.role)) {
      throw new Error("Solo Admins/Founders pueden forzar asignaciones.");
  }

  const ticketId = parseInt(formData.get("ticketId") as string);
  const targetUserId = parseInt(formData.get("targetUserId") as string);
  const assignerName = session.user.name;

  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!targetUser) throw new Error("Staff no encontrado.");

  // Forzamos la asignación (Override)
  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      assignedToId: targetUserId,
      status: 'IN_PROGRESS'
    }
  });

  await prisma.ticketMessage.create({
    data: {
      content: `🔒 SISTEMA: El administrador ${assignerName} asignó este ticket a ${targetUser.name}.`,
      ticketId: ticketId,
      authorId: parseInt(session.user.id),
    }
  });

  revalidatePath("/admin/reports");
}