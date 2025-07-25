import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    newUser: "/",
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  trustHost: true,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnChat = nextUrl.pathname.startsWith("/");
      const isOnRegister = nextUrl.pathname.startsWith("/register");
      const isOnLogin = nextUrl.pathname.startsWith("/login");

      const isPWAAsset =
        nextUrl.pathname.startsWith("/manifest.json") ||
        nextUrl.pathname.startsWith("/icon-") || // Allow all icons
        nextUrl.pathname.startsWith("/apple-touch-icon") ||
        nextUrl.pathname.startsWith("/favicon");

      if (isPWAAsset) return true;

      if (isLoggedIn && (isOnLogin || isOnRegister)) {
        return Response.redirect(new URL("/", nextUrl as unknown as URL));
      }

      if (isOnRegister || isOnLogin) {
        return true; // Always allow access to register and login pages
      }

      if (isOnChat) {
        if (isLoggedIn) return true;
        return false;
      }

      if (isLoggedIn) {
        return Response.redirect(new URL("/", nextUrl as unknown as URL));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
