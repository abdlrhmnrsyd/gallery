"use client";

import { useState } from "react";
import { createCategory, updateCategory, deleteCategory } from "@/app/actions/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { FolderTree, Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Category = {
  id: string;
  name: string;
  _count: { photos: number };
};

export function CategoryList({ initialCategories }: { initialCategories: Category[] }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleCreate(formData: FormData) {
    setIsLoading(true);
    const res = await createCategory(formData);
    setIsLoading(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Kategori berhasil ditambahkan");
      setIsCreateOpen(false);
    }
  }

  async function handleEdit(formData: FormData) {
    if (!selectedCategory) return;
    setIsLoading(true);
    const res = await updateCategory(selectedCategory.id, formData);
    setIsLoading(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Kategori berhasil diperbarui");
      setIsEditOpen(false);
    }
  }

  async function handleDelete() {
    if (!selectedCategory) return;
    setIsLoading(true);
    const res = await deleteCategory(selectedCategory.id);
    setIsLoading(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Kategori berhasil dihapus");
      setIsDeleteOpen(false);
    }
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Tambah Kategori
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialCategories.map((cat) => (
          <Card key={cat.id} className="group overflow-hidden border-white/5 hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <FolderTree className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground">{cat._count.photos} Foto</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsEditOpen(true);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsDeleteOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {initialCategories.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">Belum ada kategori.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Tambah Kategori Baru">
        <form action={handleCreate} className="p-6 pt-0 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Kategori</Label>
            <Input id="name" name="name" placeholder="Misal: Pemandangan" required />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>Batal</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Menyimpan..." : "Simpan"}</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Kategori">
        <form action={handleEdit} className="p-6 pt-0 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nama Kategori</Label>
            <Input id="edit-name" name="name" defaultValue={selectedCategory?.name} required />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)}>Batal</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Menyimpan..." : "Simpan"}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Hapus Kategori">
        <div className="p-6 pt-0 space-y-4">
          <p className="text-muted-foreground">
            Apakah Anda yakin ingin menghapus kategori <strong>{selectedCategory?.name}</strong>? Semua foto di dalamnya juga akan terhapus. Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
