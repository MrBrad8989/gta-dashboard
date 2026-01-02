import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import Discord from 'discord.js';
const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ChannelType, 
    PermissionFlagsBits
} = Discord;
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import 'dayjs/locale/es.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient, EventStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to safely parse subscribers JSON
function parseSubscribers(subscribers: unknown): string[] {
    if (Array.isArray(subscribers)) {
        return subscribers.filter((s): s is string => typeof s === 'string');
    }
    return [];
}

// --- CONFIGURACIÓN HORARIA ---
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es'); 

// --- CONFIGURACIÓN DISCORD ---
const client = new Client({
    intents: [GatewayIntentBits. Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages]
});

// --- CONFIGURACIÓN MULTER ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dir = 'public/uploads/';
        if (file.fieldname === 'mappingFiles') dir += 'mapping/';
        else dir += 'flyers/';
        
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, `temp_${Date.now()}_${Math.round(Math.random() * 1E9)}${path.extname(file. originalname)}`)
    }
});
const upload = multer({ storage:  storage });

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Endpoint para enviar DMs
app.post('/send-dm', async (req, res) => {
  try {
    const { discordId, message } = req.body;
    
    const user = await client.users.fetch(discordId);
    await user.send(message);
    res.json({ success: true });
  } catch (error) {
    console.error('Error enviando DM:', error);
    res.status(500).json({ error: 'No se pudo enviar el DM' });
  }
});

