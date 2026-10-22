import { ArrowLeft, CalendarDays, CheckCircle2, CircleAlert, CircleDollarSign, CreditCard, Mail, MapPin, Package, ReceiptText, UserRound } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/api";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const steps = ["pending", "confirmed", "processing", "shipped", "delivered"];
const statusStyles = {
  pending: "bg-[#fff5d8] text-[#9a6800]", confirmed: "bg-[#edf0fb] text-[#52638e]", processing: "bg-[#f8ebf5] text-[#99538f]", shipped: "bg-[#e7f3f7] text-[#27758e]", delivered: "bg-[#e4f3f0] text-[#1f6e63]", cancelled: "bg-[#fff0ed] text-[#c14d40]",
};

export default function AdminOrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setError(false);
        const response = await api.get(`/order/admin/${orderId}`);
        setOrder(response.data?.order || null);
      } catch (requestError) {
        setError(true);
        toast.error(requestError.response?.data?.message || "Unable to load this order.");
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [orderId]);

  const itemsTotal = useMemo(() => (order?.items || []).reduce((sum, item) => sum + (Number(item.priceAtPurchase) || 0) * (Number(item.quantity) || 0), 0), [order]);

  if (loading) return <PageSkeleton />;
  if (error || !order) return <ErrorState />;

  const status = order.orderStatus || "pending";
  const customer = typeof order.user === "object" && order.user ? order.user : null;
  const orderDate = order.createdAt ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(order.createdAt)) : "Not available";

  return <div className="min-h-screen bg-[#f4f1eb] px-4 py-6 text-[#18212b] sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl">
    <header className="mb-8 rounded-[2rem] bg-[#18212b] p-6 text-white shadow-[0_24px_60px_rgba(24,33,43,0.16)] sm:p-8"><Link to="/admin" className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-[#f4b942]"><ArrowLeft size={16} /> Back to dashboard</Link><p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#f4b942]">Order management</p><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Order details</h1><p className="mt-2 max-w-xl break-all font-mono text-sm text-slate-300">#{order._id}</p></div><div className="flex flex-wrap gap-2"><StatusBadge status={status} /><PaymentBadge status={order.paymentStatus} /></div></div></header>

    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><MetricCard label="Order total" value={money.format(Number(order.totalAmount) || itemsTotal)} icon={CircleDollarSign} /><MetricCard label="Items" value={(order.items?.length || 0).toLocaleString()} detail={`${order.items?.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) || 0} units`} icon={Package} /><MetricCard label="Order date" value={order.createdAt ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(order.createdAt)) : "-"} detail={orderDate} icon={CalendarDays} /><MetricCard label="Payment" value={capitalize(order.paymentStatus || "pending")} icon={CreditCard} accent={order.paymentStatus === "paid" ? "teal" : "coral"} /></section>

    <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]"><div className="rounded-[2rem] border border-[#e9e1d9] bg-white p-5 shadow-sm sm:p-7"><div className="mb-6 flex items-center justify-between"><div><h2 className="text-xl font-semibold">Order items</h2><p className="mt-1 text-sm text-slate-500">Products purchased in this order.</p></div><ReceiptText size={20} className="text-[#e65b4d]" /></div><div className="space-y-4">{(order.items || []).map((item, index) => <OrderItem key={item._id || index} item={item} />)}</div><div className="mt-6 flex items-center justify-between rounded-2xl bg-[#f8f4ef] px-5 py-4"><span className="font-medium text-slate-600">Order total</span><span className="text-xl font-semibold">{money.format(Number(order.totalAmount) || itemsTotal)}</span></div></div>
      <div className="space-y-6"><section className="rounded-[2rem] border border-[#e9e1d9] bg-white p-5 shadow-sm sm:p-6"><h2 className="text-xl font-semibold">Customer</h2><div className="mt-5 space-y-4"><CustomerRow icon={UserRound} label="Customer" value={customer?.username || "Customer account"} /><CustomerRow icon={Mail} label="Email" value={customer?.email || "Not available"} /><CustomerRow icon={MapPin} label="Customer ID" value={customer?._id || order.user || "Not available"} mono /></div></section><section className="rounded-[2rem] border border-[#e9e1d9] bg-white p-5 shadow-sm sm:p-6"><h2 className="text-xl font-semibold">Fulfillment progress</h2><p className="mt-1 text-sm text-slate-500">Current order stage: {capitalize(status)}</p><FulfillmentSteps status={status} /></section></div>
    </section>
  </div></div>;
}

