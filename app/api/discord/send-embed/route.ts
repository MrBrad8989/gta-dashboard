import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const DISCORD_BOT_TOKEN = process.env. DISCORD_BOT_TOKEN;

export async function POST(req: Request) {
  try {
    // @ts-ignore
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar permisos (solo ADMIN, FOUNDER, TRIAL_ADMIN, SUPPORT)
    const user = await prisma.user.findUnique({
      where: { discordId: session.user.discordId },
    });

    if (!user || ! ["FOUNDER", "ADMIN", "TRIAL_ADMIN", "SUPPORT"]. includes(user.role)) {
      return NextResponse.json({ error: "No tienes permisos para enviar embeds" }, { status: 403 });
    }

    const { channelId, content, embed } = await req.json();

    if (!channelId) {
      return NextResponse.json({ error: "Se requiere un ID de canal" }, { status: 400 });
    }

    if (! DISCORD_BOT_TOKEN) {
      return NextResponse.json({ error: "Bot token no configurado" }, { status: 500 });
    }

    // Enviar a Discord
    const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body:  JSON.stringify({
        content: content || undefined,
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Discord API error:", error);
      return NextResponse.json(
        { error: error.message || "Error al enviar el embed" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      messageId: data.id,
      channelId: data.channel_id,
    });
  } catch (error) {
    console.error("Error sending embed:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}