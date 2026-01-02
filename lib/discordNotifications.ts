import { prisma } from "@/lib/prisma";

// Constants
const MESSAGE_PREVIEW_LENGTH = 100;
const NOTIFICATION_TITLE = "📩 Nuevo mensaje en tu ticket";
const NOTIFICATION_REPLY_TEXT = "ha respondido:";
const NOTIFICATION_LINK_TEXT = "🔗 Ver ticket";
const NOTIFICATION_LINK_LABEL = "Haz clic aquí para ver el ticket";

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
    const truncatedPreview = messagePreview.substring(0, MESSAGE_PREVIEW_LENGTH) + 
                            (messagePreview.length > MESSAGE_PREVIEW_LENGTH ? '...' : '');
    
    // Enviar DM mediante el bot de Discord
    const response = await fetch(`${process.env.BOT_API_URL}/send-dm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        discordId: user.discordId,
        message: {
          embeds: [{
            title: NOTIFICATION_TITLE,
            description: `**${ticketTitle}**\n\n${senderName} ${NOTIFICATION_REPLY_TEXT}\n> ${truncatedPreview}`,
            color: 0x5865F2,
            fields: [{
              name: NOTIFICATION_LINK_TEXT,
              value: `[${NOTIFICATION_LINK_LABEL}](${ticketUrl})`
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
