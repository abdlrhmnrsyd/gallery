"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPhoto(data: { title: string; imageUrl: string; size: number; categoryId: string }) {
  try {
    await prisma.photo.create({
      data,
    });
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/upload");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Create photo error:", error);
    return { error: "Gagal menyimpan data foto ke database" };
  }
}

export async function getPhotos(categoryId?: string, search?: string) {
  return await prisma.photo.findMany({
    where: {
      ...(categoryId && categoryId !== "all" ? { categoryId } : {}),
      ...(search ? { title: { contains: search } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });
}

export async function deletePhoto(id: string) {
  try {
    await prisma.photo.delete({
      where: { id },
    });
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus foto" };
  }
}

export async function getStats() {
  const [totalPhotos, totalCategories, photos] = await Promise.all([
    prisma.photo.count(),
    prisma.category.count(),
    prisma.photo.findMany({ select: { size: true } }),
  ]);

  const totalStorage = photos.reduce((acc, photo) => acc + photo.size, 0);

  return {
    totalPhotos,
    totalCategories,
    totalStorage, // in bytes
  };
}

export async function getRecentUploads(limit = 5) {
  return await prisma.photo.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });
}
