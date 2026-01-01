import NextAuth, { DefaultSession, NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "@/lib/prisma";

// Definimos los tipos extra
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      discordId: string;
    } & DefaultSession["user"]
  }
}

// 1. AQUÍ ESTÁ EL CAMBIO: Exportamos la configuración por separado
export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      authorization: { params: { scope: 'identify guilds' } },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.discordId = account.providerAccountId;
      }
      return token;
    },
    async signIn({ user, account }) {
      if (!account?.providerAccountId) return false;
      const discordId = account.providerAccountId;
      
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
          role: "USER",
        },
      });
      return true;
    },
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
};

// 2. Usamos la configuración exportada
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };