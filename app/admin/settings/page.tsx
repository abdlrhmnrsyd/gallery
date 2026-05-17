import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { toast } from "sonner";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }

  const admin = await prisma.admin.findUnique({
    where: { id: session.userId },
  });

  async function updateSettings(formData: FormData) {
    "use server";
    
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    const data: any = {};
    if (username) data.username = username;
    if (password) data.password = await hash(password, 10);

    if (Object.keys(data).length > 0) {
      await prisma.admin.update({
        where: { id: session.userId },
        data,
      });
      revalidatePath("/admin/settings");
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground mt-1">Kelola profil dan preferensi akun Anda.</p>
      </div>

      <Card className="border-white/5">
        <CardHeader>
          <CardTitle>Profil Admin</CardTitle>
          <CardDescription>Ubah username atau password Anda di sini.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateSettings} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                defaultValue={admin?.username}
                placeholder="Masukkan username baru"
                className="bg-black/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password Baru</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Kosongkan jika tidak ingin mengubah password"
                className="bg-black/20"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-white/5">
              <Button type="submit">Simpan Perubahan</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
