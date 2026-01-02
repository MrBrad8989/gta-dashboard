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

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const eventDateStr = formData.get("date") as string;
  
  // Archivos
  const flyerFile = formData.get("flyer") as File;
  const mappingFiles = formData.getAll("mappingFiles") as File[];

  // Booleans
  const needsCars = formData.get("needsCars") === "true";
  const carsDesc = formData.get("carsDesc") as string;
  const needsRadio = formData.get("needsRadio") === "true";
  const needsMapping = formData.get("needsMapping") === "true";
  const mappingDesc = formData.get("mappingDesc") as string;

  if (!title || !description || !eventDateStr) {
    throw new Error("Faltan datos obligatorios.");
  }

  // 1. Subir Flyer
  let flyerUrl = "";
  if (flyerFile && flyerFile.size > 0) {
      flyerUrl = await saveFile(flyerFile, "flyers");
  } else {
      throw new Error("El flyer es obligatorio.");
  }

  // 2. Subir Mapeo
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

  // 4. Enviar a Discord (CON DEPURACIÓN)
  console.log("--- INTENTANDO ENVIAR A DISCORD ---");
  console.log("Canal:", REVIEW_CHANNEL_ID);
  console.log("Token existe:", !!DISCORD_BOT_TOKEN);

  if (DISCORD_BOT_TOKEN && REVIEW_CHANNEL_ID) {
      try {
          const payload = {
            content: `🔔 **Nueva Solicitud de Evento** (ID: ${newEvent.id})`,
            embeds: [{
                title: title,
                description: `**Solicitante:** ${session.user.name}\n\n${description.substring(0, 200)}...`,
                color: 5793266,
                // NOTA: He comentado la imagen para evitar errores en localhost.
                // Cuando subas la web a internet, descomenta la siguiente línea y pon tu dominio real.
                // image: { url: `https://tu-dominio-real.com${flyerUrl}` },
                fields: [
                    { name: "🕒 Fecha", value: new Date(eventDateStr).toLocaleString(), inline: true },
                    { name: "🚗 Coches", value: needsCars ? "SÍ" : "NO", inline: true },
                    { name: "📻 Radio", value: needsRadio ? "SÍ" : "NO", inline: true },
                    { name: "🏗️ Mapeo", value: needsMapping ? "SÍ" : "NO", inline: true }
                ],
                footer: { text: "Panel de Eventos - Staff Review" }
            }],
            components: [{
                type: 1, // Action Row
                components: [
                    { type: 2, style: 3, label: "Aprobar", custom_id: `approve_${newEvent.id}`, emoji: { name: "✅", id: null } },
                    { type: 2, style: 4, label: "Rechazar", custom_id: `reject_${newEvent.id}`, emoji: { name: "✖️", id: null } }
                ]
            }]
          };

          const response = await fetch(`https://discord.com/api/v10/channels/${REVIEW_CHANNEL_ID}/messages`, {
              method: 'POST',
              headers: {
                  'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
          });

          // LEER RESPUESTA DE DISCORD
          if (!response.ok) {
              const errorText = await response.text();
              console.error("❌ ERROR DISCORD API:", response.status, errorText);
          } else {
              console.log("✅ Mensaje enviado a Discord correctamente.");
          }

      } catch (e) { 
          console.error("❌ Error en el fetch:", e); 
      }
  } else {
      console.warn("⚠️ No se ha configurado el Token o el Canal en el .env");
  }

  revalidatePath("/events/panel");
  return { success: true };
}