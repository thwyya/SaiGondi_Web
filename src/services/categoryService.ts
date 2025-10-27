import api from "./api";
import { Category } from "@/types/category";

export async function getCategories(): Promise<Category[]> {
  const res = await api.get('/admin/categories');
  return res.data.data.map((category: any) => ({ ...category, id: category._id }));
}

export async function createCategory(category: { name: string; description: string; type: string }): Promise<Category> {
    const res = await api.post('/admin/categories', category);
    const newCategory = res.data.data;
    return { ...newCategory, id: newCategory._id };
}

export async function updateCategory({ id, category }: { id: string; category: { name: string; description: string; type: string } }): Promise<Category> {
    const res = await api.patch(`/admin/categories/${id}`, category);
    const updatedCategory = res.data.data;
    return { ...updatedCategory, id: updatedCategory._id };
}

export async function deleteCategory(id: string): Promise<void> {
    await api.delete(`/admin/categories/${id}`);
}

export async function getCategoryById(id: string): Promise<Category> {
    const res = await api.get(`/admin/categories/${id}`);
    const fetchedCategory = res.data.data;
    return { ...fetchedCategory, id: fetchedCategory._id };
}