import NextAuth, { DefaultSession, NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "@/lib/prisma";

// Definimos los tipos extra
declare module "next-auth" {
  interface Session {
    user:  {
      id: string;
      role: string;
      discordId: string;
    } & DefaultSession["user"]
  }
}

// Configuración de NextAuth
export const authOptions: NextAuthOptions = {
  providers:  [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      authorization:  { params: { scope: 'identify guilds' } },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.id = profile.id;
        token.discordId = profile.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.discordId) {
        const dbUser = await prisma. user.findUnique({
          where: { discordId: token.discordId as string }
        });

        if (dbUser) {
          session.user. id = dbUser.id.toString();
          session.user.role = dbUser.role;
          session.user.discordId = dbUser.discordId;
        }
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (!profile) return false;

      const existingUser = await prisma. user.findUnique({
        where: { discordId: profile.id as string }
      });

      if (!existingUser) {
        await prisma.user.create({
          data: {
            discordId: profile.id as string,
            name: profile.name || (profile as any).username,
            avatar: (profile as any).avatar,
            role: 'USER'
          }
        });
      } else {
        await prisma.user.update({
          where: { discordId: profile.id as string },
          data: { lastLogin: new Date() }
        });
      }

      return true;
    }
  },
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };