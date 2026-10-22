import { Navigate, Outlet, useLocation } from "react-router-dom"

const getValidAccessTokenPayload = () => {
    const accessToken = localStorage.getItem("accessToken")

    if (!accessToken) {
        return null
    }

    try {
        const payloadSegment = accessToken.split(".")[1]
        const base64Payload = payloadSegment
            .replace(/-/g, "+")
            .replace(/_/g, "/")
            .padEnd(Math.ceil(payloadSegment.length / 4) * 4, "=")
        const payload = JSON.parse(atob(base64Payload))

        if (!payload.exp || payload.exp * 1000 <= Date.now()) {
            localStorage.removeItem("accessToken")
            return null
        }

        return payload
    } catch {
        localStorage.removeItem("accessToken")
        return null
    }
}

function ProtectedRoute({ adminOnly = false }) {
    const location = useLocation()
    const payload = getValidAccessTokenPayload()

    if (!payload) {
        const loginPath = adminOnly ? "/admin/login" : "/login"
        return <Navigate to={loginPath} replace state={{ from: location }} />
    }

    if (adminOnly && payload.role !== "admin") {
        return <Navigate to="/admin/login" replace state={{ from: location }} />
    }

    return <Outlet />
}

export default ProtectedRoute
