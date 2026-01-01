"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { saveFile } from "@/lib/upload"; // La utilidad que creamos antes

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const REVIEW_CHANNEL_ID = process.env.DISCORD_EVENTS_CHANNEL_ID;

export async function requestEvent(formData: FormData) {
  // @ts-ignore
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Debes iniciar sesión.");

  // 1. Recoger datos (Mismos nombres que tu HTML antiguo)
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const eventDateStr = formData.get("date") as string;
  const flyerFile = formData.get("flyer") as File;
  
  // Datos técnicos (Strings o nulls según tu formulario antiguo)
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

  // 3. Crear en DB
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
      status: 'PENDING',
      creatorId: parseInt(session.user.id)
    }
  });

  // 4. Enviar a Discord (Con Embed idéntico a tu preview)
  if (DISCORD_BOT_TOKEN && REVIEW_CHANNEL_ID) {
      try {
          const payload = {
            content: `🔔 **Nueva Solicitud** (ID: ${newEvent.id})`,
            embeds: [{
                title: title,
                description: description,
                color: 5793266,
                image: { url: `https://tu-web.com${flyerUrl}` }, // URL absoluta necesaria para Discord
                fields: [
                    { name: "🕒 Fecha", value: new Date(eventDateStr).toLocaleString(), inline: true },
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

          await fetch(`https://discord.com/api/v10/channels/${REVIEW_CHANNEL_ID}/messages`, {
              method: 'POST',
              headers: {
                  'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
          });
      } catch (e) { console.error(e); }
  }

  revalidatePath("/events/panel");
  return { success: true };
}