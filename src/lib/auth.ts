import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      plan?: string;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!isSupabaseConfigured) return null;
        if (!credentials?.email || !credentials?.password) return null;

        const { data: user } = await getSupabaseAdmin()
          .from("users")
          .select("*")
          .eq("email", credentials.email as string)
          .single();

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub || "";
        session.user.plan = token.plan as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        if (!isSupabaseConfigured) {
          token.plan = "free";
          return token;
        }
        const { data } = await getSupabaseAdmin()
          .from("users")
          .select("subscription_status")
          .eq("id", user.id)
          .single();
        token.plan = data?.subscription_status || "free";
      }
      return token;
    },
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true;

      if (account?.provider === "google" || account?.provider === "github") {
        if (!isSupabaseConfigured) return true;

        const { data: existing } = await getSupabaseAdmin()
          .from("users")
          .select("id")
          .eq("email", user.email!)
          .single();

        if (!existing) {
          await getSupabaseAdmin().from("users").insert({
            email: user.email,
            name: user.name,
            image: user.image,
            subscription_status: "free",
          });
        }
      }
      return true;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
});