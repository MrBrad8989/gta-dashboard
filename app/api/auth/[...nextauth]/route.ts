import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

const handler = NextAuth({
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      // Opcional: Solicitar acceso a gremios para ver si es staff
      authorization: { params: { scope: 'identify guilds' } }, 
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Aquí podremos inyectar datos extra (como ID de usuario o Rango) más adelante
      return session;
    },
  },
});

export { handler as GET, handler as POST };