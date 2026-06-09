"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function updateParseFlowConfigAction(apiKey: string, apiUrl: string) {
  const session = await requireSession();
  if (session.role !== "ADMIN") {
    return { error: "Admin access required" };
  }

  if (apiKey) {
    await prisma.appSetting.upsert({
      where: { key: "parseflow_api_key" },
      update: { value: apiKey },
      create: { key: "parseflow_api_key", value: apiKey },
    });
  } else {
    await prisma.appSetting.deleteMany({
      where: { key: "parseflow_api_key" },
    });
  }

  if (apiUrl) {
    await prisma.appSetting.upsert({
      where: { key: "parseflow_api_url" },
      update: { value: apiUrl },
      create: { key: "parseflow_api_url", value: apiUrl },
    });
  } else {
    await prisma.appSetting.deleteMany({
      where: { key: "parseflow_api_url" },
    });
  }

  revalidatePath("/settings");
  return { success: true };
}
