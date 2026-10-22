import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import { container } from "../assets.js";

function ProductCard({
  product,
  onAddToCart,
  onFav,
  onSelect,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [cartFeedback, setCartFeedback] = useState("");
  const rating = Math.min(5, Math.max(0, Number(product.rating) || 0));

  async function handleAddToCart() {
    setIsAdding(true);
    setCartFeedback("");

    try {
      await onAddToCart?.(product);
      setCartFeedback("Added to cart.");
    } catch (error) {
      setCartFeedback(error.message || "Unable to add this product to cart.");
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <article className="relative group rounded-[5px] border border-[#e5e5e5d5] bg-white p-5 shadow-[5px_5px_10px_#94949428]">
      {product.sale > 0 && (
        <span className="absolute right-[10px] top-[10px] z-[2] bg-[#ed0505] px-[10px] py-1 text-[13px] text-white">
          {product.sale}%
        </span>
      )}

      <button
        type="button"
        onClick={() => onSelect?.(product)}
        aria-label={`View ${product.name}`}
        className="relative flex h-[180px] w-full items-center justify-center px-5 transition duration-300 group-hover:scale-110"
      >
        {product.img ? (
          <img
            className="max-h-full w-full object-contain"
            src={product.img}
            alt={product.name}
            loading="lazy"
          />
        ) : (
          <span className="text-sm text-[#7b7b7b]">
            No image available
          </span>
        )}
      </button>

      <h3 className="mb-[10px] line-clamp-2 overflow-hidden font-['Inter'] text-[#121416] max-[800px]:text-sm">
        <button
          type="button"
          onClick={() => onSelect?.(product)}
          className="text-left font-normal hover:underline"
        >
          {product.name}
        </button>
      </h3>

      {product.description && (
        <p className="mb-1 line-clamp-2 min-h-[2.5rem] text-sm leading-5 text-black">
          {product.description}
        </p>
      )}

      <div
        className="mb-[10px]"
        role="img"
        aria-label={`Rated ${rating} out of 5`}
      >
        {Array.from({ length: 5 }, (_, index) => (
          <i
            key={index}
            aria-hidden="true"
            className={`fa-solid fa-star text-[14px] ${
              index < Math.round(rating)
                ? "text-[#ff8716]"
                : "text-[#d5d5d5]"
            }`}
          />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <p className="text-[18px] font-bold text-[#ff8716] max-[800px]:text-base">
          ${Number(product.price).toFixed(2)}
        </p>

        {product.old_price != null && product.old_price > product.price && (
          <p className="text-[13px] font-normal text-[#7b7b7b] line-through max-[800px]:text-xs">
            ${Number(product.old_price).toFixed(2)}
          </p>
        )}
      </div>

      <div className="mt-[15px] flex gap-[10px]">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAdding}
          className={`flex cursor-pointer items-center gap-[5px] border border-[#ff8716] px-[10px] py-[5px] transition duration-300 max-[800px]:px-[5px] max-[800px]:py-[3px] max-[800px]:text-sm ${
            "bg-[#ff8716] text-white hover:scale-105 hover:bg-[#f47600]"
          }`}
        >
          <i aria-hidden="true" className="fa-solid fa-cart-shopping pointer-events-none max-[500px]:text-sm text-white" />
          {isAdding ? "Adding..." : "Add to cart"}
        </button>

        <button
          type="button"
          onClick={() => onFav?.(product)}
          aria-label={`Add ${product.name} to favorites`}
          className="group/icon flex h-10 w-10 cursor-pointer items-center justify-center border border-[#e5e5e5d5] transition duration-300 hover:bg-[#ff8716]"
        >
          <i
            aria-hidden="true"
            className="fa-regular fa-heart text-sm group-hover/icon:text-white"
          />
        </button>
      </div>
      {cartFeedback && (
        <p
          role="status"
          className={`mt-2 text-xs ${
            cartFeedback === "Added to cart."
              ? "text-[#47833b]"
              : "text-[#E51A1A]"
          }`}
        >
          {cartFeedback}
        </p>
      )}
    </article>
  );
}

export default function ProductSlider({
  id,
  title,
  items = [],
  onAddToCart,
  onFav,
  onSelect,
  breakpoints,
}) {
  if (!items.length) return null;

  // خاص id يكون فريد لكل قسم.
  const sectionId = String(id || "products").replace(
    /[^a-zA-Z0-9_-]/g,
    "-"
  );

  return (
    <section
      aria-label={title}
      className="mb-[70px]"
    >
      <div className={`${container} relative`}>
        <div className="overflow-hidden py-[10px]">
          <div className="relative mb-5 border-b-[3px] border-[#ff8716]">
            <h2
              className="relative flex w-max items-center gap-[10px] bg-[#ff8716] px-10 py-[10px] font-['DM_Sans'] text-[18px] uppercase text-white before:absolute before:left-0 before:top-0 before:z-[9] before:h-0 before:w-0 before:border-b-[20px] before:border-b-[#e26e02] before:border-l-[20px] before:border-l-transparent before:bg-white max-[800px]:px-[25px] max-[800px]:text-base"
            >
              <i className="fa-solid fa-tags text-white" aria-hidden="true" />
              <span>{title}</span>
            </h2>
          </div>

          <Swiper
            modules={[Navigation]}
            loop={items.length > 1}
            navigation={{
              nextEl: `.next-${sectionId}`,
              prevEl: `.prev-${sectionId}`,
            }}
            spaceBetween={20}
            slidesPerView={1.3}
            breakpoints={
              breakpoints ?? {
                500: { slidesPerView: 2 },
                800: { slidesPerView: 3 },
                1100: { slidesPerView: 5 },
              }
            }
            className="!overflow-hidden"
          >
            {items.map((product, index) => {
              const productId = product.id || product._id || `${sectionId}-${index}`;

              return (
                <SwiperSlide key={String(productId)} className="!h-auto">
                  <ProductCard
                    product={product}
                    onAddToCart={onAddToCart}
                    onFav={onFav}
                    onSelect={onSelect}
                  />
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        <button
          type="button"
          aria-label={`Next ${title} products`}
          className={`next-${sectionId} swiper-button-next !absolute !left-auto !right-0 !top-[16px] !mt-0 !h-[35px] !w-[35px] !rounded-[5px] !border !border-[#e5e5e5d5] !bg-[#F3F3F3] !text-[#121416] after:!text-[8px]`}
        />

        <button
          type="button"
          aria-label={`Previous ${title} products`}
          className={`prev-${sectionId} swiper-button-prev !absolute !left-[calc(100%-80px)] !right-auto !top-[16px] !mt-0 !h-[35px] !w-[35px] !rounded-[5px] !border !border-[#e5e5e5d5] !bg-[#F3F3F3] !text-[#121416] after:!text-[8px]`}
        />
      </div>
    </section>
  );
}
