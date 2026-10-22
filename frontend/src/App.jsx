import { useCallback, useEffect, useState } from "react"
import { Routes, Route, useLocation, useNavigate, useParams } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import api from "./api/api.js"
import CheckoutPage from "./pages/checkoutPage"
import PaymentSuccess from "./pages/paymentSucess"
import HomePage from "./pages/HomePage"
import ProductDetailPage from "./pages/ProductDetailPage"
import CartPage from "./pages/CartPage"
import AuthPage from "./pages/AuthPage"
import AdminLoginPage from "./pages/AdminLoginPage"
import AdminDashboard from "./pages/AdminDashboard"
import AdminCategoriesPage from "./pages/AdminCategoriesPage"
import AdminProductsPage from "./pages/AdminProductsPage"
import AdminUsersPage from "./pages/AdminUsersPage"
import AdminOrdersOverTimePage from "./pages/AdminOrdersOverTimePage"
import AdminSalesByCategoryPage from "./pages/AdminSalesByCategoryPage"
import AdminOrderStatusDistributionPage from "./pages/AdminOrderStatusDistributionPage"
import AdminTotalRevenuePage from "./pages/AdminTotalRevenuePage"
import AdminOrderDetailPage from "./pages/AdminOrderDetailPage"
import AdminOrdersPage from "./pages/AdminOrdersPage"
import AdminLowStockProductsPage from "./pages/AdminLowStockProductsPage"
import AdminTopProductsPage from "./pages/AdminTopProductsPage"
import AdminSearchProductPage from "./pages/AdminSearchProductPage"
import AdminFilterByStockPage from "./pages/AdminFilterByStockPage"
import AdminFilterByPricePage from "./pages/AdminFilterByPricePage"
import AdminProductsByCategoryPage from "./pages/AdminProductsByCategoryPage"
import AdminSearchCategoryPage from "./pages/AdminSearchCategoryPage"
import AdminLayout from "./components/AdminLayout"
import ProtectedRoute from "./components/ProtectedRoute"
import StoreFooter from "./components/StoreFooter"
import StoreHeader from "./components/StoreHeader"
import {
    addProductToCart,
    clearCart,
    fetchCart,
    removeCartProduct,
} from "./services/cartService.js"

function normalizeProduct(product) {
    return {
        ...product,
        id: String(product._id ?? product.id),
        price: Number(product.price) || 0,
        rating: Number(product.rating) || 0,
        img: product.img ?? (
            Array.isArray(product.images)
                ? product.images[0]?.secure_url
                : product.images?.secure_url
        ),
    }
}

function addProductToUserCart(product) {
    const productId = product._id ?? product.id

    if (!productId) {
        throw new Error("This product is missing its ID and cannot be added to cart.")
    }

    return addProductToCart(productId)
}

function ProductDetailRoute({ cartItemCount, onAddToCart }) {
    const { productId } = useParams()
    const navigate = useNavigate()
    const [product, setProduct] = useState(null)
    const [products, setProducts] = useState([])
    const [status, setStatus] = useState("loading")
    const [error, setError] = useState("")
    const [retryCount, setRetryCount] = useState(0)

    useEffect(() => {
        let isCurrentRequest = true

        async function loadProduct() {
            setStatus("loading")
            setError("")

            try {
                const [productResponse, productsResponse] = await Promise.all([
                    api.get(`/product/getProduct/${encodeURIComponent(productId)}`),
                    api.get("/product/getProducts"),
                ])
                const responseProduct = productResponse.data?.product
                const responseProducts = productsResponse.data?.products

                if (!responseProduct || !Array.isArray(responseProducts)) {
                    throw new Error("The server returned an invalid product response.")
                }

                if (isCurrentRequest) {
                    setProduct(normalizeProduct(responseProduct))
                    setProducts(responseProducts.map(normalizeProduct))
                    setStatus("success")
                }
            } catch (requestError) {
                if (isCurrentRequest) {
                    setError(
                        requestError.response?.data?.message ||
                            requestError.message ||
                            "Unable to load this product."
                    )
                    setStatus("error")
                }
            }
        }

        loadProduct()

        return () => {
            isCurrentRequest = false
        }
    }, [productId, retryCount])

    function setPage(page) {
        navigate(page === "cart" ? "/cart" : "/home")
    }

    function selectProduct(selectedProduct) {
        const selectedProductId = selectedProduct._id ?? selectedProduct.id
        if (selectedProductId) {
            navigate(`/product/${selectedProductId}`)
        }
    }

    return (
        <div className="min-h-screen">
            <StoreHeader favs={[]} cartItemCount={cartItemCount} setPage={setPage} />
            <div className="pt-[100px]">
                {status === "loading" ? (
                    <p role="status" className="mx-auto max-w-6xl px-4 py-10 text-center text-[#7b7b7b]">
                        Loading product...
                    </p>
                ) : status === "error" ? (
                    <section className="mx-auto my-10 max-w-6xl rounded-[5px] border border-[#e5e5e5d5] bg-white p-8 text-center">
                        <h1 className="mb-2 text-xl font-bold">We couldn&apos;t load this product</h1>
                        <p role="alert" className="mb-4 text-sm text-[#7b7b7b]">{error}</p>
                        <button
                            type="button"
                            onClick={() => setRetryCount((count) => count + 1)}
                            className="cursor-pointer rounded-[3px] bg-[#ff8716] px-5 py-2 font-semibold text-white hover:bg-[#f47600]"
                        >
                            Try again
                        </button>
                    </section>
                ) : (
                    <ProductDetailPage
                        product={product}
                        products={products}
                        onAddToCart={onAddToCart}
                        setPage={setPage}
                        onSelectProduct={selectProduct}
                    />
                )}
            </div>
            <StoreFooter />
        </div>
    )
}