// --- API:  POST ---
app.post('/api/evento', express.json(), async (req: express.Request, res: express.Response) => {
    
    const data = req.body;

    console.log('📥 Recibido evento desde web:', data);

    // Obtener el evento de la base de datos
    const evt = await prisma.event.findUnique({
        where: { id: data.eventId }
    });

    if (!evt) {
        console.error('❌ Evento no encontrado en DB:', data.eventId);
        return res.status(404).json({ error: 'Evento no encontrado' });
    }

    console.log('✅ Evento encontrado en DB:', evt. id);

    const requiresSupport = evt.needsCars || evt.needsRadio || evt.needsMapping;

    // --- ENVIAR A DISCORD (ADMIN) ---
    const adminChannel = client.channels.cache.get(process.env. CHANNEL_ID_SOLICITUDES || '');
    
    if (! adminChannel) {
        console.error('❌ Canal de solicitudes no encontrado.  ID:', process.env.CHANNEL_ID_SOLICITUDES);
        return res.status(500).json({ error: 'Canal no configurado' });
    }

    if (! ('send' in adminChannel)) {
        console.error('❌ El canal no es de texto');
        return res.status(500).json({ error: 'Canal inválido' });
    }

    const dateObj = dayjs. utc(evt.eventDate);
    
    const embed = new EmbedBuilder()
        .setTitle(requiresSupport ? '🚨 SOLICITUD CON SOPORTE TÉCNICO' : '📢 Nueva Solicitud Estándar')
        .setColor(requiresSupport ? 0xFF0000 : 0xFFA500)
        .addFields(
            { name: '👤 Usuario', value: `<@${data.userId}>`, inline: true },
            { name: '📅 Fecha (UTC)', value: dateObj.format('DD/MM/YYYY HH: mm'), inline: true },
            { name: '📝 Título', value: evt.title, inline: false },
            { name: '📄 Descripción del Evento', value: evt.description, inline: false }
        );

    if (requiresSupport) {
        embed.addFields({ name: '---------------------------------', value: '**🛠️ DETALLES DEL SOPORTE SOLICITADO**' });
        if (evt.needsCars && evt.carsDesc) {
            embed.addFields({ name: '🚗 Vehículos Solicitados', value: `\`\`\`${evt.carsDesc}\`\`\``, inline: false });
        }
        if (evt.needsMapping && evt.mappingDesc) {
            embed.addFields({ name: '🏗️ Mapeo Solicitado', value: `\`\`\`${evt.mappingDesc}\`\`\``, inline: false });
        }
        if (evt.needsRadio) {
            embed.addFields({ name: '📻 Emisora', value: '✅ Requiere configuración de Emisora. ', inline: false });
        }
    } else {
        embed.addFields({ name: '✅ Estado del Soporte', value: 'No requiere soporte técnico.' });
    }

    // ✅ CONSTRUIR RUTAS DE ARCHIVOS CORRECTAMENTE
    const attachments = [];
    
    if (evt.flyerUrl) {
        // Eliminar el primer "/" si existe
        let relativePath = evt.flyerUrl. startsWith('/') ? evt.flyerUrl.substring(1) : evt.flyerUrl;
        
        // Construir ruta absoluta
        const absolutePath = path.join(process.cwd(), 'public', relativePath);
        
        console.log('📂 FlyerUrl original:', evt.flyerUrl);
        console.log('📂 Ruta relativa:', relativePath);
        console.log('📂 Ruta absoluta:', absolutePath);
        console.log('📂 ¿Existe?:', fs.existsSync(absolutePath));
        
        if (fs.existsSync(absolutePath)) {
            attachments.push({ attachment: absolutePath, name: 'flyer.png' });
            embed.setImage('attachment://flyer.png');
            console.log('✅ Flyer agregado a attachments');
        } else {
            console.error('❌ Flyer no encontrado en:', absolutePath);
        }
    }

    const mappingFilesArray = evt.mappingFiles ?  evt.mappingFiles.split(',').filter((f: string) => f.trim()) : [];
    
    if (mappingFilesArray.length > 0) {
        console.log(`📂 Procesando ${mappingFilesArray.length} archivos de mapeo`);
        
        mappingFilesArray.forEach((p: string, i: number) => {
            let relativePath = p. startsWith('/') ? p.substring(1) : p;
            const absolutePath = path.join(process.cwd(), 'public', relativePath);
            
            console.log(`📂 Mapeo ${i+1} - Ruta: `, absolutePath);
            console.log(`📂 Mapeo ${i+1} - ¿Existe?: `, fs.existsSync(absolutePath));
            
            if (fs.existsSync(absolutePath)) {
                attachments.push({ attachment: absolutePath, name:  `mapeo-${i+1}.png` });
                console.log(`✅ Mapeo ${i+1} agregado`);
            } else {
                console.error(`❌ Mapeo ${i+1} no encontrado`);
            }
        });
        
        if (mappingFilesArray.length > 0) {
            embed.addFields({ 
                name: '📂 Archivos de Mapeo', 
                value: `Se solicitaron ${mappingFilesArray.length} archivo(s) de mapeo.` 
            });
        }
    }

    const row = new ActionRowBuilder<typeof ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId(`accept_${evt.id}`).setLabel('Aceptar').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`reject_${evt.id}`).setLabel('Rechazar').setStyle(ButtonStyle. Danger)
    );

    try {
        console.log(`📤 Enviando mensaje a Discord con ${attachments.length} archivo(s)...`);
        await adminChannel.send({ embeds: [embed], files: attachments, components: [row] });
        console.log('✅ Mensaje enviado a Discord exitosamente');
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Error al enviar mensaje a Discord:', error);
        res.status(500).json({ error: 'Error al enviar a Discord' });
    }
});

