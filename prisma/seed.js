const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...');

  // 1. Crear usuario ADMIN
  // RECUERDA: Pon tu ID de Discord real aquí abajo
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
  console.log('👑 Usuario Admin creado');

  // 2. Crear Propiedades
  const propertiesData = [
    { address: "Vinewood Blvd 12", price: 500000, type: "House", posX: 200.5, posY: -100.2, posZ: 50.0, isOccupied: true, ownerName: "Michael DeSanta" },
    { address: "Grove Street 1", price: 15000, type: "House", posX: 150.0, posY: -500.0, posZ: 10.0, isOccupied: true, ownerName: "CJ" },
    { address: "Paleto Bay 45", price: 80000, type: "Business", posX: 2000.0, posY: 3000.0, posZ: 20.0, isOccupied: false, status: "PENDING" },
    { address: "Mirror Park 22", price: 250000, type: "House", posX: 500.0, posY: -200.0, posZ: 40.0, isOccupied: false, status: "APPROVED" },
  ]

  for (const prop of propertiesData) {
    await prisma.property.create({ data: prop })
  }
  console.log('🏠 Propiedades creadas');
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