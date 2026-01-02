import * as dotenv from 'dotenv';
dotenv.config();

import * as express from 'express';
import { Request, Response } from 'express';
import { 
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
    PermissionFlagsBits,
    Interaction,
    TextChannel
} from 'discord.js';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// EventStatus enum from Prisma
enum EventStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

// --- CONFIGURACIÓN HORARIA ---
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es'); 

// --- CONFIGURACIÓN DISCORD ---
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages]
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
        cb(null, `temp_${Date.now()}_${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`)
    }
});
const upload = multer({ storage: storage });

const app = express();
app.use(express.json());
app.use(express.static('public'));

// --- API: POST ---
app.post('/api/evento', upload.fields([
    { name: 'flyer', maxCount: 1 }, 
    { name: 'mappingFiles', maxCount: 10 }
]), async (req: Request, res: Response) => {
    
    const data = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } || {};

    const dateObj = dayjs.utc(data.date);
    const minutes = dateObj.minute();
    if (minutes !== 0 && minutes !== 30) {
        if(files['flyer']) fs.unlinkSync(files['flyer'][0].path);
        if(files['mappingFiles']) files['mappingFiles'].forEach(f => fs.unlinkSync(f.path));
        return res.status(400).json({ error: "La hora debe ser en punto (:00) o y media (:30)." });
    }

    // Check if date is taken using Prisma
    const isTaken = await prisma.event.findFirst({
        where: {
            eventDate: dateObj.toDate(),
            status: { not: EventStatus.REJECTED }
        }
    });
    
    if (isTaken) {
        if(files['flyer']) fs.unlinkSync(files['flyer'][0].path);
        if(files['mappingFiles']) files['mappingFiles'].forEach(f => fs.unlinkSync(f.path));
        return res.status(400).json({ error: "Fecha ocupada." });
    }

    const needsCars = data.needsCars === 'true';
    const needsRadio = data.needsRadio === 'true';
    const needsMapping = data.needsMapping === 'true';
    const requiresSupport = needsCars || needsRadio || needsMapping;

    const finalMappingPaths: string[] = [];
    if (files['mappingFiles']) {
        files['mappingFiles'].forEach((file) => {
            // We'll update the filename after creating the event
            finalMappingPaths.push(file.path);
        });
    }

    const flyerPath = files['flyer'] ? files['flyer'][0].path : null;

    // Create event in Prisma
    const newEvent = await prisma.event.create({
        data: {
            title: data.title,
            description: data.description,
            eventDate: dateObj.toDate(),
            flyerUrl: flyerPath || '',
            needsCars,
            carsDesc: needsCars ? data.carsDesc : null,
            needsRadio,
            needsMapping,
            mappingDesc: needsMapping ? data.mappingDesc : null,
            mappingFiles: null, // Will update after renaming
            status: EventStatus.PENDING,
            creatorId: parseInt(data.userId),
            subscribers: [],
            publicMessageId: null,
            startNotified: false,
            ticketChannelId: null
        }
    });

    // Rename mapping files with event ID
    const finalMappingPathsRenamed: string[] = [];
    if (files['mappingFiles']) {
        files['mappingFiles'].forEach((file, index) => {
            const ext = path.extname(file.originalname);
            const newFilename = `${newEvent.id}-${index + 1}${ext}`;
            const newPath = path.join('public/uploads/mapping/', newFilename);
            try {
                fs.renameSync(file.path, newPath);
                finalMappingPathsRenamed.push(newPath);
            } catch (err) { console.error(err); }
        });
        
        // Update event with mapping files
        await prisma.event.update({
            where: { id: newEvent.id },
            data: { mappingFiles: finalMappingPathsRenamed.join(',') }
        });
    } 

    // --- ENVIAR A DISCORD (ADMIN) ---
    const adminChannel = client.channels.cache.get(process.env.CHANNEL_ID_SOLICITUDES || '') as TextChannel | undefined;
    if (adminChannel) {
        const embed = new EmbedBuilder()
            .setTitle(requiresSupport ? '🚨 SOLICITUD CON SOPORTE TÉCNICO' : '📢 Nueva Solicitud Estándar')
            .setColor(requiresSupport ? 0xFF0000 : 0xFFA500)
            .addFields(
                { name: '👤 Usuario', value: `<@${data.userId}>`, inline: true },
                { name: '📅 Fecha (UTC)', value: dateObj.format('DD/MM/YYYY HH:mm'), inline: true },
                { name: '📝 Título', value: data.title, inline: false },
                { name: '📄 Descripción del Evento', value: data.description, inline: false }
            );

        if (requiresSupport) {
            embed.addFields({ name: '---------------------------------', value: '**🛠️ DETALLES DEL SOPORTE SOLICITADO**' });
            if (needsCars) embed.addFields({ name: '🚗 Vehículos Solicitados', value: `\`\`\`${data.carsDesc}\`\`\``, inline: false });
            if (needsMapping) embed.addFields({ name: '🏗️ Mapeo Solicitado', value: `\`\`\`${data.mappingDesc}\`\`\``, inline: false });
            if (needsRadio) embed.addFields({ name: '📻 Emisora', value: '✅ Requiere configuración de Emisora.', inline: false });
        } else {
            embed.addFields({ name: '✅ Estado del Soporte', value: 'No requiere soporte técnico.' });
        }

        const attachments = [];
        if (newEvent.flyerUrl) {
            attachments.push({ attachment: newEvent.flyerUrl, name: 'flyer.png' });
            embed.setImage('attachment://flyer.png');
        }

        const mappingFilesArray = newEvent.mappingFiles ? newEvent.mappingFiles.split(',').filter((f: string) => f) : [];
        if (mappingFilesArray.length > 0) {
            mappingFilesArray.forEach((p: string, i: number) => {
                attachments.push({ attachment: p, name: `mapeo-${i+1}.png` });
            });
            embed.addFields({ name: '📂 Archivos de Mapeo', value: `Se han adjuntado ${mappingFilesArray.length} imágenes de referencia.` });
        }

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId(`accept_${newEvent.id}`).setLabel('Aceptar').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`reject_${newEvent.id}`).setLabel('Rechazar').setStyle(ButtonStyle.Danger)
        );

        await adminChannel.send({ embeds: [embed], files: attachments, components: [row] });
    }
    
    res.json({ success: true });
});

