import { getRecentUploads, getStats } from "@/app/actions/photo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Image as ImageIcon, FolderTree, HardDrive, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const stats = await getStats();
  const recentPhotos = await getRecentUploads(6);

  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  const statCards = [
    {
      title: "Total Photos",
      value: stats.totalPhotos,
      icon: ImageIcon,
      color: "text-white",
      bg: "bg-white/10",
    },
    {
      title: "Total Categories",
      value: stats.totalCategories,
      icon: FolderTree,
      color: "text-white",
      bg: "bg-white/10",
    },
    {
      title: "Storage Used",
      value: formatBytes(stats.totalStorage),
      icon: HardDrive,
      color: "text-white",
      bg: "bg-white/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Ringkasan statistik galeri Anda.</p>
        </div>
        <Button asChild>
          <Link href="/admin/upload" className="gap-2">
            <Plus className="w-4 h-4" />
            Upload Baru
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border-white/5">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-4 rounded-xl ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-white/5">
        <CardHeader>
          <CardTitle>Upload Terbaru</CardTitle>
          <CardDescription>Foto-foto yang baru saja ditambahkan ke galeri.</CardDescription>
        </CardHeader>
        <CardContent>
          {recentPhotos.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Belum ada foto yang diupload.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {recentPhotos.map((photo) => (
                <div key={photo.id} className="group relative aspect-square rounded-xl overflow-hidden bg-secondary">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <p className="text-white text-xs font-medium truncate">{photo.title}</p>
                    <p className="text-white/70 text-[10px] truncate">{photo.category.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
