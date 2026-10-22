const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

async function cartRequest(path, options = {}) {
  const accessToken = localStorage.getItem("accessToken");
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
    data.message || `Cart request failed (HTTP ${response.status})`
    );
  }

  return data;
}

export async function addProductToCart(productId) {
  return cartRequest(`/cart/add/${encodeURIComponent(productId)}`, {
    method: "POST",
  });
}

export async function fetchCart() {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    throw new Error("Log in to view your cart.");
  }

  const response = await fetch(`${API_URL}/cart/getCart/`, {
    headers: {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  });

  const data = await response.json();

  if (response.status === 404 && data.message === "Cart not found") {
    return [];
  }

  if (!response.ok) {
    throw new Error(
    data.message || `Failed to load cart (HTTP ${response.status})`
    );
  }

  if (!Array.isArray(data.cart?.items)) {
    throw new Error("Invalid cart response from the server.");
  }

  return data.cart.items;
}

export async function removeCartProduct(productId) {
  return cartRequest(`/cart/${encodeURIComponent(productId)}`, {
    method: "DELETE",
  });
}

export async function clearCart() {
  return cartRequest("/cart/clearCart", {
    method: "DELETE",
  });
}
