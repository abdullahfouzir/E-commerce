import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Award, BarChart3, Crown, Package, Search, ShoppingBag, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api";

const podiumStyles = [
  { card: "border-[#efd59a] bg-[#fffaf0]", badge: "bg-[#f4b942] text-[#5f4300]", bar: "bg-[#f4b942]" },
  { card: "border-slate-300 bg-slate-50", badge: "bg-slate-300 text-slate-700", bar: "bg-slate-400" },
  { card: "border-[#edcbb8] bg-[#fff7f2]", badge: "bg-[#d78b57] text-white", bar: "bg-[#d78b57]" },
];

export default function AdminTopProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const loadTopProducts = async () => {
      try {
        setError(false);
        const response = await api.get("/product/admin/Top_Products");
        const records = Array.isArray(response.data?.top_products) ? response.data.top_products : [];
        setProducts(records.map((record) => ({ product: record.product || {}, units: Number(record.units) || 0 })).sort((a, b) => b.units - a.units));
      } catch (requestError) {
        setError(true);
        toast.error(requestError.response?.data?.message || "Unable to load top products.");
      } finally {
        setLoading(false);
      }
    };
    loadTopProducts();
  }, []);

  const filteredProducts = useMemo(() => products.filter(({ product }) => product.name?.toLowerCase().includes(query.toLowerCase())), [products, query]);
  const summary = useMemo(() => ({ totalUnits: products.reduce((sum, item) => sum + item.units, 0), leader: products[0], topThree: products.slice(0, 3).reduce((sum, item) => sum + item.units, 0) }), [products]);

  if (loading) return <PageSkeleton />;

  return <div className="min-h-screen bg-[#f4f1eb] px-4 py-6 text-[#18212b] sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl">
    <header className="mb-8 rounded-[2rem] bg-[#18212b] p-6 text-white shadow-[0_24px_60px_rgba(24,33,43,0.16)] sm:p-8"><Link to="/admin" className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-[#f4b942]"><ArrowLeft size={16} /> Back to dashboard</Link><p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#f4b942]">Sales analytics</p><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Top products</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">Your best-selling products, ranked by units from paid orders.</p></div><div className="flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200"><ShoppingBag size={15} className="text-[#f4b942]" /> Paid orders only</div></div></header>

    {error ? <ErrorState /> : products.length === 0 ? <EmptyState /> : <>
      <section className="grid gap-4 md:grid-cols-3"><SummaryCard label="Units sold" value={summary.totalUnits} detail="Across all top products" icon={ShoppingBag} /><SummaryCard label="Best seller" value={summary.leader?.product?.name || "-"} detail={`${summary.leader?.units || 0} units sold`} icon={Crown} accent="gold" /><SummaryCard label="Top 3 units" value={summary.topThree} detail={`${((summary.topThree / summary.totalUnits) * 100).toFixed(1)}% of paid-order units`} icon={Trophy} accent="teal" /></section>
      <section className="mt-6 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]"><div className="rounded-[2rem] border border-[#e9e1d9] bg-white p-5 shadow-sm sm:p-7"><div className="mb-6"><h2 className="text-xl font-semibold">Leaderboard</h2><p className="mt-1 text-sm text-slate-500">The three highest-volume products.</p></div><div className="space-y-4">{products.slice(0, 3).map((item, index) => <PodiumCard key={item.product._id || item.product.name} item={item} rank={index + 1} />)}</div></div><div className="rounded-[2rem] border border-[#e9e1d9] bg-white p-5 shadow-sm sm:p-7"><div className="mb-7 flex items-start justify-between"><div><h2 className="text-xl font-semibold">Sales volume</h2><p className="mt-1 text-sm text-slate-500">Units sold per product, from paid orders.</p></div><BarChart3 size={20} className="text-[#1f6e63]" /></div><SalesBars data={products} /></div></section>
      <section className="mt-6 overflow-hidden rounded-[2rem] border border-[#e9e1d9] bg-white shadow-sm"><div className="flex flex-col gap-4 border-b border-[#e9e1d9] px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="text-xl font-semibold">All ranked products</h2><p className="mt-1 text-sm text-slate-500">Search the full paid-order product ranking.</p></div><label className="relative w-full lg:w-80"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#e65b4d] focus:bg-white focus:ring-4 focus:ring-[#e65b4d]/10" /></label></div>{filteredProducts.length === 0 ? <SearchEmpty /> : <div className="divide-y divide-[#e9e1d9]">{filteredProducts.map((item) => <RankRow key={item.product._id || item.product.name} item={item} rank={products.indexOf(item) + 1} maxUnits={products[0].units} />)}</div>}</section>
    </>}
  </div></div>;
}

