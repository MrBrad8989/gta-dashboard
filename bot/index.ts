import 'dotenv/config';

import { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, TextChannel } from 'discord.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

// CONFIGURACIÓN (Pon esto en .env)
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const ANNOUNCE_CHANNEL_ID = process.env.DISCORD_ANNOUNCE_CHANNEL_ID; // Canal Público (Donde se publica al aceptar)

client.on('ready', () => {
    console.log(`🤖 Bot de Gestión de Eventos listo como ${client.user?.tag}`);
});

client.on('interactionCreate', async (interaction) => {
    // 1. GESTIÓN DE BOTONES (Aprobar / Rechazar)
    if (interaction.isButton()) {
        const [action, eventIdStr] = interaction.customId.split('_');
        const eventId = parseInt(eventIdStr);

        if (action === 'approve') {
            await interaction.deferUpdate();

            // Buscar evento
            const event = await prisma.event.findUnique({ where: { id: eventId }, include: { creator: true } });
            if (!event || event.status !== 'PENDING') return;

            // A) PUBLICAR EN CANAL DE ANUNCIOS
            const announceChannel = await client.channels.fetch(ANNOUNCE_CHANNEL_ID!) as TextChannel;
            if (announceChannel) {
                const embed = new EmbedBuilder()
                    .setTitle(`🎉 ${event.title}`)
                    .setDescription(`¡Nuevo evento confirmado en la ciudad!\n\n🔗 **Más info:** [Enlace al Foro](${event.gtawLink})`)
                    .setImage(event.flyerUrl)
                    .setColor('#00ff00')
                    .setFooter({ text: `Organizado por: ${event.creator.name}` });
                
                await announceChannel.send({ embeds: [embed] });
            }

            // B) CREAR TICKET SI HAY SOLICITUDES ESPECIALES
            if (event.specialRequests && event.specialRequests.trim().length > 0) {
                await prisma.ticket.create({
                    data: {
                        title: `[EVENTO] Solicitudes: ${event.title}`,
                        description: `**Solicitudes Especiales para el evento:**\n${event.specialRequests}\n\nEvento ID: #${event.id}`,
                        type: 'GENERAL_SUPPORT', // O crea un tipo EVENT_SUPPORT si prefieres
                        status: 'OPEN',
                        creatorId: event.creatorId,
                        proofUrl: event.flyerUrl
                    }
                });
            }

            // C) ACTUALIZAR DB
            await prisma.event.update({
                where: { id: eventId },
                data: { status: 'APPROVED' }
            });

            await interaction.editReply({ content: `✅ **Aprobado** por <@${interaction.user.id}>. Publicado y gestionado.`, components: [] });

        } else if (action === 'reject') {
            // ABRIR MODAL PARA PEDIR MOTIVO
            const modal = new ModalBuilder()
                .setCustomId(`modalReject_${eventId}`)
                .setTitle('Motivo del Rechazo');

            const reasonInput = new TextInputBuilder()
                .setCustomId('reason')
                .setLabel("¿Por qué se rechaza?")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const row = new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput);
            modal.addComponents(row);

            await interaction.showModal(modal);
        }
    }

    // 2. GESTIÓN DEL MODAL (Guardar rechazo)
    if (interaction.isModalSubmit()) {
        const [action, eventIdStr] = interaction.customId.split('_');
        if (action === 'modalReject') {
            const eventId = parseInt(eventIdStr);
            const reason = interaction.fields.getTextInputValue('reason');

            await interaction.deferUpdate();

            // ACTUALIZAR DB CON EL MOTIVO
            await prisma.event.update({
                where: { id: eventId },
                data: { 
                    status: 'REJECTED',
                    rejectionReason: reason
                }
            });

            await interaction.editReply({ content: `❌ **Rechazado** por <@${interaction.user.id}>.\n**Motivo:** ${reason}`, components: [] });
        }
    }
});

client.login(TOKEN);