// --- INTERACCIONES DISCORD ---
client.on('interactionCreate', async (interaction) => {
    
    // --- LÓGICA BOTÓN CERRAR TICKET ---
    if (interaction.isButton() && interaction.customId === 'close_ticket') {
        await interaction.reply({ content: '🗑️ Cerrando ticket y eliminando canal en 5 segundos...', ephemeral: false });
        setTimeout(() => {
            if (interaction.channel && 'delete' in interaction.channel) {
                interaction.channel.delete().catch(e => console.error("Error borrando canal:", e));
            }
        }, 5000);
        return;
    }

    if (interaction.isButton()) {
        const customId = interaction.customId;

        // Verificar si es un botón de evento (accept/reject/interested)
        if (!customId.includes('_')) return;

        const [action, eventIdStr] = customId.split('_');
        const eventId = parseInt(eventIdStr);
        
        // Get event from Prisma
        const evt = await prisma.event.findUnique({ where: { id:  eventId } });
        
        if (!evt && action !== 'close') {
            return interaction.reply({ content: '❌ Evento no encontrado o expirado. ', ephemeral: true });
        }

        // RECHAZAR
        if (action === 'reject' && evt) {
            const modal = new ModalBuilder().setCustomId(`modalReject_${eventId}`).setTitle('Motivo del Rechazo');
            const reasonInput = new TextInputBuilder().setCustomId('reason').setLabel("Motivo").setStyle(TextInputStyle.Paragraph);
            modal.addComponents(new ActionRowBuilder<typeof TextInputBuilder>().addComponents(reasonInput));
            await interaction.showModal(modal);
        }

                // ACEPTAR
        if (action === 'accept' && evt) {
            // ✅ Diferir la respuesta inmediatamente (tenemos 15 minutos después)
            await interaction.deferReply({ ephemeral: true });

            try {
                // Update event status to APPROVED
                await prisma. event.update({
                    where: { id: eventId },
                    data: { status: EventStatus.APPROVED }
                });

                // 1.  PUBLICAR EN ANUNCIOS
                                // 1. PUBLICAR EN ANUNCIOS
                const publicChannel = client.channels.cache. get(process.env.CHANNEL_ID_ANUNCIOS || '');
                if (publicChannel && 'send' in publicChannel) {
                    const timestamp = Math.floor(evt.eventDate.getTime() / 1000);
                    const publicEmbed = new EmbedBuilder()
                        .setTitle(`📅 Nuevo Evento:  ${evt.title}`)
                        .setDescription(evt.description)
                        .setColor(0x5865F2) 
                        .addFields(
                            { name: '🕒 Fecha y Hora', value: `<t:${timestamp}:F>\n(<t: ${timestamp}:R>)`, inline: false },
                            { name: '👥 Interesados', value: '0 personas', inline: false }
                        )
                        .setFooter({ text: `Evento solicitado al Equipo de Eventos del PM. ` });

                    const filesToSend = [];
                    if (evt.flyerUrl) {
                        let relativePath = evt.flyerUrl.startsWith('/') ? evt.flyerUrl.substring(1) : evt.flyerUrl;
                        const absolutePath = path.join(process. cwd(), 'public', relativePath);
                        
                        if (fs.existsSync(absolutePath)) {
                            filesToSend.push({ attachment: absolutePath, name: 'flyer.png' });
                            publicEmbed.setImage('attachment://flyer.png');
                        }
                    }

                    const interestBtn = new ActionRowBuilder<typeof ButtonBuilder>().addComponents(
                        new ButtonBuilder().setCustomId(`interested_${evt.id}`).setLabel('Me interesa').setEmoji('⭐').setStyle(ButtonStyle.Primary)
                    );

                    const sentMsg = await publicChannel.send({ embeds: [publicEmbed], files:  filesToSend, components: [interestBtn] });
                    
                    // ✅ GUARDAR LA URL DEL ATTACHMENT ENVIADO
                    let publicImageUrl = null;
                    if (sentMsg.attachments.size > 0) {
                        const attachment = sentMsg.attachments.first();
                        if (attachment) {
                            publicImageUrl = attachment.url;
                        }
                    }
                    
                    await prisma.event.update({
                        where: { id: eventId },
                        data: { 
                            publicMessageId: sentMsg.id,
                            publicImageUrl: publicImageUrl  // ✅ Guardar URL pública de Discord
                        }
                    });
                }

                // 2. CREAR TICKET SI ES NECESARIO
                                // 2. CREAR TICKET SI ES NECESARIO
                const requiresSupport = evt.needsCars || evt.needsRadio || evt.needsMapping;
                let ticketMention = "No requiere ticket. ";

                if (requiresSupport && process.env.CATEGORY_ID_TICKETS && interaction.guild) {
                    const guild = interaction.guild;
                    
                    const eventCreator = await prisma.user. findUnique({
                        where: { id: evt.creatorId }
                    });

                    if (!eventCreator) {
                        console.error('❌ No se encontró el creador del evento');
                        ticketMention = "Error: Usuario no encontrado. ";
                    } else {
                        // ✅ Preparar permisos del canal
                        const permissions = [
                            {
                                id: guild.id,
                                deny: [PermissionFlagsBits.ViewChannel],
                            },
                            {
                                id: eventCreator. discordId,
                                allow:  [PermissionFlagsBits.ViewChannel, PermissionFlagsBits. SendMessages, PermissionFlagsBits. AttachFiles],
                            },
                            {
                                id: interaction. user.id,
                                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                            },
                            {
                                id: client.user! .id,
                                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits. ManageChannels],
                            }
                        ];

                        // ✅ Si hay rol de soporte configurado, darle permisos también
                        if (process.env.SUPPORT_ROLE_ID) {
                            permissions.push({
                                id: process. env.SUPPORT_ROLE_ID,
                                allow: [PermissionFlagsBits. ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles],
                            });
                        }

                        const ticketChannel = await guild.channels.create({
                            name: `ticket-evento-${eventId}`,
                            type: ChannelType.GuildText,
                            parent: process.env.CATEGORY_ID_TICKETS,
                            permissionOverwrites: permissions,
                        });
                        
                        ticketMention = ticketChannel.toString();

                        await prisma.event.update({
                            where: { id: eventId },
                            data: { ticketChannelId: ticketChannel.id }
                        });

                        const closeBtnRow = new ActionRowBuilder<typeof ButtonBuilder>().addComponents(
                            new ButtonBuilder()
                                .setCustomId('close_ticket')
                                . setLabel('Cerrar Ticket')
                                .setStyle(ButtonStyle.Danger)
                                .setEmoji('🗑️')
                        );

                        const contextEmbed = new EmbedBuilder()
                            .setTitle(`Soporte para:  ${evt.title}`)
                            .setDescription(`Canal creado para coordinar:\n${evt.needsCars ? '• Coches\n' : ''}${evt.needsMapping ? '• Mapeo\n' : ''}${evt.needsRadio ? '• Radio' : ''}`)
                            .setColor(0xFFA500);

                        // ✅ Construir el mensaje con menciones
                        let mentions = `👋 Hola <@${eventCreator.discordId}>`;
                        
                        if (process.env.SUPPORT_ROLE_ID) {
                            mentions += ` y <@&${process.env. SUPPORT_ROLE_ID}>`;
                        }

                        mentions += `,\n\nEste es el canal de soporte para el evento **${evt.title}**.\nUn miembro del equipo os atenderá pronto.\n\nCuando finalice el soporte, pulsa el botón de abajo para cerrar el ticket.`;

                        await ticketChannel.send({
                            content: mentions,
                            embeds: [contextEmbed],
                            components: [closeBtnRow]
                        });
                    }
                }

                // ✅ Editar la respuesta diferida
                await interaction.editReply({ 
                    content: `✅ Evento publicado en anuncios.\n🎫 Estado Ticket: ${ticketMention}`
                });
                
                // Editar mensaje original para quitar botones
                if ('edit' in interaction. message) {
                    await interaction.message.edit({ components: [] });
                }

            } catch (error) {
                console.error('Error procesando aceptación:', error);
                await interaction.editReply({ 
                    content: '❌ Hubo un error al procesar la solicitud.'
                });
            }
        }

                // ME INTERESA
        if (action === 'interested' && evt) {
            const userId = interaction.user.id;
            const subscribers = parseSubscribers(evt.subscribers);
            
            if (! subscribers.includes(userId)) {
                await prisma.event.update({
                    where: { id: eventId },
                    data: {
                        subscribers: [... subscribers, userId]
                    }
                });
            } else {
                return interaction.reply({ content: 'Ya estabas apuntado. ', ephemeral: true });
            }

            const publicChannel = client.channels.cache.get(process.env. CHANNEL_ID_ANUNCIOS || '');
            if (publicChannel && 'messages' in publicChannel && evt.publicMessageId) {
                try {
                    const msgToEdit = await publicChannel.messages.fetch(evt.publicMessageId);
                    const oldEmbed = msgToEdit.embeds[0];
                    const newEmbed = EmbedBuilder.from(oldEmbed);
                    
                    // ✅ Obtener el evento actualizado con publicImageUrl
                    const updatedEvent = await prisma.event.findUnique({ where: { id: eventId } });
                    
                    // ✅ Si hay URL pública guardada, usarla
                    if (updatedEvent?. publicImageUrl) {
                        newEmbed.setImage(updatedEvent.publicImageUrl);
                    }

                    const updatedSubscribers = parseSubscribers(updatedEvent?.subscribers);
                    const count = updatedSubscribers.length;
                    const fieldIndex = newEmbed.data.fields?. findIndex(f => f.name. includes('Interesados'));
                    if (fieldIndex !== undefined && fieldIndex !== -1 && newEmbed.data.fields) {
                        newEmbed. data.fields[fieldIndex].value = `${count} persona${count === 1 ? '' : 's'}`;
                    }
                    
                    // ✅ NO enviar archivos, solo el embed actualizado
                    await msgToEdit.edit({ embeds: [newEmbed] });
                } catch (err) { 
                    console.error('Error actualizando contador:', err); 
                }
            }
            await interaction.reply({ content: `✅ Te has apuntado a **${evt.title}**. `, ephemeral: true });
        }
    }

    if (interaction.isModalSubmit() && interaction.customId. startsWith('modalReject_')) {
        const eventIdStr = interaction.customId.split('_')[1];
        const eventId = parseInt(eventIdStr);
        const reason = interaction.fields.getTextInputValue('reason');
        
        await prisma.event.update({
            where: { id: eventId },
            data: {
                status: EventStatus.REJECTED,
                rejectionReason: reason
            }
        });

        await interaction.reply({ content: '❌ Rechazado. ', ephemeral: true });
        if (interaction.message && 'edit' in interaction.message) {
            await interaction.message.edit({ components: [] });
        }
    }
});