function PodiumCard({ item, rank }) { const style = podiumStyles[rank - 1]; const product = item.product; const image = product.images?.[0]?.secure_url; return <div className={`flex items-center gap-4 rounded-2xl border p-4 ${style.card}`}><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${style.badge}`}>#{rank}</span><div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/70 text-[#e65b4d]">{image ? <img src={image} alt={product.name} className="h-full w-full object-cover" /> : <Package size={19} />}</div><div className="min-w-0 flex-1"><p className="truncate font-semibold">{product.name || "Product"}</p><p className="mt-1 text-sm text-slate-500">{item.units.toLocaleString()} units sold</p></div><Award size={19} className={rank === 1 ? "text-[#b48100]" : "text-slate-400"} /></div>; }
function SalesBars({ data }) { const visible = data.slice(0, 7); const maxUnits = visible[0]?.units || 1; return <div className="space-y-5">{visible.map((item, index) => <div key={item.product._id || item.product.name}><div className="mb-2 flex items-center justify-between gap-4"><p className="truncate text-sm font-medium">{index + 1}. {item.product.name || "Product"}</p><p className="shrink-0 text-sm font-semibold">{item.units.toLocaleString()}</p></div><div className="h-3 overflow-hidden rounded-full bg-[#f4f1eb]"><div className="h-full rounded-full bg-[#1f6e63]" style={{ width: `${Math.max((item.units / maxUnits) * 100, 3)}%` }} /></div></div>)}</div>; }
function RankRow({ item, rank, maxUnits }) { const product = item.product; const image = product.images?.[0]?.secure_url; return <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7"><div className="flex min-w-0 items-center gap-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f8f4ef] text-sm font-semibold text-slate-500">{rank}</span><div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#fff0ed] text-[#e65b4d]">{image ? <img src={image} alt={product.name} className="h-full w-full object-cover" /> : <Package size={19} />}</div><div className="min-w-0"><p className="truncate font-semibold">{product.name || "Product"}</p><p className="mt-1 font-mono text-xs text-slate-400">{product._id}</p></div></div><div className="flex items-center gap-4 sm:w-80"><div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#f4f1eb]"><div className="h-full rounded-full bg-[#1f6e63]" style={{ width: `${Math.max((item.units / maxUnits) * 100, 3)}%` }} /></div><p className="w-20 shrink-0 text-right text-sm font-semibold">{item.units.toLocaleString()} units</p></div></div>; }
function SummaryCard({ label, value, detail, icon: Icon, accent = "coral" }) { const palette = accent === "gold" ? "bg-[#fff5d8] text-[#9a6800]" : accent === "teal" ? "bg-[#e4f3f0] text-[#1f6e63]" : "bg-[#fff0ed] text-[#e65b4d]"; return <div className="rounded-[1.75rem] border border-[#e9e1d9] bg-white p-5 shadow-sm"><div className="mb-5 flex items-center justify-between"><span className="text-sm font-medium text-slate-500">{label}</span><span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${palette}`}><Icon size={18} /></span></div><p className="truncate text-3xl font-semibold tracking-tight">{typeof value === "number" ? value.toLocaleString() : value}</p><p className="mt-2 truncate text-sm text-slate-500">{detail}</p></div>; }
function EmptyState() { return <div className="rounded-[2rem] border border-[#e9e1d9] bg-white p-10 text-center shadow-sm"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0ed] text-[#e65b4d]"><ShoppingBag size={21} /></span><h2 className="mt-5 text-xl font-semibold">No paid product sales yet</h2><p className="mt-2 text-sm text-slate-500">This ranking will appear after a product is included in a paid order.</p></div>; }
function SearchEmpty() { return <div className="p-12 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0ed] text-[#e65b4d]"><Search size={21} /></span><h3 className="mt-5 text-lg font-semibold">No matching products</h3><p className="mt-2 text-sm text-slate-500">Try another product name.</p></div>; }
function ErrorState() { return <div className="rounded-[2rem] border border-[#f0c4be] bg-[#fff7f5] p-8 text-center shadow-sm"><h2 className="text-xl font-semibold">We couldn’t load top products.</h2><p className="mt-2 text-sm text-slate-600">Please refresh the page and try again.</p></div>; }
function PageSkeleton() { return <div className="min-h-screen bg-[#f4f1eb] px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl animate-pulse space-y-6"><div className="h-52 rounded-[2rem] bg-slate-200" /><div className="grid gap-4 md:grid-cols-3">{[...Array(3)].map((_, index) => <div key={index} className="h-36 rounded-[1.75rem] bg-slate-200" />)}</div><div className="grid h-96 gap-6 xl:grid-cols-2"><div className="rounded-[2rem] bg-slate-200" /><div className="rounded-[2rem] bg-slate-200" /></div></div></div>; }