function CustomerAuthPage({ mode }) {
    const navigate = useNavigate()
    const location = useLocation()

    function handleLoginSuccess(accessToken) {
        localStorage.setItem("accessToken", accessToken)
        navigate(location.state?.from || "/home", { replace: true })
    }

    return <AuthPage mode={mode} onLoginSuccess={handleLoginSuccess} />
}

function App() {
    const location = useLocation()
    const navigate = useNavigate()
    const [cartItems, setCartItems] = useState([])
    const [cartStatus, setCartStatus] = useState("loading")
    const [cartError, setCartError] = useState("")
    const [cartRetryCount, setCartRetryCount] = useState(0)
    const accessToken = localStorage.getItem("accessToken")

    const refreshCart = useCallback(async () => {
        try {
            const items = await fetchCart()
            setCartItems(items)
            setCartStatus("success")
        } catch (requestError) {
            setCartError(requestError.message || "Unable to load your cart.")
            setCartStatus("error")
        }
    }, [])

    useEffect(() => {
        let isCurrentRequest = true

        async function loadCart() {
            try {
                const items = await fetchCart()
                if (isCurrentRequest) {
                    setCartItems(items)
                    setCartStatus("success")
                    setCartError("")
                }
            } catch (requestError) {
                if (isCurrentRequest) {
                    setCartError(requestError.message || "Unable to load your cart.")
                    setCartStatus("error")
                }
            }
        }

        loadCart()

        return () => {
            isCurrentRequest = false
        }
    }, [accessToken, location.pathname, cartRetryCount])

    async function addProductToUserCartAndRefresh(product) {
        await addProductToUserCart(product)
        await refreshCart()
    }

    async function removeProductFromCart(productId) {
        await removeCartProduct(productId)
        await refreshCart()
    }

    async function clearUserCart() {
        await clearCart()
        await refreshCart()
    }

    function setPage(page) {
        if (page === "cart") {
            setCartStatus("loading")
        }
        navigate(page === "cart" ? "/cart" : "/home")
    }

    const cartItemCount = cartItems.reduce(
        (count, item) => count + (Number(item.quantity) || 0),
        0
    )

    return (
        <>
            <Routes>
                <Route path="/login" element={<CustomerAuthPage mode="login" />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/register" element={<CustomerAuthPage mode="register" />} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<HomePage onAddToCart={addProductToUserCartAndRefresh} cartItemCount={cartItemCount} />} />
                    <Route path="/home" element={<HomePage onAddToCart={addProductToUserCartAndRefresh} cartItemCount={cartItemCount} />} />
                    <Route path="/product/:productId" element={<ProductDetailRoute cartItemCount={cartItemCount} onAddToCart={addProductToUserCartAndRefresh} />} />
                    <Route path="/chekoutpage" element={<CheckoutPage />} />
                    <Route path="/payment-success" element={<PaymentSuccess />} />
                    <Route
                        path="/cart"
                        element={
                            <>
                                <StoreHeader favs={[]} cartItemCount={cartItemCount} setPage={setPage} />
                                <div className="min-h-screen bg-[#f8f8f8] pt-[100px]">
                                    <CartPage
                                        items={cartItems}
                                        status={cartStatus}
                                        error={cartError}
                                        onRefresh={() => {
                                            setCartStatus("loading")
                                            setCartRetryCount((count) => count + 1)
                                        }}
                                        onRemoveProduct={removeProductFromCart}
                                        onClearCart={clearUserCart}
                                        setPage={setPage}
                                    />
                                </div>
                                <StoreFooter />
                            </>
                        }
                    />
                </Route>
                <Route element={<ProtectedRoute adminOnly />}>
                    <Route element={<AdminLayout />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/categories" element={<AdminCategoriesPage />} />
                        <Route path="/admin/products" element={<AdminProductsPage />} />
                        <Route path="/admin/users" element={<AdminUsersPage />} />
                        <Route path="/admin/orders-over-time" element={<AdminOrdersOverTimePage />} />
                        <Route path="/admin/sales-by-category" element={<AdminSalesByCategoryPage />} />
                        <Route path="/admin/order-status-distribution" element={<AdminOrderStatusDistributionPage />} />
                        <Route path="/admin/total-revenue" element={<AdminTotalRevenuePage />} />
                        <Route path="/admin/orders/:orderId" element={<AdminOrderDetailPage />} />
                        <Route path="/admin/orders" element={<AdminOrdersPage />} />
                        <Route path="/admin/low-stock-products" element={<AdminLowStockProductsPage />} />
                        <Route path="/admin/top-products" element={<AdminTopProductsPage />} />
                        <Route path="/admin/search-product" element={<AdminSearchProductPage />} />
                        <Route path="/admin/filter-by-stock" element={<AdminFilterByStockPage />} />
                        <Route path="/admin/filter-by-price" element={<AdminFilterByPricePage />} />
                        <Route path="/admin/products-by-category" element={<AdminProductsByCategoryPage />} />
                        <Route path="/admin/search-category" element={<AdminSearchCategoryPage />} />
                    </Route>
                </Route>
            </Routes>

            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#18212b',
                        color: '#fff',
                        borderRadius: '12px',
                        fontSize: '14px',
                        padding: '12px 14px',
                    },
                    success: {
                        style: {
                            background: '#1f6e63',
                        },
                    },
                    error: {
                        style: {
                            background: '#b24a3c',
                        },
                    },
                }}
            />
        </>
    )
}

export default App