// --- INTERACCIONES DISCORD ---
client.on('interactionCreate', async (interaction: Interaction) => {
    
    // --- LÓGICA BOTÓN CERRAR TICKET ---
    if (interaction.isButton() && interaction.customId === 'close_ticket') {
        await interaction.reply({ content: '🗑️ Cerrando ticket y eliminando canal en 5 segundos...', ephemeral: false });
        setTimeout(() => {
            if (interaction.channel?.type === ChannelType.GuildText) {
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
        const evt = await prisma.event.findUnique({ where: { id: eventId } });
        
        if (!evt && action !== 'close') {
            return interaction.reply({ content: '❌ Evento no encontrado o expirado.', ephemeral: true });
        }

        // RECHAZAR
        if (action === 'reject' && evt) {
            const modal = new ModalBuilder().setCustomId(`modalReject_${eventId}`).setTitle('Motivo del Rechazo');
            const reasonInput = new TextInputBuilder().setCustomId('reason').setLabel("Motivo").setStyle(TextInputStyle.Paragraph);
            modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput));
            await interaction.showModal(modal);
        }

        // ACEPTAR
        if (action === 'accept' && evt) {
            // Update event status to APPROVED
            await prisma.event.update({
                where: { id: eventId },
                data: { status: EventStatus.APPROVED }
            });

            // 1. PUBLICAR EN ANUNCIOS
            const publicChannel = client.channels.cache.get(process.env.CHANNEL_ID_ANUNCIOS || '') as TextChannel | undefined;
            if (publicChannel) {
                const timestamp = Math.floor(evt.eventDate.getTime() / 1000);
                const publicEmbed = new EmbedBuilder()
                    .setTitle(`📅 Nuevo Evento: ${evt.title}`)
                    .setDescription(evt.description)
                    .setColor(0x5865F2) 
                    .addFields(
                        { name: '🕒 Fecha y Hora', value: `<t:${timestamp}:F>\n(<t:${timestamp}:R>)`, inline: false },
                        { name: '👥 Interesados', value: '0 personas', inline: false }
                    )
                    .setFooter({ text: `Evento solicitado al Equipo de Eventos del PM.` });

                const filesToSend = [];
                if (evt.flyerUrl) {
                    filesToSend.push({ attachment: evt.flyerUrl, name: 'flyer.png' });
                    publicEmbed.setImage('attachment://flyer.png'); 
                }

                const interestBtn = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder().setCustomId(`interested_${evt.id}`).setLabel('Me interesa').setEmoji('⭐').setStyle(ButtonStyle.Primary)
                );

                const sentMsg = await publicChannel.send({ embeds: [publicEmbed], files: filesToSend, components: [interestBtn] });
                
                // Update event with publicMessageId
                await prisma.event.update({
                    where: { id: eventId },
                    data: { publicMessageId: sentMsg.id }
                });
            }

            // 2. CREAR TICKET SI ES NECESARIO
            const requiresSupport = evt.needsCars || evt.needsRadio || evt.needsMapping;
            let ticketMention = "No requiere ticket.";

            if (requiresSupport && process.env.CATEGORY_ID_TICKETS) {
                const guild = interaction.guild;
                if (guild) {
                    try {
                        // Crear canal ticket-evento-ID
                        const ticketChannel = await guild.channels.create({
                            name: `ticket-evento-${eventId}`,
                            type: ChannelType.GuildText,
                            parent: process.env.CATEGORY_ID_TICKETS,
                            permissionOverwrites: [
                                {
                                    id: guild.id,
                                    deny: [PermissionFlagsBits.ViewChannel],
                                },
                                {
                                    id: evt.creatorId.toString(),
                                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles],
                                },
                                {
                                    id: interaction.user.id,
                                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                                },
                                {
                                    id: client.user!.id,
                                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels],
                                }
                            ],
                        });
                        
                        ticketMention = ticketChannel.toString();

                        // Update event with ticketChannelId
                        await prisma.event.update({
                            where: { id: eventId },
                            data: { ticketChannelId: ticketChannel.id }
                        });

                        // Crear botón de Cerrar Ticket
                        const closeBtnRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                            new ButtonBuilder()
                                .setCustomId('close_ticket')
                                .setLabel('Cerrar Ticket')
                                .setStyle(ButtonStyle.Danger)
                                .setEmoji('🗑️')
                        );

                        // Reconstruir embed básico para contexto en el ticket
                        const contextEmbed = new EmbedBuilder()
                             .setTitle(`Soporte para: ${evt.title}`)
                             .setDescription(`Canal creado para coordinar: \n${evt.needsCars ? '• Coches\n' : ''}${evt.needsMapping ? '• Mapeo\n' : ''}${evt.needsRadio ? '• Radio' : ''}`)
                             .setColor(0xFFA500);

                        // Enviar mensaje de bienvenida en el nuevo canal con el botón
                        await ticketChannel.send({
                            content: `👋 Hola <@${evt.creatorId}>,\n\nEste es tu canal privado de soporte. Un administrador te atenderá pronto.\nCuando finalice el soporte, pulsa el botón para borrar el chat.`,
                            embeds: [contextEmbed],
                            components: [closeBtnRow]
                        });

                    } catch (error) {
                        console.error("Error creando canal de ticket:", error);
                        ticketMention = "Error al crear ticket.";
                    }
                }
            }

            await interaction.reply({ content: `✅ Evento publicado en anuncios.\n🎫 Estado Ticket: ${ticketMention}`, ephemeral: true });
            
            // Editar mensaje original para quitar botones
            await interaction.message.edit({ components: [] }); 
        }

        // ME INTERESA
        if (action === 'interested' && evt) {
            const userId = interaction.user.id;
            // Handle subscribers as JSON/array
            const subscribers = Array.isArray(evt.subscribers) ? evt.subscribers : [];
            
            if (!subscribers.includes(userId)) {
                // Update event with new subscriber
                await prisma.event.update({
                    where: { id: eventId },
                    data: {
                        subscribers: [...subscribers, userId]
                    }
                });
            } else {
                 return interaction.reply({ content: 'Ya estabas apuntado.', ephemeral: true });
            }

            const publicChannel = client.channels.cache.get(process.env.CHANNEL_ID_ANUNCIOS || '') as TextChannel | undefined;
            if (publicChannel && evt.publicMessageId) {
                try {
                    const msgToEdit = await publicChannel.messages.fetch(evt.publicMessageId);
                    const oldEmbed = msgToEdit.embeds[0];
                    const newEmbed = EmbedBuilder.from(oldEmbed);
                    
                    if (evt.flyerUrl) newEmbed.setImage('attachment://flyer.png');

                    // Get updated subscriber count
                    const updatedEvent = await prisma.event.findUnique({ where: { id: eventId } });
                    const updatedSubscribers = Array.isArray(updatedEvent?.subscribers) ? updatedEvent.subscribers : [];
                    const count = updatedSubscribers.length;
                    const fieldIndex = newEmbed.data.fields?.findIndex(f => f.name.includes('Interesados'));
                    if (fieldIndex !== undefined && fieldIndex !== -1 && newEmbed.data.fields) {
                        newEmbed.data.fields[fieldIndex].value = `${count} persona${count === 1 ? '' : 's'}`;
                    }
                    
                    await msgToEdit.edit({ embeds: [newEmbed] });
                } catch (err) { console.error(err); }
            }
            await interaction.reply({ content: `✅ Te has apuntado a **${evt.title}**.`, ephemeral: true });
        }
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('modalReject_')) {
        const eventIdStr = interaction.customId.split('_')[1];
        const eventId = parseInt(eventIdStr);
        const reason = interaction.fields.getTextInputValue('reason');
        
        // Update event status to REJECTED with reason
        await prisma.event.update({
            where: { id: eventId },
            data: {
                status: EventStatus.REJECTED,
                rejectionReason: reason
            }
        });

        await interaction.reply({ content: '❌ Rechazado.', ephemeral: true });
        await interaction.message?.edit({ components: [] });
    }
});

