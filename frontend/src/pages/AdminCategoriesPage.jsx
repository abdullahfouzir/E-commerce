import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PencilLine, Plus, Trash2, FolderTree } from "lucide-react";
import api from "../api/api";

const initialForm = {
  name: "",
  slug: "",
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = async () => {
    try {
      const res = await api.get("/category/admin/getCategories");
      setCategories(Array.isArray(res.data?.categories) ? res.data.categories : []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Category name and slug are required.");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/category/admin/createCategory", form);
      toast.success("Category created successfully.");
      setForm(initialForm);
      await loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to create category.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/category/admin/${id}`);
      toast.success("Category deleted.");
      await loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete category.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f1eb] px-4 py-6 text-[#18212b] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[2rem] bg-[#18212b] p-6 text-white shadow-[0_24px_60px_rgba(24,33,43,0.16)]">
          <p className="mb-2 text-sm font-semibold tracking-[0.18em] text-[#f4b942] uppercase">Catalog</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Categories</h1>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={handleCreate} className="rounded-[2rem] border border-[#e9e1d9] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff0ed] text-[#e65b4d]">
                <FolderTree size={18} />
              </span>
              <h2 className="text-xl font-semibold text-[#18212b]">Create category</h2>
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#18212b]">Name</span>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Electronics"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#e65b4d] focus:bg-white focus:ring-4 focus:ring-[#e65b4d]/10"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#18212b]">Slug</span>
                <input
                  type="text"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  placeholder="electronics"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#e65b4d] focus:bg-white focus:ring-4 focus:ring-[#e65b4d]/10"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#e65b4d] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#e65b4d]/20 transition hover:bg-[#d94f42] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={16} />
              {submitting ? "Creating..." : "Add category"}
            </button>
          </form>

          <div className="rounded-[2rem] border border-[#e9e1d9] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#18212b]">Category list</h2>
              <span className="rounded-full bg-[#f4f1eb] px-3 py-1 text-xs font-semibold tracking-[0.12em] text-[#18212b] uppercase">
                {categories.length}
              </span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-200" />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                No categories yet.
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category._id} className="flex items-center justify-between rounded-2xl border border-[#e9e1d9] bg-[#fffdfb] p-4">
                    <div>
                      <p className="text-base font-semibold text-[#18212b]">{category.name}</p>
                      <p className="mt-1 text-xs text-slate-500">/{category.slug}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f1eb] text-[#18212b] transition hover:bg-[#e9e1d9]">
                        <PencilLine size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff0ed] text-[#e65b4d] transition hover:bg-[#fde8e4]"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
