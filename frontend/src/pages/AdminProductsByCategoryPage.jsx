import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Boxes, FolderSearch, Package, Search, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function AdminProductsByCategoryPage() {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searched, setSearched] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.get("/category/admin/getCategories");
        setCategories(Array.isArray(response.data?.categories) ? response.data.categories : []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to load categories.");
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const selectedCategory = categories.find((category) => category._id === categoryId);
  const filteredProducts = useMemo(
    () => products.filter((product) => product.name?.toLowerCase().includes(query.toLowerCase())),
    [products, query],
  );
  const summary = useMemo(() => ({
    products: products.length,
    units: products.reduce((total, product) => total + (Number(product.stock) || 0), 0),
    value: products.reduce((total, product) => total + (Number(product.price) || 0) * (Number(product.stock) || 0), 0),
  }), [products]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!categoryId) {
      toast.error("Choose a category first.");
      return;
    }

    try {
      setLoadingProducts(true);
      setQuery("");
      const response = await api.get(`/product/admin/getProductsByCategory/${categoryId}`);
      setProducts(Array.isArray(response.data?.products) ? response.data.products : []);
      setSearched(true);
    } catch (error) {
      if (error.response?.status === 404) {
        setProducts([]);
        setSearched(true);
      } else {
        toast.error(error.response?.data?.message || "Unable to load products for this category.");
      }
    } finally {
      setLoadingProducts(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f1eb] px-4 py-6 text-[#18212b] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 rounded-[2rem] bg-[#18212b] p-6 text-white shadow-[0_24px_60px_rgba(24,33,43,0.16)] sm:p-8">
          <Link to="/admin" className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-[#f4b942]">
            <ArrowLeft size={16} /> Back to dashboard
          </Link>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#f4b942]">Catalog</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Products by category</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">Select a category to view its catalog, stock, and inventory value.</p>
            </div>
            <div className="flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
              <FolderSearch size={15} className="text-[#f4b942]" /> Category browser
            </div>
          </div>
        </header>

        <section className="rounded-[2rem] border border-[#e9e1d9] bg-white p-5 shadow-sm sm:p-7">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <label className="block flex-1">
              <span className="mb-2 block text-sm font-medium">Category</span>
              <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} disabled={loadingCategories} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-[#e65b4d] focus:bg-white focus:ring-4 focus:ring-[#e65b4d]/10 disabled:cursor-not-allowed disabled:opacity-60">
                <option value="">{loadingCategories ? "Loading categories..." : "Choose a category"}</option>
                {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
              </select>
            </label>
            <button type="submit" disabled={loadingCategories || loadingProducts || categories.length === 0} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e65b4d] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#e65b4d]/20 transition hover:bg-[#d94f42] disabled:cursor-not-allowed disabled:opacity-60">
              <FolderSearch size={17} /> {loadingProducts ? "Loading..." : "View products"}
            </button>
          </form>
        </section>

        {searched ? <>
          <section className="mt-6 grid gap-4 md:grid-cols-3">
            <SummaryCard label="Products found" value={summary.products} detail={selectedCategory?.name || "Selected category"} icon={Package} />
            <SummaryCard label="Units in stock" value={summary.units} detail="Across this category" icon={Boxes} accent="teal" />
            <SummaryCard label="Inventory value" value={money.format(summary.value)} detail="Price × current stock" icon={Tag} />
          </section>
          <section className="mt-6 overflow-hidden rounded-[2rem] border border-[#e9e1d9] bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-[#e9e1d9] px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold">{selectedCategory?.name || "Category"} catalog</h2>
                <p className="mt-1 text-sm text-slate-500">{filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"} shown</p>
              </div>
              <label className="relative w-full lg:w-80">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search these products" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#e65b4d] focus:bg-white focus:ring-4 focus:ring-[#e65b4d]/10" />
              </label>
            </div>
            {loadingProducts ? <ResultSkeleton /> : filteredProducts.length === 0 ? <EmptyState hasProducts={products.length > 0} /> : <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3 sm:p-7">{filteredProducts.map((product) => <ProductCard key={product._id} product={product} categoryName={selectedCategory?.name} />)}</div>}
          </section>
        </> : <SearchPrompt />}
      </div>
    </div>
  );
}

function ProductCard({ product, categoryName }) {
  const image = product.images?.[0]?.secure_url;
  const stock = Number(product.stock) || 0;
  return <div className="rounded-2xl border border-[#e9e1d9] bg-[#fffdfb] p-4"><div className="flex items-center gap-3"><span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#fff0ed] text-[#e65b4d]">{image ? <img src={image} alt={product.name} className="h-full w-full object-cover" /> : <Package size={19} />}</span><div className="min-w-0"><p className="truncate font-semibold">{product.name}</p><p className="mt-1 truncate text-xs text-slate-500">{categoryName || "Catalog product"}</p></div></div><div className="mt-5 grid grid-cols-2 gap-3"><div><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Price</p><p className="mt-1 text-lg font-semibold">{money.format(Number(product.price) || 0)}</p></div><div><p className="text-xs font-medium uppercase tracking-wide text-slate-500">In stock</p><p className="mt-1 text-lg font-semibold">{stock} <span className="text-sm font-medium text-slate-500">units</span></p></div></div></div>;
}

function SummaryCard({ label, value, detail, icon: Icon, accent = "coral" }) { const palette = accent === "teal" ? "bg-[#e4f3f0] text-[#1f6e63]" : "bg-[#fff0ed] text-[#e65b4d]"; return <div className="rounded-[1.75rem] border border-[#e9e1d9] bg-white p-5 shadow-sm"><div className="mb-5 flex items-center justify-between"><span className="text-sm font-medium text-slate-500">{label}</span><span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${palette}`}><Icon size={18} /></span></div><p className="truncate text-3xl font-semibold tracking-tight">{typeof value === "number" ? value.toLocaleString() : value}</p><p className="mt-2 truncate text-sm text-slate-500">{detail}</p></div>; }
function SearchPrompt() { return <section className="mt-6 rounded-[2rem] border border-dashed border-[#d8cec3] bg-white/60 p-12 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0ed] text-[#e65b4d]"><FolderSearch size={21} /></span><h2 className="mt-5 text-xl font-semibold">Choose a category</h2><p className="mt-2 text-sm text-slate-500">Select a category above to see the products currently assigned to it.</p></section>; }
function EmptyState({ hasProducts }) { return <div className="p-12 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0ed] text-[#e65b4d]"><Search size={21} /></span><h3 className="mt-5 text-lg font-semibold">{hasProducts ? "No matching product names" : "No products in this category"}</h3><p className="mt-2 text-sm text-slate-500">{hasProducts ? "Try another product name." : "Choose another category or add products to this one."}</p></div>; }
function ResultSkeleton() { return <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3 sm:p-7">{[...Array(6)].map((_, index) => <div key={index} className="h-44 animate-pulse rounded-2xl bg-slate-200" />)}</div>; }
