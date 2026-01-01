import NextAuth, { DefaultSession } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "@/lib/prisma";

// Definimos los tipos extra para que no se queje
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      discordId: string;
    } & DefaultSession["user"]
  }
}

const handler = NextAuth({
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      authorization: { params: { scope: 'identify guilds' } },
    }),
  ],
  callbacks: {
    // 1. Cuando entras (Login), guardamos tu ID de Discord en el token interno
    async jwt({ token, account }) {
      if (account) {
        token.discordId = account.providerAccountId;
      }
      return token;
    },

    // 2. Cuando entras (Login), actualizamos la DB
    async signIn({ user, account }) {
      if (!account?.providerAccountId) return false;

      const discordId = account.providerAccountId;
      
      // Upsert: Si existe actualiza, si no existe lo crea
      await prisma.user.upsert({
        where: { discordId: discordId },
        update: {
          name: user.name,
          avatar: user.image,
          lastLogin: new Date(),
        },
        create: {
          discordId: discordId,
          name: user.name,
          avatar: user.image,
          role: "USER", // Por defecto
        },
      });
      return true;
    },

    // 3. Cuando navegas (Session), leemos el Rol usando el ID de Discord (INFALIBLE)
    async session({ session, token }) {
      if (token.discordId) {
         const dbUser = await prisma.user.findUnique({
           where: { discordId: token.discordId as string }
         });

         if (dbUser) {
           session.user.role = dbUser.role;
           session.user.id = dbUser.id.toString();
           session.user.discordId = dbUser.discordId;
         }
      }
      return session;
    }
  },
});

export { handler as GET, handler as POST };