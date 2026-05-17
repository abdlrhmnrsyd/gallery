"use client";

import { useState, useRef, useCallback } from "react";
import { createPhoto } from "@/app/actions/photo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, X, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Category = {
  id: string;
  name: string;
};

export function UploadForm({ categories }: { categories: Category[] }) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => file.type.startsWith("image/"));
    if (validFiles.length !== newFiles.length) {
      toast.error("Beberapa file diabaikan karena bukan format gambar");
    }
    
    setFiles(prev => [...prev, ...validFiles]);
    const urls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...urls]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    if (inputRef.current) inputRef.current.value = "";
  };

  const clearAll = () => {
    setFiles([]);
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    if (inputRef.current) inputRef.current.value = "";
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error("Silakan pilih minimal satu foto terlebih dahulu");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const rawTitle = formData.get("title");
    const baseTitle = (typeof rawTitle === "string" ? rawTitle : "");
    const categoryId = formData.get("categoryId") as string;

    if (!categoryId) {
      toast.error("Mohon pilih kategori");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let successCount = 0;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        let photoTitle = baseTitle.trim();
        if (photoTitle) {
           photoTitle = files.length > 1 ? `${photoTitle} ${i + 1}` : photoTitle;
        } else {
           photoTitle = file.name.replace(/\.[^/.]+$/, "");
        }

        const uploadData = new FormData();
        uploadData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        if (!res.ok) throw new Error(`Gagal mengupload file: ${file.name}`);
        
        const { url, size } = await res.json();

        const saveRes = await createPhoto({
          title: photoTitle,
          categoryId,
          imageUrl: url,
          size,
        });

        if (saveRes.error) {
          throw new Error(saveRes.error);
        }
        
        successCount++;
        setUploadProgress(Math.round((successCount / files.length) * 100));
      }

      toast.success(`${successCount} foto berhasil diupload!`);
      clearAll();
      e.currentTarget.reset();
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan saat upload");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="border-white/5 bg-card/30">
      <CardContent className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div 
            className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center text-center transition-all ${
              dragActive ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50 bg-black/20"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleChange}
              className="hidden"
            />
            
            {files.length > 0 ? (
              <div className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-400">{files.length} foto dipilih</p>
                  <Button type="button" variant="ghost" size="sm" onClick={(e) => { e.preventDefault(); clearAll(); }} className="text-red-400 hover:text-red-300">
                    Hapus Semua
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden group bg-black/40 border border-white/5">
                      <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 rounded-full h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        onClick={(e) => {
                          e.preventDefault();
                          removeFile(index);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-xs truncate text-gray-300">
                        {files[index].name}
                      </div>
                    </div>
                  ))}
                  <div 
                    onClick={() => inputRef.current?.click()}
                    className="aspect-square rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <UploadCloud className="w-6 h-6 text-gray-400 mb-2" />
                    <span className="text-xs text-gray-400">Tambah Foto</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4" onClick={() => inputRef.current?.click()}>
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto cursor-pointer group hover:bg-white/10 transition-colors border border-white/10">
                  <UploadCloud className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <p className="text-lg font-medium cursor-pointer text-white">Klik atau drag & drop gambar ke sini</p>
                  <p className="text-sm text-gray-500 mt-1">Bisa pilih banyak foto sekaligus (Multiple Upload)</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-300">Judul Foto (Opsional)</Label>
              <Input id="title" name="title" placeholder="Kosongkan untuk pakai nama file asli" className="bg-black/20 border-white/10 text-white placeholder:text-gray-600" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="categoryId" className="text-gray-300">Kategori</Label>
              <select
                id="categoryId"
                name="categoryId"
                required
                className="flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
              >
                <option value="" className="bg-black text-gray-400">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-black text-white">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-8">
            <div className="text-sm text-gray-400 font-medium">
              {isUploading && uploadProgress > 0 && `Mengupload... ${uploadProgress}%`}
            </div>
            <Button type="submit" disabled={isUploading || files.length === 0} className="min-w-32 bg-white text-black hover:bg-gray-200">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Upload Semua Foto"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