function OrderItem({ item }) { const product = typeof item.product === "object" && item.product ? item.product : null; const name = product?.name || "Product no longer available"; const image = product?.images?.[0]?.secure_url; const quantity = Number(item.quantity) || 0; const price = Number(item.priceAtPurchase) || 0; return <div className="flex gap-4 rounded-2xl border border-[#e9e1d9] bg-[#fffdfb] p-4"><div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#fff0ed] text-[#e65b4d]">{image ? <img src={image} alt={name} className="h-full w-full object-cover" /> : <Package size={22} />}</div><div className="min-w-0 flex-1"><p className="truncate font-semibold">{name}</p><p className="mt-1 text-sm text-slate-500">{money.format(price)} x {quantity}</p>{!product && <p className="mt-1 truncate font-mono text-xs text-slate-400">Product ID: {item.product}</p>}</div><p className="shrink-0 font-semibold">{money.format(price * quantity)}</p></div>; }
function FulfillmentSteps({ status }) { if (status === "cancelled") return <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#fff0ed] px-4 py-3 text-sm text-[#c14d40]"><CircleAlert size={18} /> This order was cancelled.</div>; const completedStep = steps.indexOf(status); return <div className="mt-6">{steps.map((step, index) => { const done = index <= completedStep; const current = index === completedStep; return <div key={step} className="relative flex gap-3 pb-4 last:pb-0"><div className="relative z-10"><span className={`flex h-8 w-8 items-center justify-center rounded-full ${done ? "bg-[#1f6e63] text-white shadow-sm shadow-[#1f6e63]/30" : "bg-[#f4f1eb] text-slate-400"}`}>{done ? <CheckCircle2 size={16} /> : index + 1}</span>{index < steps.length - 1 && <span className={`absolute left-1/2 top-8 h-5 w-0.5 -translate-x-1/2 ${index < completedStep ? "bg-[#1f6e63]" : "bg-[#e9e1d9]"}`} />}</div><div className={`min-w-0 flex-1 rounded-xl px-3 py-1.5 ${done ? "bg-[#e4f3f0]" : "bg-transparent"}`}><div className="flex items-center justify-between gap-3"><span className={`text-sm font-semibold ${done ? "text-[#1f6e63]" : "text-slate-400"}`}>{capitalize(step)}</span>{current && <span className="rounded-full bg-[#1f6e63] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">Current</span>}</div>{done && <p className="mt-0.5 text-xs text-[#1f6e63]/75">{current ? "Order is currently at this stage" : "Completed"}</p>}</div></div>; })}</div>; }
function CustomerRow({ icon: Icon, label, value, mono = false }) { return <div className="flex items-start gap-3"><span className="mt-0.5 text-[#e65b4d]"><Icon size={17} /></span><div className="min-w-0"><p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p><p className={`mt-1 break-all text-sm font-medium ${mono ? "font-mono" : ""}`}>{value}</p></div></div>; }
function MetricCard({ label, value, detail, icon: Icon, accent = "coral" }) { const palette = accent === "teal" ? "bg-[#e4f3f0] text-[#1f6e63]" : "bg-[#fff0ed] text-[#e65b4d]"; return <div className="rounded-[1.75rem] border border-[#e9e1d9] bg-white p-5 shadow-sm"><div className="mb-5 flex items-center justify-between"><span className="text-sm font-medium text-slate-500">{label}</span><span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${palette}`}><Icon size={18} /></span></div><p className="truncate text-2xl font-semibold tracking-tight">{value}</p>{detail && <p className="mt-2 truncate text-sm text-slate-500">{detail}</p>}</div>; }
function StatusBadge({ status }) { return <span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${statusStyles[status] || statusStyles.pending}`}>{capitalize(status)}</span>; }
function PaymentBadge({ status }) { const paid = status === "paid"; return <span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${paid ? "bg-[#e4f3f0] text-[#1f6e63]" : "bg-white/10 text-slate-200"}`}>{capitalize(status || "pending")} payment</span>; }
function ErrorState() { return <div className="min-h-screen bg-[#f4f1eb] px-4 py-6 text-[#18212b] sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl rounded-[2rem] border border-[#f0c4be] bg-[#fff7f5] p-10 text-center shadow-sm"><CircleAlert className="mx-auto text-[#e65b4d]" size={24} /><h1 className="mt-4 text-xl font-semibold">We couldn’t load this order.</h1><p className="mt-2 text-sm text-slate-600">Check the order ID or return to the dashboard.</p><Link to="/admin" className="mt-6 inline-flex rounded-xl bg-[#18212b] px-4 py-2 text-sm font-semibold text-white">Back to dashboard</Link></div></div>; }
function PageSkeleton() { return <div className="min-h-screen bg-[#f4f1eb] px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl animate-pulse space-y-6"><div className="h-52 rounded-[2rem] bg-slate-200" /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{[...Array(4)].map((_, index) => <div key={index} className="h-36 rounded-[1.75rem] bg-slate-200" />)}</div><div className="grid h-96 gap-6 xl:grid-cols-2"><div className="rounded-[2rem] bg-slate-200" /><div className="rounded-[2rem] bg-slate-200" /></div></div></div>; }
function capitalize(value) { return String(value || "").replace(/^./, (letter) => letter.toUpperCase()); }
