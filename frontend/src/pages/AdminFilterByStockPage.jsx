import { useMemo, useState } from "react";
import { ArrowLeft, Boxes, Funnel, Package, Search, SlidersHorizontal, Warehouse } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api";

export default function AdminFilterByStockPage() {
  const [min, setMin] = useState("0");
  const [max, setMax] = useState("1000");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [query, setQuery] = useState("");

  const handleFilter = async (event) => {
    event.preventDefault();
    const minValue = Number(min);
    const maxValue = Number(max);
    if (!Number.isFinite(minValue) || !Number.isFinite(maxValue) || minValue < 0 || maxValue < minValue) {
      toast.error("Enter a valid stock range where maximum is at least minimum.");
      return;
    }
    try {
      setLoading(true);
      const response = await api.get("/product/admin/filterByStock", { params: { min: minValue, max: maxValue } });
      setProducts(Array.isArray(response.data?.filteredByStock) ? response.data.filteredByStock : []);
      setSearched(true);
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to filter products by stock.");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => products.filter((product) => product.name?.toLowerCase().includes(query.toLowerCase())), [products, query]);
  const summary = useMemo(() => ({ count: products.length, units: products.reduce((sum, product) => sum + (Number(product.stock) || 0), 0), average: products.length ? products.reduce((sum, product) => sum + (Number(product.stock) || 0), 0) / products.length : 0 }), [products]);

  return <div className="min-h-screen bg-[#f4f1eb] px-4 py-6 text-[#18212b] sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl">
    <header className="mb-8 rounded-[2rem] bg-[#18212b] p-6 text-white shadow-[0_24px_60px_rgba(24,33,43,0.16)] sm:p-8"><Link to="/admin" className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-[#f4b942]"><ArrowLeft size={16} /> Back to dashboard</Link><p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#f4b942]">Inventory</p><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Filter by stock</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">Find products by their available unit range.</p></div><div className="flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200"><SlidersHorizontal size={15} className="text-[#f4b942]" /> Inventory range</div></div></header>
    <section className="rounded-[2rem] border border-[#e9e1d9] bg-white p-5 shadow-sm sm:p-7"><form onSubmit={handleFilter} className="flex flex-col gap-4 lg:flex-row lg:items-end"><label className="block flex-1"><span className="mb-2 block text-sm font-medium">Minimum stock</span><input type="number" min="0" value={min} onChange={(event) => setMin(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-[#e65b4d] focus:bg-white focus:ring-4 focus:ring-[#e65b4d]/10" /></label><label className="block flex-1"><span className="mb-2 block text-sm font-medium">Maximum stock</span><input type="number" min="0" value={max} onChange={(event) => setMax(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-[#e65b4d] focus:bg-white focus:ring-4 focus:ring-[#e65b4d]/10" /></label><button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e65b4d] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#e65b4d]/20 transition hover:bg-[#d94f42] disabled:cursor-not-allowed disabled:opacity-60"><Funnel size={17} /> {loading ? "Filtering..." : "Apply filter"}</button></form></section>
    {searched && <><section className="mt-6 grid gap-4 md:grid-cols-3"><SummaryCard label="Matching products" value={summary.count} detail={`Stock from ${min} to ${max}`} icon={Package} /><SummaryCard label="Combined units" value={summary.units} detail="Across matching products" icon={Boxes} accent="teal" /><SummaryCard label="Average stock" value={summary.average.toFixed(1)} detail="Units per matching product" icon={Warehouse} /></section><section className="mt-6 overflow-hidden rounded-[2rem] border border-[#e9e1d9] bg-white shadow-sm"><div className="flex flex-col gap-4 border-b border-[#e9e1d9] px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="text-xl font-semibold">Filtered inventory</h2><p className="mt-1 text-sm text-slate-500">{filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"} shown</p></div><label className="relative w-full lg:w-80"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search these products" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#e65b4d] focus:bg-white focus:ring-4 focus:ring-[#e65b4d]/10" /></label></div>{loading ? <ResultSkeleton /> : filteredProducts.length === 0 ? <EmptyState hasProducts={products.length > 0} /> : <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3 sm:p-7">{filteredProducts.map((product) => <ProductCard key={product._id} product={product} min={Number(min)} max={Number(max)} />)}</div>}</section></>}
    {!searched && <SearchPrompt />}
  </div></div>;
}

function ProductCard({ product, min, max }) { const image = product.images?.[0]?.secure_url; const stock = Number(product.stock) || 0; const range = Math.max(max - min, 1); const level = Math.min(Math.max(((stock - min) / range) * 100, 3), 100); return <div className="rounded-2xl border border-[#e9e1d9] bg-[#fffdfb] p-4"><div className="flex items-center gap-3"><span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#fff0ed] text-[#e65b4d]">{image ? <img src={image} alt={product.name} className="h-full w-full object-cover" /> : <Package size={19} />}</span><div className="min-w-0"><p className="truncate font-semibold">{product.name}</p><p className="mt-1 truncate text-xs text-slate-500">{product.category?.name || "Catalog product"}</p></div></div><div className="mt-5 flex items-end justify-between"><div><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Available stock</p><p className="mt-1 text-2xl font-semibold">{stock} <span className="text-sm font-medium text-slate-500">units</span></p></div><span className="rounded-full bg-[#e4f3f0] px-2.5 py-1 text-xs font-semibold text-[#1f6e63]">In range</span></div><div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#f4f1eb]"><div className="h-full rounded-full bg-[#1f6e63]" style={{ width: `${level}%` }} /></div></div>; }
function SummaryCard({ label, value, detail, icon: Icon, accent = "coral" }) { const palette = accent === "teal" ? "bg-[#e4f3f0] text-[#1f6e63]" : "bg-[#fff0ed] text-[#e65b4d]"; return <div className="rounded-[1.75rem] border border-[#e9e1d9] bg-white p-5 shadow-sm"><div className="mb-5 flex items-center justify-between"><span className="text-sm font-medium text-slate-500">{label}</span><span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${palette}`}><Icon size={18} /></span></div><p className="text-3xl font-semibold tracking-tight">{typeof value === "number" ? value.toLocaleString() : value}</p><p className="mt-2 text-sm text-slate-500">{detail}</p></div>; }
function SearchPrompt() { return <section className="mt-6 rounded-[2rem] border border-dashed border-[#d8cec3] bg-white/60 p-12 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0ed] text-[#e65b4d]"><Funnel size={21} /></span><h2 className="mt-5 text-xl font-semibold">Choose a stock range</h2><p className="mt-2 text-sm text-slate-500">Set your minimum and maximum units, then apply the filter to see matching products.</p></section>; }
function EmptyState({ hasProducts }) { return <div className="p-12 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0ed] text-[#e65b4d]"><Search size={21} /></span><h3 className="mt-5 text-lg font-semibold">{hasProducts ? "No matching product names" : "No products in this stock range"}</h3><p className="mt-2 text-sm text-slate-500">{hasProducts ? "Try another product name." : "Adjust the minimum or maximum stock values and try again."}</p></div>; }
function ResultSkeleton() { return <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3 sm:p-7">{[...Array(6)].map((_, index) => <div key={index} className="h-48 animate-pulse rounded-2xl bg-slate-200" />)}</div>; }
