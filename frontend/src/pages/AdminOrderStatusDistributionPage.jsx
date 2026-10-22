import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, CircleAlert, ClipboardList, PackageCheck, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "#f4b942", icon: CircleAlert, description: "Awaiting confirmation" },
  confirmed: { label: "Confirmed", color: "#6d7dab", icon: CheckCircle2, description: "Confirmed by store" },
  processing: { label: "Processing", color: "#b46eaa", icon: ClipboardList, description: "Being prepared" },
  shipped: { label: "Shipped", color: "#4f8ca6", icon: Truck, description: "On the way" },
  delivered: { label: "Delivered", color: "#1f6e63", icon: PackageCheck, description: "Successfully delivered" },
  cancelled: { label: "Cancelled", color: "#e65b4d", icon: CircleAlert, description: "Cancelled orders" },
};

const STATUS_ORDER = Object.keys(STATUS_CONFIG);

export default function AdminOrderStatusDistributionPage() {
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadDistribution = async () => {
      try {
        setError(false);
        const response = await api.get("/order/admin/order_status_distribution");
        const records = Array.isArray(response.data?.ordersStatus) ? response.data.ordersStatus : [];
        const counts = new Map(records.map((record) => [record._id, Number(record.totalOrders) || 0]));
        setDistribution(STATUS_ORDER.map((status) => ({ status, count: counts.get(status) || 0 })));
      } catch (requestError) {
        setError(true);
        toast.error(requestError.response?.data?.message || "Unable to load order statuses.");
      } finally {
        setLoading(false);
      }
    };

    loadDistribution();
  }, []);

  const summary = useMemo(() => {
    const total = distribution.reduce((sum, item) => sum + item.count, 0);
    const completed = distribution.find((item) => item.status === "delivered")?.count || 0;
    const active = distribution.filter((item) => ["confirmed", "processing", "shipped"].includes(item.status)).reduce((sum, item) => sum + item.count, 0);
    const top = distribution.reduce((highest, item) => item.count > highest.count ? item : highest, { status: "pending", count: 0 });
    return { total, completed, active, top };
  }, [distribution]);

  if (loading) return <PageSkeleton />;

  return (
    <div className="min-h-screen bg-[#f4f1eb] px-4 py-6 text-[#18212b] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 rounded-[2rem] bg-[#18212b] p-6 text-white shadow-[0_24px_60px_rgba(24,33,43,0.16)] sm:p-8">
          <Link to="/admin" className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-[#f4b942]"><ArrowLeft size={16} /> Back to dashboard</Link>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#f4b942]">Order analytics</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Order status distribution</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">Monitor every order stage, from confirmation through delivery.</p></div><div className="flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200"><ClipboardList size={15} className="text-[#f4b942]" /> Live order mix</div></div>
        </header>

        {error ? <ErrorState /> : summary.total === 0 ? <EmptyState /> : <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Order status summary">
            <MetricCard label="All orders" value={summary.total.toLocaleString()} icon={ClipboardList} />
            <MetricCard label="Active fulfillment" value={summary.active.toLocaleString()} detail="Confirmed, processing and shipped" icon={Truck} />
            <MetricCard label="Delivered" value={summary.completed.toLocaleString()} detail={`${((summary.completed / summary.total) * 100).toFixed(1)}% of all orders`} icon={PackageCheck} accent="teal" />
            <MetricCard label="Most common status" value={STATUS_CONFIG[summary.top.status].label} detail={`${summary.top.count.toLocaleString()} orders`} icon={CheckCircle2} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
            <div className="rounded-[2rem] border border-[#e9e1d9] bg-white p-5 shadow-sm sm:p-7"><div className="mb-5"><h2 className="text-xl font-semibold">Status share</h2><p className="mt-1 text-sm text-slate-500">How all store orders are currently distributed.</p></div><DonutChart data={distribution} total={summary.total} /><div className="mt-6 space-y-3">{distribution.filter((item) => item.count > 0).map((item) => <LegendRow key={item.status} item={item} total={summary.total} />)}</div></div>
            <div className="rounded-[2rem] border border-[#e9e1d9] bg-white p-5 shadow-sm sm:p-7"><div className="mb-7"><h2 className="text-xl font-semibold">Fulfillment pipeline</h2><p className="mt-1 text-sm text-slate-500">Orders at each stage of their journey.</p></div><div className="space-y-4">{distribution.map((item) => <StatusRow key={item.status} item={item} total={summary.total} />)}</div></div>
          </section>
        </>}
      </div>
    </div>
  );
}

