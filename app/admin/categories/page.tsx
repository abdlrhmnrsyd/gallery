import { getCategories } from "@/app/actions/category";
import { CategoryList } from "./CategoryList";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kategori</h1>
        <p className="text-muted-foreground mt-1">Kelola kategori album foto Anda.</p>
      </div>

      <CategoryList initialCategories={categories} />
    </div>
  );
}
