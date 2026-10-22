import { useState } from "react";
import { container } from "../assets.js";

export default function CartPage({
  items = [],
  status = "loading",
  error = "",
  onRefresh,
  onRemoveProduct,
  onClearCart,
  setPage,
}) {
  const [actionError, setActionError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const itemCount = items.reduce(
    (count, item) => count + (Number(item.quantity) || 0),
    0
  );
  const subtotal = items.reduce((total, item) => {
    const product = item.product;
    return total + (Number(product?.price) || 0) * (Number(item.quantity) || 0);
  }, 0);

  async function runCartAction(action) {
    setActionError("");
    setIsUpdating(true);

    try {
      await action();
    } catch (requestError) {
      setActionError(requestError.message || "Unable to update your cart.");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <main className={`${container} min-h-[420px] py-10`}>
      <div className="mb-8">
        <p className="mb-2 text-sm text-[#7b7b7b]">
          <button
            type="button"
            onClick={() => setPage("home")}
            className="cursor-pointer hover:text-[#ff8716]"
          >
            Home
          </button>
          <span className="mx-2">/</span>
          <span className="text-[#ff8716]">Shopping cart</span>
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-[32px] font-bold">Shopping cart</h1>
            {status === "success" && (
              <p className="mt-1 text-sm text-[#7b7b7b]">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </p>
            )}
          </div>
          {status === "success" && items.length > 0 && (
            <button
              type="button"
              onClick={() => runCartAction(onClearCart)}
              disabled={isUpdating}
              className="cursor-pointer text-sm font-semibold text-[#b42318] hover:underline disabled:opacity-60"
            >
              Clear cart
            </button>
          )}
        </div>
      </div>

      {status === "loading" ? (
        <p
          role="status"
          className="rounded-[5px] border border-[#e5e5e5d5] bg-white p-10 text-center text-[#7b7b7b]"
        >
          Loading your cart...
        </p>
      ) : status === "error" ? (
        <section className="rounded-[5px] border border-[#e5e5e5d5] bg-white p-10 text-center">
          <p role="alert" className="mb-4 text-[#b42318]">
            {error}
          </p>
          <button
            type="button"
            onClick={() => runCartAction(onRefresh)}
            disabled={isUpdating}
            className="cursor-pointer rounded-[3px] bg-[#ff8716] px-5 py-2 font-semibold text-white disabled:opacity-70"
          >
            Try again
          </button>
        </section>
      ) : items.length === 0 ? (
        <section className="rounded-[5px] border border-[#e5e5e5d5] bg-white px-5 py-16 text-center shadow-[0px_8px_10px_#c0bfbf22]">
          <i
            className="fa-solid fa-cart-shopping mb-5 text-[42px] text-[#ff8716]"
            aria-hidden="true"
          />
          <h2 className="mb-2 text-[24px] font-bold">Your cart is empty</h2>
          <p className="mb-6 text-[#7b7b7b]">
            Find something you love and it will show up here.
          </p>
          <button
            type="button"
            onClick={() => setPage("home")}
            className="rounded-[3px] border-2 border-[#ff8716] bg-[#ff8716] px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-[#ff8716]"
          >
            Continue shopping
          </button>
        </section>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-7 max-[900px]:grid-cols-1">
          <section className="overflow-hidden rounded-[5px] border border-[#e5e5e5d5] bg-white shadow-[0px_8px_10px_#c0bfbf22]">
            {items.map((item, index) => {
              const product = item.product;
              const productId = String(product?._id ?? product?.id ?? "");

              if (!product || !productId) {
                return null;
              }

              const image = Array.isArray(product.images)
                ? product.images[0]?.secure_url
                : product.images?.secure_url;
              const quantity = Number(item.quantity) || 0;
              const price = Number(product.price) || 0;

              return (
                <article
                  key={productId || index}
                  className="flex items-center justify-between gap-5 border-b border-[#e5e5e5d5] p-5 last:border-b-0 max-[600px]:items-start"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    {image ? (
                      <img
                        src={image}
                        alt={product.name}
                        className="!h-24 !w-24 shrink-0 object-contain"
                      />
                    ) : (
                      <div className="flex !h-24 !w-24 shrink-0 items-center justify-center bg-[#F8F8F8] text-xs text-[#7b7b7b]">
                        No image
                      </div>
                    )}
                    <div className="min-w-0">
                      <h2 className="line-clamp-2 font-semibold">
                        {product.name}
                      </h2>
                      <p className="mt-1 text-sm text-[#7b7b7b]">
                        Quantity: {quantity}
                      </p>
                      <p className="mt-2 font-bold text-[#ff8716]">
                        ${(price * quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      runCartAction(() => onRemoveProduct(productId))
                    }
                    disabled={isUpdating}
                    aria-label={`Remove ${product.name} from cart`}
                    className="shrink-0 cursor-pointer text-sm text-[#7b7b7b] hover:text-[#b42318] disabled:cursor-wait disabled:opacity-60"
                  >
                    <i
                      className="fa-regular fa-trash-can mr-1"
                      aria-hidden="true"
                    />
                    Remove
                  </button>
                </article>
              );
            })}
          </section>

          <aside className="rounded-[5px] border border-[#e5e5e5d5] bg-white p-5 shadow-[0px_8px_10px_#c0bfbf22]">
            <h2 className="mb-5 border-b border-[#e5e5e5d5] pb-4 text-[22px] font-bold">
              Order summary
            </h2>
            <div className="mb-5 flex justify-between">
              <span className="text-[#7b7b7b]">Subtotal</span>
              <span className="font-bold">${subtotal.toFixed(2)}</span>
            </div>
            <button
              type="button"
              onClick={() => setPage("home")}
              className="w-full cursor-pointer rounded-[3px] border-2 border-[#ff8716] bg-[#ff8716] py-3 font-bold text-white transition hover:bg-white hover:text-[#ff8716]"
            >
              Continue shopping
            </button>
          </aside>
        </div>
      )}

      {actionError && (
        <p role="alert" className="mt-4 text-sm text-[#b42318]">
          {actionError}
        </p>
      )}
    </main>
  );
}