function DonutChart({ data, total }) {
  const circumference = 2 * Math.PI * 54;
  return <div className="flex justify-center py-2"><div className="relative h-60 w-60"><svg viewBox="0 0 140 140" className="h-full w-full -rotate-90" role="img" aria-label="Donut chart showing order statuses"><circle cx="70" cy="70" r="54" fill="none" stroke="#f4f1eb" strokeWidth="20" />{data.filter((item) => item.count > 0).map((item) => { const dash = (item.count / total) * circumference; const offset = data.slice(0, data.indexOf(item)).reduce((sum, previous) => sum + (previous.count / total) * circumference, 0); return <circle key={item.status} cx="70" cy="70" r="54" fill="none" stroke={STATUS_CONFIG[item.status].color} strokeWidth="20" strokeDasharray={`${dash} ${circumference - dash}`} strokeDashoffset={-offset}><title>{`${STATUS_CONFIG[item.status].label}: ${item.count} orders`}</title></circle>; })}</svg><div className="absolute inset-0 flex flex-col items-center justify-center text-center"><span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">All orders</span><span className="mt-1 text-3xl font-semibold tracking-tight">{total.toLocaleString()}</span></div></div></div>;
}

function LegendRow({ item, total }) { const config = STATUS_CONFIG[item.status]; return <div className="flex items-center justify-between gap-4 text-sm"><div className="flex min-w-0 items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: config.color }} /><span className="truncate text-slate-600">{config.label}</span></div><span className="shrink-0 font-semibold">{((item.count / total) * 100).toFixed(1)}%</span></div>; }
function StatusRow({ item, total }) { const config = STATUS_CONFIG[item.status]; const Icon = config.icon; return <div className="rounded-2xl border border-[#e9e1d9] bg-[#fffdfb] p-4"><div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${config.color}1A`, color: config.color }}><Icon size={17} /></span><div><p className="text-sm font-semibold">{config.label}</p><p className="text-xs text-slate-500">{config.description}</p></div></div><p className="text-lg font-semibold">{item.count.toLocaleString()}</p></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-[#f4f1eb]"><div className="h-full rounded-full" style={{ width: `${(item.count / total) * 100}%`, backgroundColor: config.color }} /></div></div>; }
function MetricCard({ label, value, detail, icon: Icon, accent = "coral" }) { const palette = accent === "teal" ? "bg-[#e4f3f0] text-[#1f6e63]" : "bg-[#fff0ed] text-[#e65b4d]"; return <div className="rounded-[1.75rem] border border-[#e9e1d9] bg-white p-5 shadow-sm"><div className="mb-5 flex items-center justify-between"><span className="text-sm font-medium text-slate-500">{label}</span><span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${palette}`}><Icon size={18} /></span></div><p className="truncate text-3xl font-semibold tracking-tight">{value}</p>{detail && <p className="mt-2 truncate text-sm text-slate-500">{detail}</p>}</div>; }
function EmptyState() { return <div className="rounded-[2rem] border border-[#e9e1d9] bg-white p-10 text-center shadow-sm"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0ed] text-[#e65b4d]"><ClipboardList size={21} /></span><h2 className="mt-5 text-xl font-semibold">No orders to analyse yet</h2><p className="mt-2 text-sm text-slate-500">Order status data will appear here after your first order is created.</p></div>; }
function ErrorState() { return <div className="rounded-[2rem] border border-[#f0c4be] bg-[#fff7f5] p-8 text-center shadow-sm"><h2 className="text-xl font-semibold">We couldn’t load order statuses.</h2><p className="mt-2 text-sm text-slate-600">Please refresh the page and try again.</p></div>; }
function PageSkeleton() { return <div className="min-h-screen bg-[#f4f1eb] px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl animate-pulse space-y-6"><div className="h-52 rounded-[2rem] bg-slate-200" /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{[...Array(4)].map((_, index) => <div key={index} className="h-36 rounded-[1.75rem] bg-slate-200" />)}</div><div className="grid h-96 gap-6 xl:grid-cols-2"><div className="rounded-[2rem] bg-slate-200" /><div className="rounded-[2rem] bg-slate-200" /></div></div></div>; }
