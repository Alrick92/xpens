"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import type { Currency, ExpenseStatus } from "@prisma/client";

export async function createExpenseAction(formData: FormData) {
  const session = await requireSession();

  const description = formData.get("description") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const currency = (formData.get("currency") as Currency) || "USD";
  const date = formData.get("date") as string;
  const merchant = formData.get("merchant") as string | null;
  const categoryId = formData.get("categoryId") as string | null;
  const projectId = formData.get("projectId") as string | null;
  const notes = formData.get("notes") as string | null;
  const receiptUrl = formData.get("receiptUrl") as string | null;
  const receiptFilename = formData.get("receiptFilename") as string | null;
  const parseConfidence = formData.get("parseConfidence")
    ? parseFloat(formData.get("parseConfidence") as string)
    : null;
  const parseRawData = formData.get("parseRawData")
    ? JSON.parse(formData.get("parseRawData") as string)
    : null;
  const lineItemsJson = formData.get("lineItems") as string | null;

  if (!description || isNaN(amount) || !date) {
    return { error: "Description, amount, and date are required" };
  }

  const lineItems = lineItemsJson ? JSON.parse(lineItemsJson) : [];

  const expense = await prisma.expense.create({
    data: {
      description,
      amount,
      currency,
      date: new Date(date),
      merchant: merchant || null,
      categoryId: categoryId || null,
      projectId: projectId || null,
      notes: notes || null,
      receiptUrl: receiptUrl || null,
      receiptFilename: receiptFilename || null,
      parseConfidence,
      parseRawData,
      userId: session.id,
      status: "DRAFT",
      lineItems: {
        create: lineItems.map(
          (item: {
            description: string;
            quantity?: number;
            unitPrice?: number;
            amount: number;
          }) => ({
            description: item.description,
            quantity: item.quantity || null,
            unitPrice: item.unitPrice || null,
            amount: item.amount,
          })
        ),
      },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  return { success: true, expenseId: expense.id };
}

export async function updateExpenseAction(formData: FormData) {
  const session = await requireSession();
  const expenseId = formData.get("expenseId") as string;

  const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!expense) return { error: "Expense not found" };
  if (expense.userId !== session.id && session.role === "EMPLOYEE") {
    return { error: "Not authorized" };
  }

  const description = formData.get("description") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const currency = (formData.get("currency") as Currency) || expense.currency;
  const date = formData.get("date") as string;
  const merchant = formData.get("merchant") as string | null;
  const categoryId = formData.get("categoryId") as string | null;
  const projectId = formData.get("projectId") as string | null;
  const notes = formData.get("notes") as string | null;

  await prisma.expense.update({
    where: { id: expenseId },
    data: {
      description: description || expense.description,
      amount: isNaN(amount) ? expense.amount : amount,
      currency,
      date: date ? new Date(date) : expense.date,
      merchant: merchant || null,
      categoryId: categoryId || null,
      projectId: projectId || null,
      notes: notes || null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  return { success: true };
}

export async function deleteExpenseAction(expenseId: string) {
  const session = await requireSession();

  const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!expense) return { error: "Expense not found" };
  if (expense.userId !== session.id && session.role === "EMPLOYEE") {
    return { error: "Not authorized" };
  }

  await prisma.expense.delete({ where: { id: expenseId } });

  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  return { success: true };
}

export async function submitExpenseAction(expenseId: string) {
  const session = await requireSession();

  const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!expense) return { error: "Expense not found" };
  if (expense.userId !== session.id) return { error: "Not authorized" };
  if (expense.status !== "DRAFT") return { error: "Only draft expenses can be submitted" };

  await prisma.expense.update({
    where: { id: expenseId },
    data: { status: "SUBMITTED" },
  });

  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  return { success: true };
}

export async function approveExpenseAction(
  expenseId: string,
  status: "APPROVED" | "REJECTED"
) {
  const session = await requireSession();

  if (session.role !== "ADMIN" && session.role !== "MANAGER") {
    return { error: "Not authorized to approve expenses" };
  }

  const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!expense) return { error: "Expense not found" };
  if (expense.status !== "SUBMITTED") {
    return { error: "Only submitted expenses can be approved/rejected" };
  }

  await prisma.expense.update({
    where: { id: expenseId },
    data: {
      status,
      approvedById: session.id,
      approvedAt: new Date(),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  revalidatePath("/approvals");
  return { success: true };
}

export async function reimburseExpenseAction(expenseId: string) {
  const session = await requireSession();

  if (session.role !== "ADMIN" && session.role !== "MANAGER") {
    return { error: "Not authorized" };
  }

  const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!expense) return { error: "Expense not found" };
  if (expense.status !== "APPROVED") {
    return { error: "Only approved expenses can be reimbursed" };
  }

  await prisma.expense.update({
    where: { id: expenseId },
    data: { status: "REIMBURSED" as ExpenseStatus },
  });

  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  revalidatePath("/approvals");
  return { success: true };
}
