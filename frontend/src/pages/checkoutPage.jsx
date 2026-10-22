import { useEffect, useState } from "react"
import { Elements } from "@stripe/react-stripe-js"
import { Link } from "react-router-dom"
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react"

import { stripePromise } from "../stripe"
import api from "../api/api"
import CheckoutForm from "./CheckoutForm"
import StoreHeader from "../components/StoreHeader"

function CheckoutPage() {
    const [clientSecret, setClientSecret] = useState(null)
    const [error, setError] = useState("")

    useEffect(() => {
        const createPayment = async () => {
            try {
                const response = await api.post("/checkout")
                setClientSecret(response.data.clientSecret)
            } catch (requestError) {
                setError(requestError.response?.data?.message || "We couldn't start your checkout. Please try again.")
            }
        }

        createPayment()
    }, [])

    return (
        <div className="min-h-screen bg-[#f7f5f1] text-[#18212b]">
            <StoreHeader />
            <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
                <Link to="/cart" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#18212b]">
                    <ArrowLeft size={16} /> Back to bag
                </Link>
                <div className="mt-6 rounded-[2rem] border border-[#e9e1d9] bg-white p-6 shadow-sm sm:p-9">
                    <div className="mb-8 flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e65b4d]">Almost yours</p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Secure checkout</h1>
                            <p className="mt-2 text-sm leading-6 text-slate-500">Complete your payment securely with our encrypted checkout.</p>
                        </div>
                        <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e4f3f0] text-[#1f6e63] sm:flex">
                            <ShieldCheck size={21} />
                        </span>
                    </div>
                    {error ? (
                        <div className="rounded-2xl border border-[#f3d4ce] bg-[#fff7f5] p-5">
                            <p className="text-sm font-semibold text-[#b24a3c]">Checkout is unavailable</p>
                            <p className="mt-1 text-sm leading-6 text-slate-600">{error}</p>
                            <Link to="/cart" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#18212b]">
                                Return to your bag <ArrowRight size={15} />
                            </Link>
                        </div>
                    ) : clientSecret ? (
                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                            <CheckoutForm />
                        </Elements>
                    ) : (
                        <div className="animate-pulse space-y-4" role="status" aria-live="polite">
                            <p className="text-sm font-medium text-slate-500">Preparing your secure payment...</p>
                            <div className="h-12 rounded-xl bg-slate-100" />
                            <div className="h-12 rounded-xl bg-slate-100" />
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default CheckoutPage
