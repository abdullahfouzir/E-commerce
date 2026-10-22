import { useEffect, useState } from "react";
import { ArrowLeft, Barcode, Boxes, CircleDollarSign, Package, Search, Tag, Warehouse } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function AdminSearchProductPage() {
  const [name, setName] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState(false);

  useEffect(() => {
    const trimmedName = name.trim();
    const controller = new AbortController();
    const delay = setTimeout(async () => {
      if (!trimmedName) {
        setProducts([]);
        setSelectedProduct(null);
        setSearchError(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setSearchError(false);
        const response = await api.get("/product/admin/searchProduct", { params: { name: trimmedName }, signal: controller.signal });
        const matches = Array.isArray(response.data?.products) ? response.data.products : [];
        setProducts(matches);
        setSelectedProduct(matches[0] || null);
      } catch (requestError) {
        if (requestError.code !== "ERR_CANCELED") {
          setProducts([]);
          setSelectedProduct(null);
          setSearchError(true);
          toast.error(requestError.response?.data?.message || "Unable to search products.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => { clearTimeout(delay); controller.abort(); };
  }, [name]);

  return <div className="min-h-screen bg-[#f4f1eb] px-4 py-6 text-[#18212b] sm:px-6 lg:px-8"><div className="mx-auto max-w-5xl">
    <header className="mb-8 rounded-[2rem] bg-[#18212b] p-6 text-white shadow-[0_24px_60px_rgba(24,33,43,0.16)] sm:p-8"><Link to="/admin" className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-[#f4b942]"><ArrowLeft size={16} /> Back to dashboard</Link><p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#f4b942]">Inventory</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Find a product</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">Start typing to search your catalog in real time.</p></header>
    <section className="rounded-[2rem] border border-[#e9e1d9] bg-white p-5 shadow-sm sm:p-7"><label className="relative block"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Search product names..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-28 text-sm outline-none transition focus:border-[#e65b4d] focus:bg-white focus:ring-4 focus:ring-[#e65b4d]/10" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">{loading ? "Searching..." : "Live search"}</span></label><p className="mt-3 text-xs text-slate-500">Results update 300ms after you stop typing.</p></section>
    <section className="mt-6">{!name.trim() ? <SearchPrompt /> : loading ? <ResultSkeleton /> : searchError ? <NoResult message="We couldn’t search the catalog. Please try again." /> : products.length === 0 ? <NoResult message="No products match that name." /> : <div className="space-y-6"><div className="rounded-[2rem] border border-[#e9e1d9] bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-slate-600">{products.length} matching product{products.length === 1 ? "" : "s"}</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{products.map((item) => <button key={item._id} type="button" onClick={() => setSelectedProduct(item)} className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${selectedProduct?._id === item._id ? "border-[#1f6e63] bg-[#e4f3f0]" : "border-[#e9e1d9] bg-[#fffdfb] hover:border-[#b8d8d2]"}`}><span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#fff0ed] text-[#e65b4d]">{item.images?.[0]?.secure_url ? <img src={item.images[0].secure_url} alt="" className="h-full w-full object-cover" /> : <Package size={17} />}</span><span className="min-w-0"><span className="block truncate text-sm font-semibold">{item.name}</span><span className="mt-1 block text-xs text-slate-500">{Number(item.stock) || 0} units available</span></span></button>)}</div></div>{selectedProduct && <ProductResult product={selectedProduct} />}</div>}</section>
  </div></div>;
}

function ProductResult({ product }) { const image = product.images?.[0]?.secure_url; const stock = Number(product.stock) || 0; const stockTone = stock === 0 ? "bg-[#fff0ed] text-[#c14d40]" : stock < 5 ? "bg-[#fff5d8] text-[#9a6800]" : "bg-[#e4f3f0] text-[#1f6e63]"; const stockLabel = stock === 0 ? "Out of stock" : stock < 5 ? "Low stock" : "In stock"; return <div className="overflow-hidden rounded-[2rem] border border-[#e9e1d9] bg-white shadow-sm"><div className="grid lg:grid-cols-[0.78fr_1.22fr]"><div className="flex min-h-72 items-center justify-center bg-[#f8f4ef] p-8">{image ? <img src={image} alt={product.name} className="max-h-80 w-full rounded-2xl object-contain" /> : <span className="flex h-24 w-24 items-center justify-center rounded-3xl bg-[#fff0ed] text-[#e65b4d]"><Package size={38} /></span>}</div><div className="p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#e65b4d]">Product found</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">{product.name}</h2></div><span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${stockTone}`}>{stockLabel}</span></div><p className="mt-5 leading-7 text-slate-600">{product.description || "No product description is available."}</p><div className="mt-7 grid gap-3 sm:grid-cols-2"><DetailCard icon={CircleDollarSign} label="Price" value={money.format(Number(product.price) || 0)} /><DetailCard icon={Warehouse} label="Available stock" value={`${stock} units`} /><DetailCard icon={Tag} label="Category" value={typeof product.category === "object" ? product.category?.name || "Assigned" : product.category || "Not available"} /><DetailCard icon={Barcode} label="Product ID" value={product._id} mono /></div></div></div></div>; }
function DetailCard({ icon: Icon, label, value, mono = false }) { return <div className="rounded-2xl border border-[#e9e1d9] bg-[#fffdfb] p-4"><div className="flex items-center gap-2 text-[#e65b4d]"><Icon size={16} /><span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span></div><p className={`mt-3 truncate text-sm font-semibold ${mono ? "font-mono" : ""}`}>{value}</p></div>; }
function SearchPrompt() { return <div className="rounded-[2rem] border border-dashed border-[#d8cec3] bg-white/60 p-12 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0ed] text-[#e65b4d]"><Boxes size={21} /></span><h2 className="mt-5 text-xl font-semibold">Look up a catalog product</h2><p className="mt-2 text-sm text-slate-500">Enter a product name above to retrieve its inventory and pricing details.</p></div>; }
function NoResult({ message }) { return <div className="rounded-[2rem] border border-[#e9e1d9] bg-white p-12 text-center shadow-sm"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0ed] text-[#e65b4d]"><Search size={21} /></span><h2 className="mt-5 text-xl font-semibold">No product found</h2><p className="mt-2 text-sm text-slate-500">{message}</p></div>; }
function ResultSkeleton() { return <div className="h-96 animate-pulse rounded-[2rem] bg-slate-200" />; }
