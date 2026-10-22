import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, Boxes, CircleAlert, PackageSearch, Search, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api";

export default function AdminLowStockProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const loadLowStock = async () => {
      try {
        setError(false);
        const response = await api.get("/product/admin/low_stock_products");
        setProducts(Array.isArray(response.data?.low_stock_products) ? response.data.low_stock_products : []);
      } catch (requestError) {
        setError(true);
        toast.error(requestError.response?.data?.message || "Unable to load low-stock products.");
      } finally {
        setLoading(false);
      }
    };
    loadLowStock();
  }, []);

  const filteredProducts = useMemo(() => products.filter((product) => product.name?.toLowerCase().includes(query.toLowerCase())), [products, query]);
  const summary = useMemo(() => ({ total: products.length, outOfStock: products.filter((product) => Number(product.stock) === 0).length, critical: products.filter((product) => Number(product.stock) > 0 && Number(product.stock) <= 2).length }), [products]);

  if (loading) return <PageSkeleton />;

  return <div className="min-h-screen bg-[#f4f1eb] px-4 py-6 text-[#18212b] sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl">
    <header className="mb-8 rounded-[2rem] bg-[#18212b] p-6 text-white shadow-[0_24px_60px_rgba(24,33,43,0.16)] sm:p-8"><Link to="/admin" className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-[#f4b942]"><ArrowLeft size={16} /> Back to dashboard</Link><p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#f4b942]">Inventory alerts</p><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Low-stock products</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">Products with fewer than five units available need your attention.</p></div><div className="flex w-fit items-center gap-2 rounded-full border border-[#f4b942]/20 bg-[#f4b942]/10 px-3 py-2 text-sm text-[#f4b942]"><AlertTriangle size={15} /> Stock below 5 units</div></div></header>

    {error ? <ErrorState /> : <>
      <section className="grid gap-4 md:grid-cols-3" aria-label="Low stock summary"><SummaryCard label="Low-stock products" value={summary.total} description="Below 5 units" icon={Boxes} /><SummaryCard label="Out of stock" value={summary.outOfStock} description="Needs immediate restock" icon={CircleAlert} accent="coral" /><SummaryCard label="Critical stock" value={summary.critical} description="1 to 2 units remaining" icon={ShieldAlert} accent="gold" /></section>
      <section className="mt-6 overflow-hidden rounded-[2rem] border border-[#e9e1d9] bg-white shadow-sm"><div className="flex flex-col gap-4 border-b border-[#e9e1d9] px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="text-xl font-semibold">Restock queue</h2><p className="mt-1 text-sm text-slate-500">Prioritized by the fewest units available.</p></div><label className="relative w-full lg:w-80"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#e65b4d] focus:bg-white focus:ring-4 focus:ring-[#e65b4d]/10" /></label></div>{filteredProducts.length === 0 ? <EmptyState hasProducts={products.length > 0} /> : <div className="divide-y divide-[#e9e1d9]">{filteredProducts.map((product) => <ProductRow key={product._id} product={product} />)}</div>}</section>
    </>}
  </div></div>;
}

function ProductRow({ product }) { const stock = Number(product.stock) || 0; const level = stock === 0 ? "Out of stock" : stock <= 2 ? "Critical" : "Low"; const tone = stock === 0 ? "bg-[#fff0ed] text-[#c14d40]" : stock <= 2 ? "bg-[#fff5d8] text-[#9a6800]" : "bg-[#e7f3f7] text-[#27758e]"; const bar = stock === 0 ? "bg-[#e65b4d]" : stock <= 2 ? "bg-[#f4b942]" : "bg-[#4f8ca6]"; return <div className="flex flex-col gap-4 p-5 transition hover:bg-[#fffdfb] sm:flex-row sm:items-center sm:justify-between sm:px-7"><div className="flex min-w-0 items-center gap-4"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tone}`}><PackageSearch size={19} /></span><div className="min-w-0"><p className="truncate font-semibold">{product.name}</p><p className="mt-1 font-mono text-xs text-slate-400">ID: {product._id}</p></div></div><div className="flex items-center gap-4 sm:w-96"><div className="min-w-0 flex-1"><div className="mb-2 flex items-center justify-between text-xs"><span className="font-medium text-slate-500">Stock level</span><span className="font-semibold text-slate-700">{stock} / 5</span></div><div className="h-2.5 overflow-hidden rounded-full bg-[#f4f1eb]"><div className={`h-full rounded-full ${bar}`} style={{ width: `${Math.max((stock / 5) * 100, 2)}%` }} /></div></div><span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${tone}`}>{level}</span></div></div>; }
function SummaryCard({ label, value, description, icon: Icon, accent = "coral" }) { const palette = accent === "gold" ? "bg-[#fff5d8] text-[#9a6800]" : accent === "coral" ? "bg-[#fff0ed] text-[#e65b4d]" : "bg-[#e7f3f7] text-[#27758e]"; return <div className="rounded-[1.75rem] border border-[#e9e1d9] bg-white p-5 shadow-sm"><div className="mb-5 flex items-center justify-between"><span className="text-sm font-medium text-slate-500">{label}</span><span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${palette}`}><Icon size={18} /></span></div><p className="text-3xl font-semibold tracking-tight">{value.toLocaleString()}</p><p className="mt-2 text-sm text-slate-500">{description}</p></div>; }
function EmptyState({ hasProducts }) { return <div className="p-12 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e4f3f0] text-[#1f6e63]"><PackageSearch size={21} /></span><h3 className="mt-5 text-lg font-semibold">{hasProducts ? "No matching products" : "Inventory looks healthy"}</h3><p className="mt-2 text-sm text-slate-500">{hasProducts ? "Try another product name." : "No product currently has fewer than five units in stock."}</p></div>; }
function ErrorState() { return <div className="rounded-[2rem] border border-[#f0c4be] bg-[#fff7f5] p-8 text-center shadow-sm"><h2 className="text-xl font-semibold">We couldn’t load low-stock products.</h2><p className="mt-2 text-sm text-slate-600">Please refresh the page and try again.</p></div>; }
function PageSkeleton() { return <div className="min-h-screen bg-[#f4f1eb] px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl animate-pulse space-y-6"><div className="h-52 rounded-[2rem] bg-slate-200" /><div className="grid gap-4 md:grid-cols-3">{[...Array(3)].map((_, index) => <div key={index} className="h-36 rounded-[1.75rem] bg-slate-200" />)}</div><div className="h-96 rounded-[2rem] bg-slate-200" /></div></div>; }