// --- CRON ---
setInterval(async () => {
    const now = dayjs. utc();
    const nowUnix = now.unix(); 

    if (now.format('HH: mm') === '00:00') {
        const mappingDir = 'public/uploads/mapping/';
        if (fs.existsSync(mappingDir)) {
            fs.readdir(mappingDir, (err, files) => {
                if (! err) {
                    for (const file of files) fs.unlink(path.join(mappingDir, file), () => {});
                    console.log("🧹 Mapeos limpios.");
                }
            });
        }
    }

    const eventsToNotify = await prisma.event. findMany({
        where: {
            status: EventStatus. APPROVED,
            startNotified: false
        }
    });

    for (const evt of eventsToNotify) {
        const timestamp = Math.floor(evt.eventDate.getTime() / 1000);
        const diffSeconds = timestamp - nowUnix;
        
        if (diffSeconds <= 60 && diffSeconds > -120) {
            const publicChannel = client.channels.cache.get(process.env. CHANNEL_ID_ANUNCIOS || '');
            if (publicChannel && 'send' in publicChannel) {
                const subscribers = parseSubscribers(evt. subscribers);
                const startEmbed = new EmbedBuilder()
                    .setTitle(`🔔 ¡El Evento Comienza YA!:  ${evt.title}`)
                    .setDescription(`El evento está empezando ahora mismo.\n\n**Interesados:** ${subscribers.length} personas. `)
                    .setColor(0xFF0000) 
                    .setTimestamp();

                await publicChannel.send({ 
                    content: `📢 ¡Atención! El evento comienza ahora. `, 
                    embeds: [startEmbed] 
                });

                for (const userId of subscribers) {
                    try {
                        const user = await client.users.fetch(userId);
                        await user.send(`🚀 **¡Corre! ** El evento **${evt.title}** está comenzando ahora. `);
                    } catch {
                        // User has DMs disabled or other error
                    }
                }
                
                await prisma.event.update({
                    where: { id: evt.id },
                    data: { startNotified: true }
                });
            }
        }
    }

}, 60000); 

client.login(process.env. DISCORD_TOKEN);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Bot server running on port ${PORT}`));