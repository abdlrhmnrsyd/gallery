import { getCategories } from "@/app/actions/category";
import { getPhotos } from "@/app/actions/photo";
import { getSession } from "@/lib/session";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import Link from "next/link";
import { Image as ImageIcon, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/actions/auth";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { category, search } = await searchParams;
  const categories = await getCategories();
  const photos = await getPhotos(category, search);
  const session = await getSession();
  const isAdmin = !!session; // Because it's protected, it's always true

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-black">
      {/* Minimalist Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-2">
          <Link href="/" className="font-bold text-xl tracking-tight flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
            <ImageIcon className="w-5 h-5" />
            Studio Gallery
          </Link>

          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10 hidden sm:flex">
              <Link href="/admin/dashboard">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10" title="Logout">
                <LogOut className="w-4 h-4 mr-2 hidden sm:block" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pt-32 pb-24 space-y-16">
        {/* Hero Section */}
        <div className="text-left max-w-3xl space-y-6">
          <h1 className="text-5xl md:text-6xl font-medium tracking-tight text-white leading-tight">
            Curated Collection
          </h1>
          <p className="text-lg text-gray-400 font-light max-w-xl">
            A minimalist showcase of moments, memories, and visual art.
          </p>
        </div>

        {/* Gallery Area (Grouped by Category) */}
        <div>
          <GalleryGrid 
            initialPhotos={photos} 
            categories={categories} 
            isAdmin={isAdmin} 
            currentCategory={category}
            currentSearch={search}
          />
        </div>
      </main>
    </div>
  );
}
