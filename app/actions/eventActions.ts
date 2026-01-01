"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { saveFile } from "@/lib/upload"; // Importamos la utilidad

// Configuración Discord
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const REVIEW_CHANNEL_ID = process.env.DISCORD_EVENTS_CHANNEL_ID;

export async function requestEvent(formData: FormData) {
  // @ts-ignore
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Debes iniciar sesión.");

  // 1. Extraer datos del FormData
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const eventDateStr = formData.get("date") as string; // datetime-local string
  
  // Archivos
  const flyerFile = formData.get("flyer") as File;
  const mappingFiles = formData.getAll("mappingFiles") as File[]; // Múltiples archivos

  // Booleans (Checkboxes/Selects vienen como string "true" o null)
  const needsCars = formData.get("needsCars") === "true";
  const carsDesc = formData.get("carsDesc") as string;
  const needsRadio = formData.get("needsRadio") === "true";
  const needsMapping = formData.get("needsMapping") === "true";
  const mappingDesc = formData.get("mappingDesc") as string;

  if (!title || !description || !eventDateStr || !flyerFile) {
    throw new Error("Faltan datos obligatorios.");
  }

  // 2. Subir Archivos al Servidor
  let flyerUrl = "";
  if (flyerFile.size > 0) {
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

  // 3. Guardar en Base de Datos
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
      mappingFiles: mappingUrls.length > 0 ? mappingUrls.join(",") : null,
      
      status: 'PENDING',
      creatorId: parseInt(session.user.id)
    }
  });

  // 4. Notificar a Discord (Con Botones para Staff)
  if (DISCORD_BOT_TOKEN && REVIEW_CHANNEL_ID) {
      try {
          const payload = {
              content: `🔔 **Nueva Solicitud de Evento** (ID: ${newEvent.id})`,
              embeds: [{
                  title: title,
                  description: `**Solicitante:** ${session.user.name}\n**Fecha:** ${new Date(eventDateStr).toLocaleString()}\n\n**Descripción:**\n${description.substring(0, 200)}...`,
                  color: 5793266, // Blurple
                  image: { url: `https://tu-dominio.com${flyerUrl}` }, // Discord necesita URL pública
                  fields: [
                      { name: "🚗 Coches", value: needsCars ? "SÍ" : "NO", inline: true },
                      { name: "📻 Radio", value: needsRadio ? "SÍ" : "NO", inline: true },
                      { name: "🏗️ Mapeo", value: needsMapping ? "SÍ" : "NO", inline: true }
                  ],
                  footer: { text: "Panel de Eventos - Staff Review" }
              }],
              components: [{
                  type: 1,
                  components: [
                      { type: 2, style: 3, label: "Aprobar", custom_id: `approve_${newEvent.id}`, emoji: { name: "✅" } },
                      { type: 2, style: 4, label: "Rechazar", custom_id: `reject_${newEvent.id}`, emoji: { name: "✖️" } }
                  ]
              }]
          };

          // Nota: Si estás en localhost, la imagen no se verá en Discord.
          // En producción, asegúrate de poner tu dominio real.
          
          await fetch(`https://discord.com/api/v10/channels/${REVIEW_CHANNEL_ID}/messages`, {
              method: 'POST',
              headers: {
                  'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
          });

      } catch (error) {
          console.error("Error enviando a Discord:", error);
      }
  }

  revalidatePath("/events/panel");
  return { success: true };
}