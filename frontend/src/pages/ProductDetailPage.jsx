import { useState } from "react";
import { container } from "../assets.js";
import ProductSlider from "../components/ProductSlider.jsx";

function getCategoryKey(category) {
  if (category && typeof category === "object") {
    return String(category._id ?? category.id ?? category.name ?? "");
  }

  return String(category ?? "");
}

function ReviewSection({ product }) {
  const [reviews, setReviews] = useState(() =>
    Array.isArray(product.reviews) ? product.reviews : []
  );
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [ratingError, setRatingError] = useState("");
  const averageRating = reviews.length
    ? reviews.reduce((total, review) => total + (Number(review.rating) || 0), 0) /
      reviews.length
    : Number(product.rating) || 0;

  function handleSubmit(event) {
    event.preventDefault();

    if (!rating) {
      setRatingError("Choose a star rating before submitting.");
      return;
    }

    setReviews((currentReviews) => [
      {
        id: Date.now(),
        username: "You",
        rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
      },
      ...currentReviews,
    ]);
    setRating(0);
    setComment("");
    setRatingError("");
  }

  return (
    <section
      aria-labelledby="reviews-heading"
      className={`${container} mb-[70px] rounded-[5px] border border-[#e5e5e5d5] bg-white p-6 shadow-[0px_8px_10px_#c0bfbf22] max-[500px]:p-5`}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e5e5d5] pb-5">
        <div>
          <h2 id="reviews-heading" className="text-[24px] font-bold">
            Customer Reviews
          </h2>
          <p className="mt-1 text-sm text-[#7b7b7b]">
            {reviews.length === 1
              ? "1 review"
              : `${reviews.length} reviews`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-[#121416]">
            {averageRating > 0 ? averageRating.toFixed(1) : "—"}
          </span>
          <div
            role="img"
            aria-label={
              averageRating > 0
                ? `Rated ${averageRating.toFixed(1)} out of 5`
                : "No ratings yet"
            }
          >
            {Array.from({ length: 5 }, (_, index) => (
              <i
                key={index}
                aria-hidden="true"
                className={`fa-solid fa-star text-sm ${
                  index < Math.round(averageRating)
                    ? "text-[#ff8716]"
                    : "text-[#d5d5d5]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {reviews.length ? (
        <div className="divide-y divide-[#e5e5e5d5]">
          {reviews.map((review, index) => {
            const rating = Math.min(5, Math.max(0, Number(review.rating) || 0));
            const reviewId = review._id ?? review.id ?? index;

            return (
              <article key={String(reviewId)} className="py-5 first:pt-0 last:pb-0">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-[#121416]">
                    {review.user?.username ?? review.username ?? "Customer"}
                  </h3>
                  {review.createdAt && (
                    <time
                      dateTime={review.createdAt}
                      className="text-sm text-[#7b7b7b]"
                    >
                      {new Date(review.createdAt).toLocaleDateString()}
                    </time>
                  )}
                </div>
                <div
                  className="mb-3"
                  role="img"
                  aria-label={`Rated ${rating} out of 5`}
                >
                  {Array.from({ length: 5 }, (_, starIndex) => (
                    <i
                      key={starIndex}
                      aria-hidden="true"
                      className={`fa-solid fa-star text-sm ${
                        starIndex < Math.round(rating)
                          ? "text-[#ff8716]"
                          : "text-[#d5d5d5]"
                      }`}
                    />
                  ))}
                </div>
                <p className="leading-relaxed text-[#696969]">
                  {review.comment ?? review.text ?? ""}
                </p>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="rounded-[3px] bg-[#F8F8F8] px-4 py-8 text-center text-[#7b7b7b]">
          No reviews yet for this product.
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-8 border-t border-[#e5e5e5d5] pt-6"
      >
        <h3 className="mb-4 text-lg font-bold">Add a review</h3>
        <fieldset className="mb-4">
          <legend className="mb-2 text-sm font-semibold">Your rating</legend>
          <div className="flex gap-1" role="group" aria-label="Choose a rating">
            {Array.from({ length: 5 }, (_, index) => {
              const starRating = index + 1;

              return (
                <button
                  key={starRating}
                  type="button"
                  onClick={() => {
                    setRating(starRating);
                    setRatingError("");
                  }}
                  aria-label={`${starRating} star${starRating === 1 ? "" : "s"}`}
                  aria-pressed={rating === starRating}
                  className="cursor-pointer p-1"
                >
                  <i
                    aria-hidden="true"
                    className={`fa-solid fa-star ${
                      starRating <= rating
                        ? "text-[#ff8716]"
                        : "text-[#d5d5d5]"
                    }`}
                  />
                </button>
              );
            })}
          </div>
          {ratingError && (
            <p role="alert" className="mt-1 text-sm text-[#E51A1A]">
              {ratingError}
            </p>
          )}
        </fieldset>

        <label
          htmlFor="review-comment"
          className="mb-2 block text-sm font-semibold"
        >
          Your review
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          required
          rows={4}
          maxLength={1000}
          placeholder="Share your thoughts about this product"
          className="mb-4 w-full rounded-[3px] border border-[#d9d9d9] p-3 outline-none focus:border-[#ff8716]"
        />

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            className="cursor-pointer rounded-[3px] border-2 border-[#ff8716] bg-[#ff8716] px-6 py-2 font-semibold text-white transition hover:bg-white hover:text-[#ff8716]"
          >
            Submit review
          </button>
          <p className="text-xs text-[#7b7b7b]">
            Reviews are only shown in this session and are not saved.
          </p>
        </div>
      </form>
    </section>
  );
}

export default function ProductDetailsPage({
  product,
  products = [],
  onAddToCart,
  toggleFav,
  isFavorite,
  setPage,
  onSelectProduct,
}) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartFeedback, setCartFeedback] = useState("");
  const otherProducts = products.filter(
    (item) => String(item.id) !== String(product.id)
  );
  const categoryKey = getCategoryKey(product.category);
  const suggestedProducts = [
    ...otherProducts.filter(
      (item) =>
        categoryKey &&
        getCategoryKey(item.category) === categoryKey
    ),
    ...otherProducts.filter(
      (item) =>
        !categoryKey ||
        getCategoryKey(item.category) !== categoryKey
    ),
  ].slice(0, 10);

  const categoryName =
    typeof product.category === "object"
      ? product.category?.name
      : product.category;
  const category = categoryName
    ? String(categoryName).replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "Products";
  const sale = product.sale;

  async function handleAddToCart() {
    setIsAddingToCart(true);
    setCartFeedback("");

    try {
      await onAddToCart?.(product);
      setCartFeedback("Added to cart.");
    } catch (error) {
      setCartFeedback(error.message || "Unable to add this product to cart.");
    } finally {
      setIsAddingToCart(false);
    }
  }

  return (
    <main className="min-h-[420px] py-10">
      <div className={container}>
      <p className="mb-7 text-sm text-[#7b7b7b]">
        <button type="button" onClick={() => setPage("home")} className="cursor-pointer hover:text-[#ff8716]">
          Home
        </button>
        <span className="mx-2">/</span>
        <span>{category}</span>
        <span className="mx-2">/</span>
        <span className="text-[#ff8716]">{product.name}</span>
      </p>

      <section className="grid grid-cols-2 gap-10 rounded-[5px] border border-[#e5e5e5d5] bg-white p-8 shadow-[0px_8px_10px_#c0bfbf22] max-[800px]:grid-cols-1 max-[500px]:gap-5 max-[500px]:p-5">
        <div className="relative flex min-h-[380px] items-center justify-center rounded-[5px] bg-[#F8F8F8] p-8 max-[500px]:min-h-[280px]">
          {sale && (
            <span className="absolute left-4 top-4 rounded-[2px] bg-[#ed0505] px-3 py-1 text-sm font-semibold text-white">
              -{sale}%
            </span>
          )}
          {product.img ? (
            <img className="!max-h-[380px] !w-auto max-w-full object-contain" src={product.img} alt={product.name} />
          ) : (
            <p className="text-sm text-[#7b7b7b]">No image available</p>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#ff8716]">{category}</p>
          <h1 className="mb-4 text-[30px] font-bold leading-tight max-[500px]:text-[24px]">{product.name}</h1>
          <div className="mb-5 flex items-center gap-2">
            <span aria-label={`Rated ${product.rating} out of 5`}>
              {[...Array(5)].map((_, i) => (
                <i
                  key={i}
                  className={`fa-solid fa-star text-sm ${
                    i < Math.round(product.rating) ? "text-[#ff8716]" : "text-[#d5d5d5]"
                  }`}
                />
              ))}
            </span>
            <span className="text-sm text-[#7b7b7b]">{product.rating} / 5</span>
          </div>

          <div className="mb-5 flex items-center gap-3">
            <span className="text-[30px] font-bold text-[#ff8716]">${product.price.toFixed(2)}</span>
            {product.old_price && (
              <span className="text-lg text-[#7b7b7b] line-through">${product.old_price.toFixed(2)}</span>
            )}
          </div>
          <p className="mb-7 max-w-[520px] leading-relaxed text-[#696969]">
            {product.description}
          </p>
          {product.brand && <p className="mb-3 text-sm text-[#696969]">Brand: <span className="font-semibold text-[#121416]">{product.brand}</span></p>}

          <div className="mb-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="h-12 flex-1 cursor-pointer rounded-[3px] border-2 border-[#ff8716] bg-[#ff8716] px-6 font-bold text-white transition hover:bg-white hover:text-[#ff8716]"
            >
              <i className="fa-solid fa-cart-shopping mr-2" />
              {isAddingToCart ? "Adding..." : "Add to cart"}
            </button>
            <button
              type="button"
              onClick={() => toggleFav?.(product)}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              aria-pressed={isFavorite}
              className={`h-12 w-12 cursor-pointer rounded-[3px] border transition ${
                isFavorite
                  ? "border-[#ff8716] bg-[#fff4e8] text-[#ff8716]"
                  : "border-[#e5e5e5d5] hover:border-[#ff8716] hover:text-[#ff8716]"
              }`}
            >
              <i className={`${isFavorite ? "fa-solid" : "fa-regular"} fa-heart`} />
            </button>
          </div>

          {typeof product.stock === "number" && (
            <p className="mb-4 text-sm text-[#696969]">
              Availability:{" "}
              <span className={product.stock > 0 ? "font-semibold text-[#47833b]" : "font-semibold text-[#E51A1A]"}>
                {product.stock > 0 ? `In stock (${product.stock})` : "Out of stock"}
              </span>
            </p>
          )}

          <div className="border-t border-[#e5e5e5d5] pt-5 text-sm text-[#696969]">
            <p className="mb-2">
              <i className="fa-solid fa-truck-fast mr-2 text-[#ff8716]" />
              Reliable delivery straight to your door
            </p>
            <p>
              <i className="fa-solid fa-rotate-left mr-2 text-[#ff8716]" />
              Easy returns and helpful customer support
            </p>
          </div>
        </div>
      </section>
      {cartFeedback && (
        <p
          role="status"
          className={`mt-3 text-sm ${
            cartFeedback === "Added to cart."
              ? "text-[#47833b]"
              : "text-[#E51A1A]"
          }`}
        >
          {cartFeedback}
        </p>
      )}
      </div>

      <ProductSlider
        id={`suggested-${product.id}`}
        title="Suggested Products"
        items={suggestedProducts}
        onAddToCart={onAddToCart}
        onFav={toggleFav}
        onSelect={onSelectProduct}
      />

      <ReviewSection key={product.id} product={product} />
    </main>
  );
}
