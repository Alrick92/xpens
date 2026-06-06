"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signToken, requireSession } from "@/lib/auth";
import type { Currency, Role } from "@prisma/client";

export async function registerAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password || !name) {
    return { error: "All fields are required" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Email already registered" };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const userCount = await prisma.user.count();
  const role: Role = userCount === 0 ? "ADMIN" : "EMPLOYEE";

  const user = await prisma.user.create({
    data: { email, name, passwordHash, role },
  });

  const token = signToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  redirect("/dashboard");
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Invalid email or password" };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password" };
  }

  const token = signToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  redirect("/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
}

export async function updateProfileAction(formData: FormData) {
  const session = await requireSession();
  const name = formData.get("name") as string;
  const defaultCurrency = formData.get("defaultCurrency") as Currency;

  if (!name) {
    return { error: "Name is required" };
  }

  await prisma.user.update({
    where: { id: session.id },
    data: { name, defaultCurrency: defaultCurrency || "USD" },
  });

  return { success: true };
}
