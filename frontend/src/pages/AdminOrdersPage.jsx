import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, ChevronRight, ClipboardList, Filter, Package, Search, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const statusStyles = { pending: "bg-[#fff5d8] text-[#9a6800]", confirmed: "bg-[#edf0fb] text-[#52638e]", processing: "bg-[#f8ebf5] text-[#99538f]", shipped: "bg-[#e7f3f7] text-[#27758e]", delivered: "bg-[#e4f3f0] text-[#1f6e63]", cancelled: "bg-[#fff0ed] text-[#c14d40]" };

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setError(false);
        const response = await api.get("/order/admin/orders");
        setOrders(Array.isArray(response.data?.orders) ? response.data.orders : []);
      } catch (requestError) {
        setError(true);
        toast.error(requestError.response?.data?.message || "Unable to load orders.");
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const customer = typeof order.user === "object" ? order.user : null;
    const matchesQuery = !query || [order._id, customer?.username, customer?.email].filter(Boolean).some((value) => value.toLowerCase().includes(query.toLowerCase()));
    return matchesQuery && (statusFilter === "all" || order.orderStatus === statusFilter) && (paymentFilter === "all" || order.paymentStatus === paymentFilter);
  }), [orders, paymentFilter, query, statusFilter]);

  const summary = useMemo(() => ({ total: orders.length, paid: orders.filter((order) => order.paymentStatus === "paid").length, active: orders.filter((order) => ["confirmed", "processing", "shipped"].includes(order.orderStatus)).length }), [orders]);

  if (loading) return <PageSkeleton />;

  return <div className="min-h-screen bg-[#f4f1eb] px-4 py-6 text-[#18212b] sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl">
    <header className="mb-8 rounded-[2rem] bg-[#18212b] p-6 text-white shadow-[0_24px_60px_rgba(24,33,43,0.16)] sm:p-8"><Link to="/admin" className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-[#f4b942]"><ArrowLeft size={16} /> Back to dashboard</Link><p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#f4b942]">Order management</p><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Orders</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">Review every customer order and jump into its full details.</p></div><div className="flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200"><ClipboardList size={15} className="text-[#f4b942]" /> {summary.total} total orders</div></div></header>

    {error ? <ErrorState /> : <>
      <section className="grid gap-4 md:grid-cols-3"><SummaryCard label="All orders" value={summary.total} icon={ClipboardList} /><SummaryCard label="Paid orders" value={summary.paid} icon={CheckCircle2} accent="teal" /><SummaryCard label="Active fulfillment" value={summary.active} icon={Package} /></section>
      <section className="mt-6 rounded-[2rem] border border-[#e9e1d9] bg-white p-4 shadow-sm sm:p-6"><div className="flex flex-col gap-3 lg:flex-row"><label className="relative flex-1"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by order ID, customer or email" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#e65b4d] focus:bg-white focus:ring-4 focus:ring-[#e65b4d]/10" /></label><div className="flex gap-3"><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-w-36 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-[#e65b4d]"><option value="all">All statuses</option>{Object.keys(statusStyles).map((status) => <option key={status} value={status}>{capitalize(status)}</option>)}</select><select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)} className="min-w-32 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-[#e65b4d]"><option value="all">All payments</option><option value="paid">Paid</option><option value="pending">Pending</option></select></div></div></section>
      <section className="mt-6 overflow-hidden rounded-[2rem] border border-[#e9e1d9] bg-white shadow-sm"><div className="flex items-center justify-between border-b border-[#e9e1d9] px-5 py-5 sm:px-7"><div><h2 className="text-xl font-semibold">Order list</h2><p className="mt-1 text-sm text-slate-500">{filteredOrders.length} matching order{filteredOrders.length === 1 ? "" : "s"}</p></div><Filter size={19} className="text-[#e65b4d]" /></div>{filteredOrders.length === 0 ? <EmptyState hasOrders={orders.length > 0} /> : <><div className="hidden overflow-x-auto lg:block"><table className="w-full text-left"><thead className="bg-[#f8f4ef] text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-7 py-4 font-semibold">Order</th><th className="px-5 py-4 font-semibold">Customer</th><th className="px-5 py-4 font-semibold">Date</th><th className="px-5 py-4 font-semibold">Total</th><th className="px-5 py-4 font-semibold">Payment</th><th className="px-5 py-4 font-semibold">Status</th><th className="px-7 py-4" /></tr></thead><tbody>{filteredOrders.map((order) => <OrderRow key={order._id} order={order} />)}</tbody></table></div><div className="divide-y divide-[#e9e1d9] lg:hidden">{filteredOrders.map((order) => <OrderCard key={order._id} order={order} />)}</div></>}</section>
    </>}
  </div></div>;
}

function OrderRow({ order }) { const customer = typeof order.user === "object" ? order.user : null; return <tr className="border-b border-[#f0ece7] last:border-0 transition hover:bg-[#fffdfb]"><td className="px-7 py-5"><p className="font-mono text-sm font-semibold">#{order._id.slice(-8).toUpperCase()}</p><p className="mt-1 max-w-36 truncate text-xs text-slate-400">{itemCount(order)} items</p></td><td className="px-5 py-5"><p className="text-sm font-medium">{customer?.username || "Customer"}</p><p className="mt-1 max-w-44 truncate text-xs text-slate-500">{customer?.email || "No email available"}</p></td><td className="px-5 py-5 text-sm text-slate-600">{formatDate(order.createdAt)}</td><td className="px-5 py-5 text-sm font-semibold">{money.format(Number(order.totalAmount) || 0)}</td><td className="px-5 py-5"><PaymentBadge status={order.paymentStatus} /></td><td className="px-5 py-5"><StatusBadge status={order.orderStatus} /></td><td className="px-7 py-5 text-right"><OrderLink id={order._id} /></td></tr>; }
function OrderCard({ order }) { const customer = typeof order.user === "object" ? order.user : null; return <div className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-sm font-semibold">#{order._id.slice(-8).toUpperCase()}</p><p className="mt-1 text-sm text-slate-500">{customer?.username || "Customer"}</p></div><StatusBadge status={order.orderStatus} /></div><div className="mt-4 flex items-center justify-between text-sm"><span className="text-slate-500">{formatDate(order.createdAt)}</span><span className="font-semibold">{money.format(Number(order.totalAmount) || 0)}</span></div><div className="mt-4 flex items-center justify-between"><PaymentBadge status={order.paymentStatus} /><OrderLink id={order._id} /></div></div>; }
function OrderLink({ id }) { return <Link to={`/admin/orders/${id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-[#1f6e63] transition hover:text-[#155147]">View <ChevronRight size={16} /></Link>; }
function SummaryCard({ label, value, icon: Icon, accent = "coral" }) { const palette = accent === "teal" ? "bg-[#e4f3f0] text-[#1f6e63]" : "bg-[#fff0ed] text-[#e65b4d]"; return <div className="rounded-[1.75rem] border border-[#e9e1d9] bg-white p-5 shadow-sm"><div className="mb-5 flex items-center justify-between"><span className="text-sm font-medium text-slate-500">{label}</span><span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${palette}`}><Icon size={18} /></span></div><p className="text-3xl font-semibold tracking-tight">{value.toLocaleString()}</p></div>; }
function StatusBadge({ status }) { return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status] || statusStyles.pending}`}>{capitalize(status || "pending")}</span>; }
function PaymentBadge({ status }) { const paid = status === "paid"; return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${paid ? "bg-[#e4f3f0] text-[#1f6e63]" : "bg-slate-100 text-slate-600"}`}>{capitalize(status || "pending")}</span>; }
function EmptyState({ hasOrders }) { return <div className="p-12 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0ed] text-[#e65b4d]">{hasOrders ? <Search size={21} /> : <XCircle size={21} />}</span><h3 className="mt-5 text-lg font-semibold">{hasOrders ? "No matching orders" : "No orders yet"}</h3><p className="mt-2 text-sm text-slate-500">{hasOrders ? "Try clearing a filter or using a different search term." : "Orders from your store will appear here."}</p></div>; }
function ErrorState() { return <div className="rounded-[2rem] border border-[#f0c4be] bg-[#fff7f5] p-8 text-center shadow-sm"><h2 className="text-xl font-semibold">We couldn’t load orders.</h2><p className="mt-2 text-sm text-slate-600">Please refresh the page and try again.</p></div>; }
function PageSkeleton() { return <div className="min-h-screen bg-[#f4f1eb] px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl animate-pulse space-y-6"><div className="h-52 rounded-[2rem] bg-slate-200" /><div className="grid gap-4 md:grid-cols-3">{[...Array(3)].map((_, index) => <div key={index} className="h-36 rounded-[1.75rem] bg-slate-200" />)}</div><div className="h-96 rounded-[2rem] bg-slate-200" /></div></div>; }
function itemCount(order) { return `${order.items?.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) || 0}`; }
function formatDate(date) { return date ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date)) : "Not available"; }
function capitalize(value) { return String(value || "").replace(/^./, (letter) => letter.toUpperCase()); }
