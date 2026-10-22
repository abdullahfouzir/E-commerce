import { Check } from "lucide-react"
import { Link } from "react-router-dom"
import StoreHeader from "../components/StoreHeader"

function PaymentSuccess() {
    return (
        <div className="min-h-screen bg-[#f7f5f1] text-[#18212b]">
            <StoreHeader />
            <main className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:py-28">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e4f3f0] text-[#1f6e63]">
                    <Check size={30} strokeWidth={2.5} />
                </span>
                <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-[#1f6e63]">Order confirmed</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Thank you for your order.</h1>
                <p className="mt-4 max-w-lg text-sm leading-7 text-slate-500">
                    Your payment was successful. We’re getting your thoughtful finds ready to ship.
                </p>
                <Link to="/home" className="mt-8 inline-flex items-center justify-center rounded-full bg-[#18212b] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#2b3947]">
                    Continue shopping
                </Link>
            </main>
        </div>
    )
}

export default PaymentSuccess
