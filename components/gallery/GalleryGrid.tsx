"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Image as ImageIcon, Trash2, Calendar, FolderTree } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { deletePhoto } from "@/app/actions/photo";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { motion } from "framer-motion";

type Photo = {
  id: string;
  title: string;
  imageUrl: string;
  size: number;
  createdAt: Date;
  categoryId: string;
  category: { id: string; name: string };
};

type Category = {
  id: string;
  name: string;
};

export function GalleryGrid({
  initialPhotos,
  categories,
  isAdmin,
  currentCategory,
  currentSearch,
}: {
  initialPhotos: Photo[];
  categories: Category[];
  isAdmin: boolean;
  currentCategory?: string;
  currentSearch?: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch || "");
  const [selectedCategory, setSelectedCategory] = useState(currentCategory || "all");
  
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedCategory && selectedCategory !== "all") params.set("category", selectedCategory);
      
      router.push(`/?${params.toString()}`, { scroll: false });
    }, 500);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, router]);

  async function handleDelete() {
    if (!selectedPhoto) return;
    setIsDeleting(true);
    const res = await deletePhoto(selectedPhoto.id);
    setIsDeleting(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Foto berhasil dihapus");
      setIsDeleteOpen(false);
      setSelectedPhoto(null);
    }
  }

  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  const groupedPhotos = categories.map(cat => ({
    category: cat,
    photos: initialPhotos.filter(p => p.categoryId === cat.id)
  })).filter(group => group.photos.length > 0);

  return (
    <div className="space-y-12">
      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row items-center justify-between gap-4 glass-panel p-3 sm:p-4 rounded-3xl"
      >
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar pl-1">
          <Button
            variant={selectedCategory === "all" ? "default" : "ghost"}
            onClick={() => setSelectedCategory("all")}
            className={`rounded-full transition-all duration-300 ${selectedCategory === "all" ? "bg-white text-black hover:bg-gray-200 shadow-md shadow-white/20" : "text-gray-400 hover:text-white hover:bg-white/10"}`}
          >
            All Photos
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "ghost"}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full transition-all duration-300 ${selectedCategory === cat.id ? "bg-white text-black hover:bg-gray-200 shadow-md shadow-white/20" : "text-gray-400 hover:text-white hover:bg-white/10"}`}
            >
              {cat.name}
            </Button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search photos..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="pl-11 rounded-full bg-white/5 border-white/10 h-12 text-white placeholder:text-gray-500 focus-visible:ring-indigo-500 transition-all"
          />
        </div>
      </motion.div>

      {/* Grid */}
      {initialPhotos.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="text-center py-32 space-y-4"
        >
          <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ImageIcon className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-medium text-white">No photos found</h3>
          <p className="text-gray-500">Try adjusting your filters or upload some new photos.</p>
        </motion.div>
      ) : (
        <div className="space-y-20">
          {groupedPhotos.map(group => (
            <div key={group.category.id} className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h2 className="text-2xl font-medium text-white tracking-tight">
                  {group.category.name}
                </h2>
                <span className="text-sm text-gray-500">
                  {group.photos.length} {group.photos.length === 1 ? 'photo' : 'photos'}
                </span>
              </div>
              
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4"
              >
                {group.photos.map((photo) => (
                  <motion.div
                    key={photo.id}
                    variants={itemVariants}
                    className="relative break-inside-avoid rounded-2xl overflow-hidden group cursor-zoom-in bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(99,102,241,0.15)]"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <div className="relative w-full h-full overflow-hidden">
                      <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      
                      {/* Premium Glassmorphism Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-5">
                        <div className="transform translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-75">
                          <p className="text-white font-semibold text-xl tracking-wide truncate drop-shadow-lg mb-3">
                            {photo.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 text-white backdrop-blur-md rounded-full text-xs font-medium border border-white/20 shadow-xl">
                              <FolderTree className="w-3 h-3" />
                              {group.category.name}
                            </span>
                            <span className="text-xs text-gray-300 font-medium px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                              {formatBytes(photo.size)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={!!selectedPhoto && !isDeleteOpen}
        onClose={() => setSelectedPhoto(null)}
        maxWidth="5xl"
      >
        {selectedPhoto && (
          <div className="flex flex-col md:flex-row max-h-[85vh] bg-[#09090b]">
            <div className="flex-1 bg-black/80 relative min-h-[300px] md:min-h-full flex items-center justify-center overflow-hidden">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                className="max-w-full max-h-[85vh] object-contain shadow-2xl"
              />
            </div>
            <div className="w-full md:w-80 p-8 flex flex-col gap-8 bg-card border-l border-white/5">
              <div>
                <h2 className="text-3xl font-bold mb-3 text-white">{selectedPhoto.title}</h2>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                  <FolderTree className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-semibold text-indigo-300">
                    {selectedPhoto.category.name}
                  </span>
                </div>
              </div>
              
              <div className="space-y-5 flex-1">
                <div className="flex items-center gap-4 text-sm text-gray-400 bg-white/5 p-4 rounded-xl border border-white/5">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Uploaded on</p>
                    <p className="text-white font-medium">{format(new Date(selectedPhoto.createdAt), "dd MMMM yyyy", { locale: id })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400 bg-white/5 p-4 rounded-xl border border-white/5">
                  <ImageIcon className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">File size</p>
                    <p className="text-white font-medium">{formatBytes(selectedPhoto.size)}</p>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="pt-6 mt-auto">
                  <Button
                    variant="destructive"
                    className="w-full gap-2 h-12 text-base font-semibold shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)] transition-all rounded-xl"
                    onClick={() => setIsDeleteOpen(true)}
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete Masterpiece
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Masterpiece"
      >
        <div className="p-6 pt-0 space-y-6">
          <p className="text-gray-400 text-base leading-relaxed">
            Are you absolutely sure you want to permanently delete <strong>{selectedPhoto?.title}</strong>? This action cannot be undone and the file will be removed from the server.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="h-11 px-6 rounded-xl text-gray-300 hover:text-white"
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="h-11 px-6 rounded-xl font-semibold shadow-lg"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Yes, Delete It"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
