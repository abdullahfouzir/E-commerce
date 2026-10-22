import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ImagePlus, PackagePlus, Trash2, Boxes } from "lucide-react";
import api from "../api/api";

const initialForm = {
  name: "",
  description: "",
  price: "",
  slug: "",
  category: "",
  stock: "",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadProducts = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get("/product/admin/getProducts"),
        api.get("/category/admin/getCategories"),
      ]);

      setProducts(Array.isArray(productsRes.data?.products) ? productsRes.data.products : []);
      setCategories(Array.isArray(categoriesRes.data?.categories) ? categoriesRes.data.categories : []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!image) {
      toast.error("Please select a product image.");
      return;
    }

    const productData = new FormData();
    productData.append("name", form.name);
    productData.append("description", form.description);
    productData.append("price", form.price);
    productData.append("slug", form.slug);
    productData.append("category", form.category);
    productData.append("stock", form.stock || "0");
    productData.append("images", image);

    try {
      setSubmitting(true);
      await api.post("/product/admin/createProduct", productData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Product published successfully.");
      setForm(initialForm);
      setImage(null);
      await loadProducts();
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || "Unable to create product.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/product/admin/products/${id}`);
      toast.success("Product removed.");
      await loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete product.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f1eb] px-4 py-6 text-[#18212b] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[2rem] bg-[#18212b] p-6 text-white shadow-[0_24px_60px_rgba(24,33,43,0.16)]">
          <p className="mb-2 text-sm font-semibold tracking-[0.18em] text-[#f4b942] uppercase">Inventory</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Products</h1>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
          <form onSubmit={handleSubmit} className="rounded-[2rem] border border-[#e9e1d9] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff0ed] text-[#e65b4d]">
                <PackagePlus size={18} />
              </span>
              <h2 className="text-xl font-semibold text-[#18212b]">Add product</h2>
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#18212b]">Product name</span>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#e65b4d] focus:bg-white focus:ring-4 focus:ring-[#e65b4d]/10"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#18212b]">Description</span>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#e65b4d] focus:bg-white focus:ring-4 focus:ring-[#e65b4d]/10"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#18212b]">Price</span>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#e65b4d] focus:bg-white focus:ring-4 focus:ring-[#e65b4d]/10"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#18212b]">Stock</span>
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#e65b4d] focus:bg-white focus:ring-4 focus:ring-[#e65b4d]/10"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#18212b]">Slug</span>
                  <input
                    type="text"
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#e65b4d] focus:bg-white focus:ring-4 focus:ring-[#e65b4d]/10"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#18212b]">Category</span>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#e65b4d] focus:bg-white focus:ring-4 focus:ring-[#e65b4d]/10"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#18212b]">Product image</span>
                <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff0ed] text-[#e65b4d]">
                    <ImagePlus size={18} />
                  </div>
                  <div className="flex-1 text-sm text-slate-600">
                    <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="w-full text-sm" />
                  </div>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#e65b4d] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#e65b4d]/20 transition hover:bg-[#d94f42] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Publish product"}
            </button>
          </form>

          <div className="rounded-[2rem] border border-[#e9e1d9] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#18212b]">All products</h2>
              <span className="rounded-full bg-[#f4f1eb] px-3 py-1 text-xs font-semibold tracking-[0.12em] text-[#18212b] uppercase">
                {products.length}
              </span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="h-20 animate-pulse rounded-2xl bg-slate-200" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                No products yet.
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <div key={product._id} className="flex items-center gap-3 rounded-2xl border border-[#e9e1d9] bg-[#fffdfb] p-3">
                    <div className="h-16 w-16 overflow-hidden rounded-2xl bg-[#f4f1eb]">
                      <img src={product.images?.secure_url || "https://placehold.co/200x200/18212b/FAFAF7?text=Product"} alt={product.name} className="h-full w-full object-cover" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#18212b]">{product.name}</p>
                      <p className="mt-1 text-xs text-slate-500">${Number(product.price || 0).toFixed(2)}</p>
                    </div>

                    <button
                      onClick={() => handleDelete(product._id)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff0ed] text-[#e65b4d] transition hover:bg-[#fde8e4]"
                    >
                      <Trash2 size={15} />
                    </button>
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
