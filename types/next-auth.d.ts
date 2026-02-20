import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
      membershipTier: string;
      lastActivity?: number;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: string;
    membershipTier: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    membershipTier: string;
    lastActivity?: number;
  }
}
