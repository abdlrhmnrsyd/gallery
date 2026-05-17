"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  return await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { photos: true },
      },
    },
  });
}

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return { error: "Nama kategori tidak boleh kosong" };

  try {
    await prisma.category.create({
      data: { name },
    });
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menambahkan kategori, nama mungkin sudah ada." };
  }
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return { error: "Nama kategori tidak boleh kosong" };

  try {
    await prisma.category.update({
      where: { id },
      data: { name },
    });
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "Gagal memperbarui kategori" };
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({
      where: { id },
    });
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus kategori" };
  }
}
