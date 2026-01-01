import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // 1. Crear o actualizar tu usuario como ADMIN
  // CAMBIA 'TU_ID_DE_DISCORD_REAL' por tu ID numérico de Discord (activa modo desarrollador en discord para copiarlo)
  const myDiscordId = "351278352704995329"; 
  
  await prisma.user.upsert({
    where: { discordId: myDiscordId },
    update: { role: 'ADMIN' },
    create: {
      discordId: myDiscordId,
      name: "Desarrollador",
      role: 'ADMIN',
    },
  })

  console.log('👑 Usuario Admin creado/actualizado');

  // 2. Crear Propiedades de prueba
  const propertiesData = [
    { address: "Vinewood Blvd 12", price: 500000, type: "House", posX: 200.5, posY: -100.2, posZ: 50.0, isOccupied: true, ownerName: "Michael DeSanta" },
    { address: "Grove Street 1", price: 15000, type: "House", posX: 150.0, posY: -500.0, posZ: 10.0, isOccupied: true, ownerName: "CJ" },
    { address: "Paleto Bay 45", price: 80000, type: "Business", posX: 2000.0, posY: 3000.0, posZ: 20.0, isOccupied: false, status: "PENDING" },
    { address: "Mirror Park 22", price: 250000, type: "House", posX: 500.0, posY: -200.0, posZ: 40.0, isOccupied: false, status: "APPROVED" },
    { address: "Legion Square Garage", price: 50000, type: "Garage", posX: 0.0, posY: 0.0, posZ: 10.0, isOccupied: false, status: "REJECTED" },
  ]

  for (const prop of propertiesData) {
    await prisma.property.create({ data: prop })
  }

  console.log('🏠 5 Propiedades de prueba creadas');
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })