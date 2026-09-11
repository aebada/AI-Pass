import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
// import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';
import { authSessionFromUser, userFromOAuthProfile } from '@ai-pass/auth-core';
import type { AuthSession } from '@ai-pass/auth-core';

declare module 'next-auth' {
  interface Session {
    authSession?: AuthSession;
  }

  interface User {
    authSession?: AuthSession;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOGLE_CLIENT_SECRET,
    }),
    // Microsoft Entra ID (Azure AD) - enable when MICROSOFT_CLIENT_ID / MICROSOFT_CLIENT_SECRET are set.
    // MicrosoftEntraID({
    //   clientId: process.env.MICROSOFT_CLIENT_ID,
    //   clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    //   issuer: process.env.MICROSOFT_TENANT_ID
    //     ? `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/v2.0`
    //     : undefined,
    // }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7,
  },
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account?.provider === 'google' && profile) {
        const googleProfile = profile as { sub?: string; email?: string; name?: string; picture?: string };
        const oauthUser = userFromOAuthProfile({
          id: googleProfile.sub ?? token.sub ?? user?.id ?? '',
          email: googleProfile.email ?? token.email ?? '',
          name: googleProfile.name,
          image: googleProfile.picture,
          provider: 'google',
        });
        token.authSession = authSessionFromUser(oauthUser);
      }
      return token;
    },
    async session({ session, token }) {
      const authSession = token.authSession as AuthSession | undefined;
      if (authSession) {
        session.authSession = authSession;
        session.user = {
          ...session.user,
          id: authSession.userId,
          email: authSession.email,
          name: authSession.name ?? session.user.name,
          image: authSession.image ?? session.user.image,
        };
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/workspace`;
    },
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
});
