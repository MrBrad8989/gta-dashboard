import { prisma } from "@/lib/prisma";

export async function sendTicketNotification({
  userId,
  ticketId,
  ticketTitle,
  messagePreview,
  senderName,
  dashboardUrl
}: {
  userId: number;
  ticketId: number;
  ticketTitle: string;
  messagePreview: string;
  senderName: string;
  dashboardUrl: string;
}) {
  try {
    // Validar que BOT_API_URL esté configurado
    if (!process.env.BOT_API_URL) {
      console.warn('BOT_API_URL no está configurado, las notificaciones por DM no funcionarán');
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { discordId: true }
    });

    if (!user?.discordId) return;

    const ticketUrl = `${dashboardUrl}/tickets/${ticketId}`;
    
    // Enviar DM mediante el bot de Discord
    const response = await fetch(`${process.env.BOT_API_URL}/send-dm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        discordId: user.discordId,
        message: {
          embeds: [{
            title: "📩 Nuevo mensaje en tu ticket",
            description: `**${ticketTitle}**\n\n${senderName} ha respondido:\n> ${messagePreview.substring(0, 100)}${messagePreview.length > 100 ? '...' : ''}`,
            color: 0x5865F2,
            fields: [{
              name: "🔗 Ver ticket",
              value: `[Haz clic aquí para ver el ticket](${ticketUrl})`
            }],
            footer: { text: `Ticket #${ticketId}` },
            timestamp: new Date().toISOString()
          }]
        }
      })
    });

    if (!response.ok) {
      console.error('Error al enviar DM:', await response.text());
    }
  } catch (error) {
    console.error('Error en sendTicketNotification:', error);
  }
}
