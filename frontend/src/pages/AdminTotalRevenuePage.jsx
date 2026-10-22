import { useEffect, useState } from "react";
import { ArrowLeft, BadgeDollarSign, CheckCircle2, CircleDollarSign, ReceiptText } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function AdminTotalRevenuePage() {
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadRevenue = async () => {
      try {
        setError(false);
        const response = await api.get("/order/admin/totalRevenue");
        setRevenue(Number(response.data?.totalRevenue) || 0);
      } catch (requestError) {
        setError(true);
        toast.error(requestError.response?.data?.message || "Unable to load total revenue.");
      } finally {
        setLoading(false);
      }
    };

    loadRevenue();
  }, []);

  if (loading) return <PageSkeleton />;

  return (
    <div className="min-h-screen bg-[#f4f1eb] px-4 py-6 text-[#18212b] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 rounded-[2rem] bg-[#18212b] p-6 text-white shadow-[0_24px_60px_rgba(24,33,43,0.16)] sm:p-8">
          <Link to="/admin" className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-[#f4b942]"><ArrowLeft size={16} /> Back to dashboard</Link>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#f4b942]">Revenue analytics</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Total revenue</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">A live total of all revenue from successfully paid orders.</p></div><div className="flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200"><CheckCircle2 size={15} className="text-[#f4b942]" /> Paid orders only</div></div>
        </header>

        {error ? <ErrorState /> : <>
          <section className="overflow-hidden rounded-[2rem] bg-[#1f6e63] p-6 text-white shadow-[0_24px_60px_rgba(31,110,99,0.18)] sm:p-9">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div><div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#f4b942]"><CircleDollarSign size={24} /></div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d8efe9]">Total paid revenue</p><p className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">{money.format(revenue)}</p><p className="mt-4 max-w-md text-sm leading-6 text-[#d8efe9]">This total updates from all orders with a successful payment status.</p></div>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1"><InfoCard icon={ReceiptText} title="Revenue basis" text="Order total amount" /><InfoCard icon={CheckCircle2} title="Payment filter" text="Paid orders" /></div>
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[2rem] border border-[#e9e1d9] bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff0ed] text-[#e65b4d]"><BadgeDollarSign size={19} /></span><div><h2 className="text-xl font-semibold">Revenue summary</h2><p className="text-sm text-slate-500">Current paid-order aggregate</p></div></div><div className="mt-7 rounded-2xl bg-[#f8f4ef] p-5"><p className="text-sm font-medium text-slate-500">Available paid revenue</p><p className="mt-2 text-3xl font-semibold tracking-tight">{money.format(revenue)}</p></div></div>
            <div className="rounded-[2rem] border border-[#e9e1d9] bg-white p-6 shadow-sm"><h2 className="text-xl font-semibold">What is included?</h2><div className="mt-5 space-y-4"><DetailRow label="Payment status" value="paid" /><DetailRow label="Amount field" value="totalAmount" /><DetailRow label="Source" value="All store orders" /></div></div>
          </section>
        </>}
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, text }) { return <div className="min-w-48 rounded-2xl border border-white/10 bg-white/10 px-4 py-3"><div className="flex items-center gap-2 text-[#f4b942]"><Icon size={16} /><span className="text-sm font-medium text-white">{title}</span></div><p className="mt-1 text-sm text-[#d8efe9]">{text}</p></div>; }
function DetailRow({ label, value }) { return <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#e9e1d9] bg-[#fffdfb] px-4 py-3"><span className="text-sm text-slate-500">{label}</span><span className="text-sm font-semibold">{value}</span></div>; }
function ErrorState() { return <div className="rounded-[2rem] border border-[#f0c4be] bg-[#fff7f5] p-8 text-center shadow-sm"><h2 className="text-xl font-semibold">We couldn’t load total revenue.</h2><p className="mt-2 text-sm text-slate-600">Please refresh the page and try again.</p></div>; }
function PageSkeleton() { return <div className="min-h-screen bg-[#f4f1eb] px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl animate-pulse space-y-6"><div className="h-52 rounded-[2rem] bg-slate-200" /><div className="h-80 rounded-[2rem] bg-slate-200" /><div className="grid h-48 gap-6 lg:grid-cols-2"><div className="rounded-[2rem] bg-slate-200" /><div className="rounded-[2rem] bg-slate-200" /></div></div></div>; }
