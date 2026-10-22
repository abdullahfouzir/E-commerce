import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChartNoAxesCombined, CircleDollarSign, Shapes, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api";

const COLORS = ["#1f6e63", "#e65b4d", "#f4b942", "#6d7dab", "#b46eaa", "#5c9d68", "#d08054", "#64748b"];
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function AdminSalesByCategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadSalesByCategory = async () => {
      try {
        setError(false);
        const response = await api.get("/order/admin/sales_by_category");
        const records = Array.isArray(response.data?.sales_by_category) ? response.data.sales_by_category : [];
        setCategories(
          records
            .map((record) => ({ name: record._id || "Uncategorized", sales: Number(record.totalSales) || 0 }))
            .sort((a, b) => b.sales - a.sales),
        );
      } catch (requestError) {
        setError(true);
        toast.error(requestError.response?.data?.message || "Unable to load category sales.");
      } finally {
        setLoading(false);
      }
    };

    loadSalesByCategory();
  }, []);

  const summary = useMemo(() => {
    const total = categories.reduce((sum, category) => sum + category.sales, 0);
    const top = categories[0] || { name: "—", sales: 0 };
    return { total, top, share: total ? (top.sales / total) * 100 : 0 };
  }, [categories]);

  if (loading) return <PageSkeleton />;

  return (
    <div className="min-h-screen bg-[#f4f1eb] px-4 py-6 text-[#18212b] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 rounded-[2rem] bg-[#18212b] p-6 text-white shadow-[0_24px_60px_rgba(24,33,43,0.16)] sm:p-8">
          <Link to="/admin" className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-[#f4b942]"><ArrowLeft size={16} /> Back to dashboard</Link>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#f4b942]">Sales analytics</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Sales by category</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">See which product categories generate the most paid sales.</p>
            </div>
            <div className="flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200"><CircleDollarSign size={15} className="text-[#f4b942]" /> Paid orders only</div>
          </div>
        </header>

        {error ? <ErrorState /> : categories.length === 0 ? <EmptyState /> : <>
          <section className="grid gap-4 md:grid-cols-3" aria-label="Sales summary">
            <MetricCard label="Paid sales" value={money.format(summary.total)} icon={CircleDollarSign} />
            <MetricCard label="Categories sold" value={categories.length.toLocaleString()} icon={Shapes} />
            <MetricCard label="Leading category" value={summary.top.name} detail={`${money.format(summary.top.sales)} · ${summary.share.toFixed(1)}% of sales`} icon={Trophy} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
            <div className="rounded-[2rem] border border-[#e9e1d9] bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-5"><h2 className="text-xl font-semibold">Sales share</h2><p className="mt-1 text-sm text-slate-500">Revenue distribution across categories.</p></div>
              <DonutChart data={categories} total={summary.total} />
              <div className="mt-6 space-y-3">
                {categories.map((category, index) => <div key={category.name} className="flex items-center justify-between gap-4 text-sm"><div className="flex min-w-0 items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} /><span className="truncate text-slate-600">{category.name}</span></div><span className="shrink-0 font-semibold">{((category.sales / summary.total) * 100).toFixed(1)}%</span></div>)}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#e9e1d9] bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-7 flex items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">Category ranking</h2><p className="mt-1 text-sm text-slate-500">Paid sales, from highest to lowest.</p></div><ChartNoAxesCombined size={20} className="text-[#1f6e63]" /></div>
              <div className="space-y-6">
                {categories.map((category, index) => <CategoryBar key={category.name} category={category} rank={index + 1} maxSales={categories[0].sales} color={COLORS[index % COLORS.length]} />)}
              </div>
            </div>
          </section>
        </>}
      </div>
    </div>
  );
}

function DonutChart({ data, total }) {
  const circumference = 2 * Math.PI * 54;
  return <div className="flex justify-center py-2"><div className="relative h-60 w-60"><svg viewBox="0 0 140 140" className="h-full w-full -rotate-90" role="img" aria-label="Donut chart of sales by category">
    <circle cx="70" cy="70" r="54" fill="none" stroke="#f4f1eb" strokeWidth="20" />
    {data.map((category, index) => { const dash = (category.sales / total) * circumference; const offset = data.slice(0, index).reduce((sum, item) => sum + (item.sales / total) * circumference, 0); return <circle key={category.name} cx="70" cy="70" r="54" fill="none" stroke={COLORS[index % COLORS.length]} strokeWidth="20" strokeLinecap="butt" strokeDasharray={`${dash} ${circumference - dash}`} strokeDashoffset={-offset}><title>{`${category.name}: ${money.format(category.sales)}`}</title></circle>; })}
  </svg><div className="absolute inset-0 flex flex-col items-center justify-center text-center"><span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Paid sales</span><span className="mt-1 text-xl font-semibold tracking-tight">{money.format(total)}</span></div></div></div>;
}

function CategoryBar({ category, rank, maxSales, color }) {
  const width = maxSales ? Math.max((category.sales / maxSales) * 100, 3) : 0;
  return <div><div className="mb-2 flex items-center justify-between gap-4"><div className="flex min-w-0 items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f8f4ef] text-xs font-semibold text-slate-500">{rank}</span><span className="truncate text-sm font-medium">{category.name}</span></div><span className="shrink-0 text-sm font-semibold">{money.format(category.sales)}</span></div><div className="h-2.5 overflow-hidden rounded-full bg-[#f4f1eb]"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${width}%`, backgroundColor: color }} /></div></div>;
}

function MetricCard({ label, value, detail, icon: Icon }) { return <div className="rounded-[1.75rem] border border-[#e9e1d9] bg-white p-5 shadow-sm"><div className="mb-5 flex items-center justify-between"><span className="text-sm font-medium text-slate-500">{label}</span><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff0ed] text-[#e65b4d]"><Icon size={18} /></span></div><p className="truncate text-3xl font-semibold tracking-tight">{value}</p>{detail && <p className="mt-2 truncate text-sm text-slate-500">{detail}</p>}</div>; }
function EmptyState() { return <div className="rounded-[2rem] border border-[#e9e1d9] bg-white p-10 text-center shadow-sm"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0ed] text-[#e65b4d]"><CircleDollarSign size={21} /></span><h2 className="mt-5 text-xl font-semibold">No paid category sales yet</h2><p className="mt-2 text-sm text-slate-500">This report will appear after a paid order includes a categorized product.</p></div>; }
function ErrorState() { return <div className="rounded-[2rem] border border-[#f0c4be] bg-[#fff7f5] p-8 text-center shadow-sm"><h2 className="text-xl font-semibold">We couldn’t load category sales.</h2><p className="mt-2 text-sm text-slate-600">Please refresh the page and try again.</p></div>; }
function PageSkeleton() { return <div className="min-h-screen bg-[#f4f1eb] px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl animate-pulse space-y-6"><div className="h-52 rounded-[2rem] bg-slate-200" /><div className="grid gap-4 md:grid-cols-3">{[...Array(3)].map((_, index) => <div key={index} className="h-36 rounded-[1.75rem] bg-slate-200" />)}</div><div className="grid h-96 gap-6 xl:grid-cols-2"><div className="rounded-[2rem] bg-slate-200" /><div className="rounded-[2rem] bg-slate-200" /></div></div></div>; }
