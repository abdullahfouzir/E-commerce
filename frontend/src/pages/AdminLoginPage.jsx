import { useState } from "react"
import { ArrowRight, KeyRound, LayoutDashboard, LockKeyhole, UserRound } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import api from "../api/api"

function AdminLoginPage() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ username: "", password: "" })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event) {
        event.preventDefault()
        setError("")
        setLoading(true)

        try {
            const response = await api.post("/auth/admin/login", form)
            if (response.data.isAdmin !== true) {
                setError("This account does not have administrator access.")
                return
            }

            localStorage.setItem("accessToken", response.data.accessToken)
            navigate("/admin", { replace: true })
        } catch (loginError) {
            setError(loginError.response?.data?.message || "Unable to sign in. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    function handleChange(event) {
        const { name, value } = event.target
        setForm((current) => ({ ...current, [name]: value }))
    }

    return (
        <main className="min-h-screen bg-[#f4f1eb] px-4 py-6 text-[#18212b] sm:px-6 lg:px-8">
            <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-4xl bg-white shadow-[0_24px_80px_rgba(24,33,43,0.12)] lg:grid-cols-[0.9fr_1.1fr]">
                <section className="relative hidden overflow-hidden bg-[#18212b] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
                    <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-32 border-[#f4b942]/15" />
                    <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full border-32 border-[#f26b5e]/15" />

                    <div className="relative">
                        <div className="mb-16 flex items-center gap-3 text-sm font-semibold tracking-[0.18em] text-[#f4b942] uppercase">
                            <LayoutDashboard size={19} strokeWidth={2.5} />
                            Luma Market
                        </div>
                        <p className="max-w-sm text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
                            Your store, all in one place.
                        </p>
                        <p className="mt-6 max-w-sm text-base leading-7 text-slate-300">
                            Manage products, orders, and customer experiences from your workspace.
                        </p>
                    </div>

                    <p className="relative text-sm text-slate-400">A secure space for your store team.</p>
                </section>

                <section className="flex items-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
                    <form className="w-full max-w-md" onSubmit={handleSubmit}>
                        <div className="mb-10">
                            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff7df] text-[#9a6b00] lg:hidden">
                                <KeyRound size={21} />
                            </div>
                            <p className="mb-3 text-sm font-semibold tracking-[0.16em] text-[#9a6b00] uppercase">Admin workspace</p>
                            <h1 className="text-4xl font-semibold tracking-tight text-[#18212b]">Sign in to manage your store</h1>
                            <p className="mt-3 text-sm leading-6 text-slate-500">Use your administrator credentials to continue.</p>
                        </div>

                        <div className="space-y-5">
                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-[#18212b]">Username</span>
                                <span className="relative block">
                                    <UserRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#d49b19] focus:bg-white focus:ring-4 focus:ring-[#f4b942]/20"
                                        type="text"
                                        name="username"
                                        placeholder="Administrator username"
                                        autoComplete="username"
                                        value={form.username}
                                        onChange={handleChange}
                                        required
                                    />
                                </span>
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-[#18212b]">Password</span>
                                <span className="relative block">
                                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#d49b19] focus:bg-white focus:ring-4 focus:ring-[#f4b942]/20"
                                        type="password"
                                        name="password"
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </span>
                            </label>
                        </div>

                        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

                        <button
                            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#18212b] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#18212b]/15 transition hover:bg-[#293747] focus:outline-none focus:ring-4 focus:ring-[#18212b]/20 disabled:cursor-not-allowed disabled:opacity-60"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign in to admin"}
                            {!loading && <ArrowRight size={18} />}
                        </button>

                        <p className="mt-8 text-center text-sm text-slate-500">
                            Shopping instead? <Link className="font-semibold text-[#e65b4d] transition hover:text-[#d94f42]" to="/login">Customer sign in</Link>
                        </p>
                    </form>
                </section>
            </div>
        </main>
    )
}

export default AdminLoginPage
