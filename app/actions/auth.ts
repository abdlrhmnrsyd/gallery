"use server";

import { prisma } from "@/lib/prisma";
import { createSession, logout } from "@/lib/session";
import { compare } from "bcryptjs";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username dan password harus diisi." };
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return { error: "Username atau password salah." };
    }

    const isValid = await compare(password, admin.password);
    if (!isValid) {
      return { error: "Username atau password salah." };
    }

    await createSession(admin.id);
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Terjadi kesalahan saat login." };
  }

  redirect("/");
}

export async function logoutAction() {
  await logout();
  redirect("/login");
}
