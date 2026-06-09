"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import type { Role } from "@prisma/client";

async function requireAdmin() {
  const session = await requireSession();
  if (session.role !== "ADMIN") {
    throw new Error("Admin access required");
  }
  return session;
}

export async function toggleUserActiveAction(userId: string) {
  const session = await requireAdmin();

  if (userId === session.id) {
    return { error: "Cannot disable your own account" };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "User not found" };

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
  });

  revalidatePath("/settings");
  return { success: true, isActive: !user.isActive };
}

export async function resetUserPasswordAction(
  userId: string,
  newPassword: string
) {
  await requireAdmin();

  if (!newPassword || newPassword.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "User not found" };

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function changeUserRoleAction(userId: string, role: Role) {
  const session = await requireAdmin();

  if (userId === session.id) {
    return { error: "Cannot change your own role" };
  }

  const validRoles: Role[] = ["ADMIN", "MANAGER", "EMPLOYEE", "ACCOUNTANT"];
  if (!validRoles.includes(role)) {
    return { error: "Invalid role" };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "User not found" };

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/settings");
  return { success: true };
}
