import { useEffect, useState } from "react";
import { ArrowLeft, Boxes, FolderSearch, Hash, Search, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api";

export default function AdminSearchCategoryPage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const query = name.trim();
    const controller = new AbortController();
    const delay = setTimeout(async () => {
      if (!query) {
        setCategory(null);
        setSearched(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get("/category/admin/searchCategory", { params: { category: query }, signal: controller.signal });
        setCategory(response.data?.category || null);
        setSearched(true);
      } catch (error) {
        if (error.code !== "ERR_CANCELED") {
          setCategory(null);
          setSearched(true);
          if (error.response?.status !== 404) {
            toast.error(error.response?.data?.message || "Unable to search categories.");
          }
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 150);

    return () => { clearTimeout(delay); controller.abort(); };
  }, [name]);

  return (
    <div className="min-h-screen bg-[#f4f1eb] px-4 py-6 text-[#18212b] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 rounded-[2rem] bg-[#18212b] p-6 text-white shadow-[0_24px_60px_rgba(24,33,43,0.16)] sm:p-8">
          <Link to="/admin" className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-[#f4b942]"><ArrowLeft size={16} /> Back to dashboard</Link>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#f4b942]">Catalog</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Find a category</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">Start typing any part of a category name to find it instantly.</p>
        </header>

        <section className="rounded-[2rem] border border-[#e9e1d9] bg-white p-5 shadow-sm sm:p-7">
          <label className="relative block"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Search category names..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-28 text-sm outline-none transition focus:border-[#e65b4d] focus:bg-white focus:ring-4 focus:ring-[#e65b4d]/10" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">{loading ? "Searching..." : "Live search"}</span></label>
          <p className="mt-3 text-xs text-slate-500">Results update 150ms after you stop typing and match any part of a category name.</p>
        </section>

        <section className="mt-6">
          {!name.trim() ? <SearchPrompt /> : loading ? <ResultSkeleton /> : searched && category ? <CategoryResult category={category} /> : <NoResult name={name.trim()} />}
        </section>
      </div>
    </div>
  );
}

function CategoryResult({ category }) {
  return <div className="overflow-hidden rounded-[2rem] border border-[#e9e1d9] bg-white shadow-sm"><div className="border-b border-[#e9e1d9] bg-[#f8f4ef] p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#e65b4d]">Category found</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">{category.name}</h2></div><span className="rounded-full bg-[#e4f3f0] px-3 py-1.5 text-xs font-semibold text-[#1f6e63]">Active catalog group</span></div></div><div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-8"><DetailCard icon={Tag} label="Slug" value={`/${category.slug || "Not available"}`} /><DetailCard icon={Hash} label="Category ID" value={category._id} mono /><Link to={`/admin/products-by-category`} className="flex items-center gap-3 rounded-2xl border border-[#e9e1d9] bg-[#fffdfb] p-4 transition hover:border-[#b8d8d2] hover:bg-[#e4f3f0]"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e4f3f0] text-[#1f6e63]"><Boxes size={18} /></span><span><span className="block text-sm font-semibold">View category products</span><span className="mt-1 block text-xs text-slate-500">Choose this category in the product browser.</span></span></Link></div></div>;
}

function DetailCard({ icon: Icon, label, value, mono = false }) { return <div className="rounded-2xl border border-[#e9e1d9] bg-[#fffdfb] p-4"><div className="flex items-center gap-2 text-[#e65b4d]"><Icon size={16} /><span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span></div><p className={`mt-3 truncate text-sm font-semibold ${mono ? "font-mono" : ""}`}>{value}</p></div>; }
function SearchPrompt() { return <div className="rounded-[2rem] border border-dashed border-[#d8cec3] bg-white/60 p-12 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0ed] text-[#e65b4d]"><FolderSearch size={21} /></span><h2 className="mt-5 text-xl font-semibold">Look up a catalog category</h2><p className="mt-2 text-sm text-slate-500">Enter the category name above to retrieve its details.</p></div>; }
function NoResult({ name }) { return <div className="rounded-[2rem] border border-[#e9e1d9] bg-white p-12 text-center shadow-sm"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0ed] text-[#e65b4d]"><Search size={21} /></span><h2 className="mt-5 text-xl font-semibold">No category found</h2><p className="mt-2 text-sm text-slate-500">{name ? `We couldn't find a category named “${name}”.` : "Try another category name."}</p></div>; }
function ResultSkeleton() { return <div className="h-72 animate-pulse rounded-[2rem] bg-slate-200" />; }
