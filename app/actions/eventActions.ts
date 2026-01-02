"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { saveFile } from "@/lib/upload";

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const REVIEW_CHANNEL_ID = process.env.DISCORD_EVENTS_CHANNEL_ID;

export async function requestEvent(formData: FormData) {
  // @ts-ignore
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Debes iniciar sesión.");

  // ✅ Debug
  console.log("Session:", JSON.stringify(session.user, null, 2));

  // ✅ Ahora session.user.id ya es el ID numérico de la DB (como string)
  if (!session.user.id) {
    throw new Error("No se pudo obtener el ID del usuario");
  }

  const userId = parseInt(session.user.id);
  console.log("Using user ID from session:", userId);

  // 1. Recoger datos
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const eventDateStr = formData.get("date") as string;
  const flyerFile = formData.get("flyer") as File;

  const needsCars = formData.get("needsCars") === "true";
  const carsDesc = formData.get("carsDesc") as string;
  const needsRadio = formData.get("needsRadio") === "true";
  const needsMapping = formData.get("needsMapping") === "true";
  const mappingDesc = formData.get("mappingDesc") as string;
  const mappingFiles = formData.getAll("mappingFiles") as File[];

  // 2. Subir Archivos
  let flyerUrl = "";
  if (flyerFile && flyerFile.size > 0) {
    flyerUrl = await saveFile(flyerFile, "flyers");
  }

  let mappingUrls: string[] = [];
  if (needsMapping && mappingFiles.length > 0) {
    for (const file of mappingFiles) {
      if (file.size > 0) {
        const url = await saveFile(file, "mapping");
        mappingUrls.push(url);
      }
    }
  }

  // 3. Crear en Base de Datos
  // 3. Crear en Base de Datos
  const newEvent = await prisma.event.create({
    data: {
      title,
      description,
      eventDate: new Date(eventDateStr),
      flyerUrl,
      needsCars,
      carsDesc: needsCars ? carsDesc : null,
      needsRadio,
      needsMapping,
      mappingDesc: needsMapping ? mappingDesc : null,
      mappingFiles: mappingUrls.join(","),
      status: "PENDING",
      creatorId: userId,
      subscribers: [],
      publicMessageId: null,
      startNotified: false,
      ticketChannelId: null,
    },
  });

  // 4. ✅ Enviar al bot de Discord (que está en puerto 3001)
  try {
    const botResponse = await fetch("http://localhost:3001/api/evento", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        date: eventDateStr,
        userId: session.user.discordId, // ✅ Enviar discordId para mencionar en Discord
        needsCars,
        carsDesc,
        needsRadio,
        needsMapping,
        mappingDesc,
        eventId: newEvent.id, // ✅ Enviar el ID del evento creado
        flyerPath: flyerUrl,
        mappingPaths: mappingUrls,
      }),
    });

    if (!botResponse.ok) {
      console.error("Error al enviar al bot:", await botResponse.text());
    } else {
      console.log("✅ Evento enviado al bot de Discord");
    }
  } catch (error) {
    console.error("❌ Error conectando con el bot:", error);
  }

  revalidatePath("/events");
  return { success: true };
}
