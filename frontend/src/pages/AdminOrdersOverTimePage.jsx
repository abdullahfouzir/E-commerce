import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, PackageCheck, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api";

const formatMonth = (month, options = { month: "short", year: "numeric" }) => {
  const date = new Date(`${month}-01T00:00:00`);
  return Number.isNaN(date.getTime()) ? month : new Intl.DateTimeFormat("en", options).format(date);
};

export default function AdminOrdersOverTimePage() {
  const [ordersByMonth, setOrdersByMonth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadOrdersOverTime = async () => {
      try {
        setError(false);
        const response = await api.get("/order/admin/orders_over_time");
        const records = Array.isArray(response.data?.orders_over_time)
          ? response.data.orders_over_time
          : [];

        setOrdersByMonth(
          records
            .map((record) => ({ month: record._id, count: Number(record.orderCount) || 0 }))
            .sort((a, b) => a.month.localeCompare(b.month)),
        );
      } catch (requestError) {
        setError(true);
        toast.error(requestError.response?.data?.message || "Unable to load order analytics.");
      } finally {
        setLoading(false);
      }
    };

    loadOrdersOverTime();
  }, []);

  const summary = useMemo(() => {
    const total = ordersByMonth.reduce((sum, item) => sum + item.count, 0);
    const peak = ordersByMonth.reduce(
      (highest, item) => (item.count > highest.count ? item : highest),
      { month: "", count: 0 },
    );
    const latest = ordersByMonth.at(-1);
    const previous = ordersByMonth.at(-2);
    const change = previous?.count ? ((latest.count - previous.count) / previous.count) * 100 : null;
    return { total, average: ordersByMonth.length ? total / ordersByMonth.length : 0, peak, latest, change };
  }, [ordersByMonth]);

  if (loading) return <PageSkeleton />;

  return (
    <div className="min-h-screen bg-[#f4f1eb] px-4 py-6 text-[#18212b] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[2rem] bg-[#18212b] p-6 text-white shadow-[0_24px_60px_rgba(24,33,43,0.16)] sm:p-8">
          <Link to="/admin" className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-[#f4b942]">
            <ArrowLeft size={16} /> Back to dashboard
          </Link>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#f4b942]">Order analytics</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Orders over time</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">Track monthly order volume and spot changes in customer demand.</p>
            </div>
            <div className="flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
              <CalendarDays size={15} className="text-[#f4b942]" /> Monthly view
            </div>
          </div>
        </div>

        {error ? <ErrorState /> : ordersByMonth.length === 0 ? <EmptyState /> : <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Order summary">
            <MetricCard label="Total orders" value={summary.total.toLocaleString()} icon={PackageCheck} />
            <MetricCard label="Monthly average" value={summary.average.toFixed(1)} icon={TrendingUp} />
            <MetricCard label="Busiest month" value={summary.peak.count.toLocaleString()} detail={formatMonth(summary.peak.month)} icon={CalendarDays} />
            <MetricCard label="Latest month" value={summary.latest.count.toLocaleString()} detail={summary.change === null ? formatMonth(summary.latest.month) : `${summary.change >= 0 ? "+" : ""}${summary.change.toFixed(1)}% vs previous`} icon={TrendingUp} accent={summary.change !== null && summary.change < 0 ? "coral" : "teal"} />
          </section>

          <section className="mt-6 rounded-[2rem] border border-[#e9e1d9] bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Monthly order volume</h2>
                <p className="mt-1 text-sm text-slate-500">Each bar represents all orders created in that month.</p>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-[#1f6e63]"><span className="h-2.5 w-2.5 rounded-full bg-[#1f6e63]" /> Orders</div>
            </div>
            <OrdersChart data={ordersByMonth} />
          </section>

          <section className="mt-6 rounded-[2rem] border border-[#e9e1d9] bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-xl font-semibold">Monthly breakdown</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {ordersByMonth.map((item) => <div key={item.month} className="rounded-2xl border border-[#e9e1d9] bg-[#fffdfb] px-4 py-3">
                <p className="text-sm text-slate-500">{formatMonth(item.month)}</p>
                <p className="mt-1 text-lg font-semibold">{item.count.toLocaleString()} <span className="text-sm font-medium text-slate-500">orders</span></p>
              </div>)}
            </div>
          </section>
        </>}
      </div>
    </div>
  );
}

function OrdersChart({ data }) {
  const width = 900;
  const height = 330;
  const padding = { top: 24, right: 24, bottom: 56, left: 52 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const max = Math.max(...data.map((item) => item.count), 1);
  const yMax = Math.ceil(max / 5) * 5 || 5;
  const yTicks = Array.from({ length: 5 }, (_, index) => (yMax / 4) * index);
  const bandWidth = chartWidth / data.length;
  const barWidth = Math.min(Math.max(bandWidth * 0.62, 12), 72);
  const labelStep = Math.max(1, Math.ceil(data.length / 7));
  const yFor = (value) => padding.top + chartHeight - (value / yMax) * chartHeight;

  return <div className="overflow-x-auto"><svg viewBox={`0 0 ${width} ${height}`} className="min-w-[620px] w-full" role="img" aria-label="Bar chart showing the number of orders each month">
    <defs><linearGradient id="ordersBars" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#1f6e63" /><stop offset="100%" stopColor="#155147" /></linearGradient></defs>
    {yTicks.map((tick) => { const y = yFor(tick); return <g key={tick}><line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#e9e1d9" strokeDasharray="4 6" /><text x={padding.left - 12} y={y + 4} textAnchor="end" className="fill-slate-400 text-[12px]">{Math.round(tick)}</text></g>; })}
    {data.map((item, index) => { const x = padding.left + index * bandWidth + (bandWidth - barWidth) / 2; const y = yFor(item.count); const barHeight = padding.top + chartHeight - y; const showLabel = index % labelStep === 0 || index === data.length - 1; return <g key={item.month}><rect x={x} y={y} width={barWidth} height={barHeight} rx="7" fill="url(#ordersBars)"><title>{`${formatMonth(item.month)}: ${item.count} orders`}</title></rect><text x={x + barWidth / 2} y={y - 8} textAnchor="middle" className="fill-[#1f6e63] text-[11px] font-semibold">{item.count}</text>{showLabel && <text x={x + barWidth / 2} y={height - 20} textAnchor="middle" className="fill-slate-500 text-[12px]">{formatMonth(item.month, { month: "short" })}</text>}</g>; })}
  </svg></div>;
}

function MetricCard({ label, value, detail, icon: Icon, accent = "coral" }) {
  const palette = accent === "teal" ? "bg-[#e4f3f0] text-[#1f6e63]" : "bg-[#fff0ed] text-[#e65b4d]";
  return <div className="rounded-[1.75rem] border border-[#e9e1d9] bg-white p-5 shadow-sm"><div className="mb-5 flex items-center justify-between"><span className="text-sm font-medium text-slate-500">{label}</span><span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${palette}`}><Icon size={18} /></span></div><p className="text-3xl font-semibold tracking-tight">{value}</p>{detail && <p className="mt-2 text-sm text-slate-500">{detail}</p>}</div>;
}

function EmptyState() { return <div className="rounded-[2rem] border border-[#e9e1d9] bg-white p-10 text-center shadow-sm"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0ed] text-[#e65b4d]"><PackageCheck size={21} /></span><h2 className="mt-5 text-xl font-semibold">No order history yet</h2><p className="mt-2 text-sm text-slate-500">This chart will appear once your store starts receiving orders.</p></div>; }
function ErrorState() { return <div className="rounded-[2rem] border border-[#f0c4be] bg-[#fff7f5] p-8 text-center shadow-sm"><h2 className="text-xl font-semibold">We couldn’t load the order history.</h2><p className="mt-2 text-sm text-slate-600">Please refresh the page and try again.</p></div>; }
function PageSkeleton() { return <div className="min-h-screen bg-[#f4f1eb] px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl animate-pulse space-y-6"><div className="h-52 rounded-[2rem] bg-slate-200" /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{[...Array(4)].map((_, index) => <div key={index} className="h-36 rounded-[1.75rem] bg-slate-200" />)}</div><div className="h-96 rounded-[2rem] bg-slate-200" /></div></div>; }
