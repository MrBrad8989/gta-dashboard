import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req:  Request) {
  try {
    const session = await getServerSession(authOptions);

    console.log("📝 Session check:", session ?  "Autenticado" : "No autenticado");

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado - Inicia sesión" }, { status: 401 });
    }

    if (!session.user.discordId) {
      return NextResponse. json({ error: "Sesión inválida - Vuelve a iniciar sesión" }, { status: 401 });
    }

    // Verificar permisos (solo ADMIN, FOUNDER, TRIAL_ADMIN, SUPPORT)
    const user = await prisma.user.findUnique({
      where: { discordId: session.user.discordId },
    });

    console.log("👤 Usuario encontrado:", user ? `${user.name} (${user.role})` : "No encontrado");

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado en la base de datos" }, { status:  403 });
    }

    if (! ["FOUNDER", "ADMIN", "TRIAL_ADMIN", "SUPPORT"].includes(user.role)) {
      return NextResponse. json({ 
        error: `No tienes permisos para enviar embeds.  Tu rol: ${user.role}` 
      }, { status: 403 });
    }

    const { webhookUrl, username, avatarUrl, content, embed } = await req.json();

    // Validar URL del webhook
    if (!webhookUrl || !webhookUrl.startsWith("https://discord.com/api/webhooks/")) {
      return NextResponse.json({ 
        error: "URL de webhook inválida.  Debe empezar con:  https://discord.com/api/webhooks/" 
      }, { status: 400 });
    }

    console.log(`🚀 Enviando embed via webhook... `);
    console.log(`👤 Username: "${username || 'Dashboard Bot'}"`);
    console.log(`🖼️ Avatar URL: "${avatarUrl || 'ninguno'}"`);

    // Construir el payload para Discord
    const discordPayload: any = {
      embeds: [embed],
    };

    // Siempre incluir username para sobrescribir el predeterminado
    if (username && username.trim()) {
      discordPayload.username = username.trim();
    } else {
      discordPayload.username = "Dashboard Bot";
    }

    // Solo incluir avatar_url si existe y no está vacío
    if (avatarUrl && avatarUrl.trim()) {
      discordPayload.avatar_url = avatarUrl.trim();
    }

    // Solo incluir content si existe
    if (content && content.trim()) {
      discordPayload.content = content.trim();
    }

    console.log("📦 Discord Payload:", JSON.stringify(discordPayload, null, 2));

    // Enviar a Discord mediante Webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers:  {
        "Content-Type":  "application/json",
      },
      body: JSON.stringify(discordPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Discord Webhook error:", errorText);
      
      let errorMessage = "Error al enviar el embed";
      
      if (response.status === 404) {
        errorMessage = "Webhook no encontrado o eliminado";
      } else if (response.status === 401) {
        errorMessage = "Webhook inválido";
      } else if (response.status === 400) {
        errorMessage = "Datos del embed inválidos";
      }
      
      return NextResponse.json(
        { error: errorMessage, details: errorText },
        { status: response.status }
      );
    }

    console.log("✅ Embed enviado exitosamente via webhook");

    return NextResponse.json({
      success: true,
      message: "Embed enviado correctamente",
    });
  } catch (error) {
    console.error("❌ Error sending embed:", error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}