import { getCategories } from "@/app/actions/category";
import { UploadForm } from "./UploadForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function UploadPage() {
  const categories = await getCategories();

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <p className="text-xl font-semibold">Belum ada kategori</p>
        <p className="text-muted-foreground">Silakan buat kategori terlebih dahulu sebelum mengupload foto.</p>
        <Button asChild>
          <Link href="/admin/categories">Pergi ke Kategori</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Foto</h1>
        <p className="text-muted-foreground mt-1">Tambahkan foto baru ke galeri Anda.</p>
      </div>

      <UploadForm categories={categories} />
    </div>
  );
}