// --- CRON ---
setInterval(async () => {
    const now = dayjs.utc();
    const nowUnix = now.unix(); 

    // Cleanup mapping files at midnight
    if (now.format('HH:mm') === '00:00') {
        const mappingDir = 'public/uploads/mapping/';
        if (fs.existsSync(mappingDir)) {
            fs.readdir(mappingDir, (err, files) => {
                if (!err) {
                    for (const file of files) fs.unlink(path.join(mappingDir, file), () => {});
                    console.log("🧹 Mapeos limpios.");
                }
            });
        }
    }

    // Get events that need notification
    const eventsToNotify = await prisma.event.findMany({
        where: {
            status: EventStatus.APPROVED,
            startNotified: false
        }
    });

    for (const evt of eventsToNotify) {
        const timestamp = Math.floor(evt.eventDate.getTime() / 1000);
        const diffSeconds = timestamp - nowUnix;
        
        // Notify if event starts within 60 seconds (but not more than 2 minutes ago)
        if (diffSeconds <= 60 && diffSeconds > -120) {
            const publicChannel = client.channels.cache.get(process.env.CHANNEL_ID_ANUNCIOS || '') as TextChannel | undefined;
            if (publicChannel) {
                const subscribers = Array.isArray(evt.subscribers) ? evt.subscribers : [];
                const startEmbed = new EmbedBuilder()
                    .setTitle(`🔔 ¡El Evento Comienza YA!: ${evt.title}`)
                    .setDescription(`El evento está empezando ahora mismo.\n\n**Interesados:** ${subscribers.length} personas.`)
                    .setColor(0xFF0000) 
                    .setTimestamp();

                await publicChannel.send({ 
                    content: `📢 ¡Atención! El evento de <@${evt.creatorId}> comienza ahora.`, 
                    embeds: [startEmbed] 
                });

                // Send DMs to subscribers
                for (const userId of subscribers) {
                    try {
                        const user = await client.users.fetch(userId);
                        await user.send(`🚀 **¡Corre!** El evento **${evt.title}** está comenzando ahora.`);
                    } catch {
                        // User has DMs disabled or other error
                    }
                }
                
                // Mark as notified
                await prisma.event.update({
                    where: { id: evt.id },
                    data: { startNotified: true }
                });
            }
        }
    }

}, 60000); 

client.login(process.env.DISCORD_TOKEN);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Bot server running on port ${PORT}`));