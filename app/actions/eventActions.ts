"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // ✅ Cambiar ruta
import { revalidatePath } from "next/cache";
import { saveFile } from "@/lib/upload";

const DISCORD_BOT_TOKEN = process.env. DISCORD_BOT_TOKEN;
const REVIEW_CHANNEL_ID = process. env.DISCORD_EVENTS_CHANNEL_ID;

export async function requestEvent(formData: FormData) {
  // @ts-ignore
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Debes iniciar sesión.");

  // ✅ Debug: Ver qué valor tiene session.user.id
  console. log('Session user ID:', session. user.id);
  console.log('Session user ID type:', typeof session.user.id);

  // ✅ Obtener el usuario de la base de datos usando discordId
  const user = await prisma.user.findUnique({
    where: { discordId: session.user.discordId }
  });

  if (!user) {
    throw new Error("Usuario no encontrado en la base de datos");
  }

  console.log('Found user in DB:', user. id);

  // 1. Recoger datos
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const eventDateStr = formData.get("date") as string;
  const flyerFile = formData.get("flyer") as File;
  
  const needsCars = formData.get("needsCars") === "true";
  const carsDesc = formData.get("carsDesc") as string;
  const needsRadio = formData.get("needsRadio") === "true";
  const needsMapping = formData.get("needsMapping") === "true";
  const mappingDesc = formData. get("mappingDesc") as string;
  const mappingFiles = formData.getAll("mappingFiles") as File[];

  // 2. Subir Archivos
  let flyerUrl = "";
  if (flyerFile && flyerFile.size > 0) {
      flyerUrl = await saveFile(flyerFile, "flyers");
  }

  let mappingUrls:  string[] = [];
  if (needsMapping && mappingFiles.length > 0) {
      for (const file of mappingFiles) {
          if (file.size > 0) {
              const url = await saveFile(file, "mapping");
              mappingUrls. push(url);
          }
      }
  }

  // 3. Crear en Base de Datos
  const newEvent = await prisma.event.create({
    data: {
      title,
      description,
      eventDate:  new Date(eventDateStr),
      flyerUrl,
      needsCars,
      carsDesc:  needsCars ? carsDesc : null,
      needsRadio,
      needsMapping,
      mappingDesc:  needsMapping ? mappingDesc :  null,
      mappingFiles:  mappingUrls. join(","),
      status: 'PENDING',
      creatorId: user.id, // ✅ Usar el ID del usuario de la DB (número)
      subscribers: [],
      publicMessageId: null,
      startNotified: false,
      ticketChannelId: null
    }
  });

  // 4. Enviar a Discord
  if (DISCORD_BOT_TOKEN && REVIEW_CHANNEL_ID) {
      try {
          const payload = {
            content: `🔔 **Nueva Solicitud** (ID: ${newEvent.id})`,
            embeds: [{
                title: title,
                description: description,
                color: 5793266,
                image: { url: `${process.env.NEXTAUTH_URL}${flyerUrl}` },
                fields: [
                    { name:  "🕒 Fecha", value: new Date(eventDateStr).toLocaleString(), inline: true },
                    { name: "🚗 Coches", value: needsCars ?  "SÍ" : "NO", inline: true },
                    { name: "📻 Radio", value: needsRadio ?  "SÍ" : "NO", inline: true },
                    { name: "🏗️ Mapeo", value: needsMapping ?  "SÍ" : "NO", inline: true }
                ],
                footer: { text: "Panel de Eventos - Staff Review" }
            }],
            components: [{
                type: 1,
                components: [
                    { type: 2, style: 3, label: "Aprobar", custom_id: `approve_${newEvent.id}`, emoji: { name: "✅" } },
                    { type:  2, style: 4, label: "Rechazar", custom_id: `reject_${newEvent.id}`, emoji: { name: "✖️" } }
                ]
            }]
          };

          await fetch(`https://discord.com/api/v10/channels/${REVIEW_CHANNEL_ID}/messages`, {
              method: 'POST',
              headers: {
                  'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
          });
      } catch (e) { 
        console.error('Error sending to Discord:', e); 
      }
  }

  revalidatePath("/events");
  return { success:  true };
}