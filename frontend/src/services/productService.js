// src/services/productService.js

import { normalizeProduct } from "../products.js";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

export async function fetchProducts({ signal } = {}) {
  const response = await fetch(`${API_URL}/product/getProducts`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load products (HTTP ${response.status})`
    );
  }

  const data = await response.json();

  const products = data.products;

  if (!Array.isArray(products)) {
    throw new Error("Invalid products response from the server.");
  }

  return products.map(normalizeProduct);
}