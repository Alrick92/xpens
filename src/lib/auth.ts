import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "./db";
import type { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "xpens-dev-secret-change-in-production";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export function signToken(user: SessionUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getActiveSession(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user || !user.isActive) return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) {
    throw new Error("User not found");
  }
  if (!user.isActive) {
    throw new Error("Account disabled");
  }
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
