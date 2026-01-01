"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createReport(formData: FormData) {
  // @ts-ignore
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error("No autorizado");

  const type = formData.get("type") as string;
  const reportedName = formData.get("reportedName") as string;
  const dateTime = formData.get("dateTime") as string;
  const title = formData.get("title") as string;
  const rawDescription = formData.get("description") as string;
  const proofUrl = formData.get("proofUrl") as string;

  // 1. APLICAMOS LA PLANTILLA OFICIAL DE NORMATIVA
  // Convertimos los campos sueltos en un texto formateado bonito para el Staff
  let formattedDescription = "";

  if (type === "USER_REPORT") {
    formattedDescription = `
**📋 REPORTE A JUGADOR**
------------------------------------------------
**👤 Denunciante:** ${session.user.name}
**👤 Acusado:** ${reportedName}
**📅 Fecha y Hora (IC/OOC):** ${new Date(dateTime).toLocaleString()}
------------------------------------------------
**📜 Explicación de los hechos:**
${rawDescription}
    `;
  } else if (type === "FACTION_REPORT") {
    formattedDescription = `
**🛡️ REPORTE A FACCIÓN**
------------------------------------------------
**👤 Denunciante:** ${session.user.name}
**🏴 Facción Acusada:** ${reportedName}
**📅 Fecha y Hora:** ${new Date(dateTime).toLocaleString()}
------------------------------------------------
**📜 Explicación de los hechos:**
${rawDescription}
    `;
  }

  // 2. BUSCAR ID DEL ACUSADO (Solo si es jugador, para vincularlo al sistema)
  let reportedUserId = null;
  if (type === "USER_REPORT") {
     const userFound = await prisma.user.findFirst({
        where: { name: reportedName }
     });
     if (userFound) reportedUserId = userFound.id;
  }

  // 3. GUARDAR TICKET
  await prisma.ticket.create({
    data: {
      title: `[REPORTE] ${title}`,
      description: formattedDescription.trim(),
      type: type as any,
      status: "OPEN",
      proofUrl,
      creatorId: parseInt(session.user.id),
      reportedUserId: reportedUserId
    }
  });

  revalidatePath("/my-reports"); // Asumiendo que esta es la ruta de listado de reportes
  revalidatePath("/admin/reports");
  redirect("/my-reports");
}