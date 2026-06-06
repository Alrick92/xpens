"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import type { Currency } from "@prisma/client";

export async function createProjectAction(formData: FormData) {
  await requireSession();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;
  const budget = formData.get("budget")
    ? parseFloat(formData.get("budget") as string)
    : null;
  const currency = (formData.get("currency") as Currency) || "USD";

  if (!name) return { error: "Name is required" };

  const existing = await prisma.project.findUnique({ where: { name } });
  if (existing) return { error: "Project already exists" };

  await prisma.project.create({
    data: {
      name,
      description: description || null,
      budget: budget && !isNaN(budget) ? budget : null,
      currency,
    },
  });

  revalidatePath("/projects");
  revalidatePath("/expenses");
  return { success: true };
}

export async function updateProjectAction(formData: FormData) {
  await requireSession();

  const projectId = formData.get("projectId") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;
  const budget = formData.get("budget")
    ? parseFloat(formData.get("budget") as string)
    : null;
  const isActive = formData.get("isActive") === "true";

  if (!projectId || !name) return { error: "Project ID and name are required" };

  await prisma.project.update({
    where: { id: projectId },
    data: {
      name,
      description: description || null,
      budget: budget && !isNaN(budget) ? budget : null,
      isActive,
    },
  });

  revalidatePath("/projects");
  return { success: true };
}

export async function deleteProjectAction(projectId: string) {
  const session = await requireSession();
  if (session.role !== "ADMIN") return { error: "Not authorized" };

  await prisma.project.delete({ where: { id: projectId } });

  revalidatePath("/projects");
  return { success: true };
}
