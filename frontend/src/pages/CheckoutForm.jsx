import {
    PaymentElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js"
import { useState } from "react"
import { ArrowRight, LockKeyhole } from "lucide-react"

function CheckoutForm() {
    const stripe = useStripe()
    const elements = useElements()
    const [errorMessage, setErrorMessage] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!stripe || !elements || submitting) return

        setErrorMessage("")
        setSubmitting(true)

        try {
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: new URL("/payment-success", window.location.origin).toString()
                }
            })

            if (error) setErrorMessage(error.message || "Your payment couldn't be completed. Please try again.")
        } catch (error) {
            setErrorMessage(error.message || "Your payment couldn't be completed. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement options={{ layout: "tabs" }} />
            {errorMessage && (
                <p role="alert" className="rounded-xl bg-[#fff0ed] px-4 py-3 text-sm text-[#b24a3c]">
                    {errorMessage}
                </p>
            )}
            <button
                type="submit"
                disabled={!stripe || submitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#18212b] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#2b3947] focus:outline-none focus:ring-4 focus:ring-[#18212b]/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <LockKeyhole size={16} />
                {submitting ? "Processing payment..." : "Pay securely"}
                {!submitting && <ArrowRight size={16} />}
            </button>
        </form>
    )
}

export default CheckoutForm