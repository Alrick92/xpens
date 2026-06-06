"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function createCategoryAction(formData: FormData) {
  await requireSession();

  const name = formData.get("name") as string;
  const icon = formData.get("icon") as string | null;
  const color = formData.get("color") as string | null;

  if (!name) return { error: "Name is required" };

  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) return { error: "Category already exists" };

  await prisma.category.create({
    data: { name, icon: icon || null, color: color || null },
  });

  revalidatePath("/settings");
  revalidatePath("/expenses");
  return { success: true };
}

export async function deleteCategoryAction(categoryId: string) {
  const session = await requireSession();
  if (session.role !== "ADMIN") return { error: "Not authorized" };

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return { error: "Category not found" };
  if (category.isDefault) return { error: "Cannot delete default categories" };

  await prisma.category.delete({ where: { id: categoryId } });

  revalidatePath("/settings");
  return { success: true };
}
