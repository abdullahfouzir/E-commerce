import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import api from "../api/api.js";
import { container, getImageUrl } from "../assets.js";
import ProductSlider from "../components/ProductSlider.jsx";
import StoreFooter from "../components/StoreFooter.jsx";
import StoreHeader from "../components/StoreHeader.jsx";

function HeroSlider() {
  const slides = ["banner_home1.png", "banner_home2.png"];

  return (
    <div className="relative">
      <div className={`${container} flex justify-between`}>
        <div
          className="relative w-[75%] overflow-hidden max-[1000px]:w-full
          [&_.swiper-pagination-bullet]:bg-white
          [&_.swiper-pagination-bullet]:opacity-100
          [&_.swiper-pagination-bullet-active]:!h-2
          [&_.swiper-pagination-bullet-active]:!w-[34px]
          [&_.swiper-pagination-bullet-active]:!rounded-[30px]
          [&_.swiper-pagination-bullet-active]:!bg-[#ff8716]"
        >
          <Swiper
            modules={[Pagination, Autoplay]}
            loop={slides.length > 1}
            pagination={{ clickable: true }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            className="w-full [&_.swiper-wrapper]:!h-auto"
          >
            {slides.map((banner) => (
              <SwiperSlide key={banner}>
                <img
                  className="w-full"
                  src={getImageUrl(`img/${banner}`)}
                  alt=""
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="h-full w-[23%] max-[1000px]:hidden">
          <img
            className="h-full w-full object-cover"
            src={getImageUrl("img/banner_home3.png")}
            alt=""
          />
        </div>
      </div>
    </div>
  );
}

function PromoBanners() {
  return (
    <div className="my-10">
      <div
        className={`${container} flex justify-between max-[1100px]:flex-wrap`}
      >
        {[1, 2, 3, 4].map((number) => (
          <div
            key={number}
            className="group relative flex w-[24%] items-center gap-[15px] rounded-[5px] bg-cover bg-center px-[10px] py-3 max-[1100px]:mb-5 max-[1100px]:w-[49%] max-[500px]:!w-full"
            style={{
              backgroundImage: `url("${getImageUrl("img/bg_banner3.jpg")}")`,
            }}
          >
            <img
              className="!w-[100px] transition duration-300 group-hover:scale-105"
              src={getImageUrl(`img/banner3_${number}.png`)}
              alt=""
              loading="lazy"
            />

            <div>
              <h3 className="text-[16px] max-[500px]:text-sm">
                Break Disc
              </h3>
              <h3 className="text-[16px] max-[500px]:text-sm">
                deals on this
              </h3>

              <div className="my-[7px] flex items-center gap-[5px]">
                <p>
                  Up <br /> To
                </p>
                <span className="text-[25px] font-bold">70%</span>
              </div>

              <h4 className="text-sm font-bold max-[500px]:text-[13px]">
                Shop Now
              </h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImageBanners({ images, className }) {
  return (
    <div className="my-[50px]">
      <div className={container}>
        <div className={`flex justify-between max-[800px]:flex-wrap ${className}`}>
          {images.map((image) => (
            <div
              key={image}
              className="max-[800px]:mb-5"
            >
              <img
                className="h-auto w-full"
                src={getImageUrl(`img/${image}`)}
                alt=""
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductsMessage({ status, error, onRetry }) {
  if (status === "loading") {
    return (
      <p
        role="status"
        className={`${container} my-10 text-center text-[#7b7b7b]`}
      >
        Loading products...
      </p>
    );
  }

  if (status === "error") {
    return (
      <section
        className={`${container} my-10 rounded-[5px] border border-[#e5e5e5d5] bg-white p-8 text-center`}
      >
        <h2 className="mb-2 text-xl font-bold">
          We couldn&apos;t load the products
        </h2>

        <p role="alert" className="mb-4 text-sm text-[#7b7b7b]">
          {error || "Something went wrong. Please try again."}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="cursor-pointer rounded-[3px] bg-[#ff8716] px-5 py-2 font-semibold text-white hover:bg-[#f47600]"
        >
          Try again
        </button>
      </section>
    );
  }

  return null;
}

function ProductSections({
  sections,
  onAddToCart,
  toggleFav,
  onSelectProduct,
}) {
  const renderSection = (section) => (
    <ProductSlider
      key={section.id}
      {...section}
      breakpoints={{
        500: { slidesPerView: 2 },
        800: { slidesPerView: 3 },
        1100: { slidesPerView: 5 },
      }}
      onAddToCart={onAddToCart}
      onFav={toggleFav}
      onSelect={onSelectProduct}
    />
  );

  const hotDeals = sections.find((section) => section.id === "hot-deals");

  const categories = sections.filter(
    (section) => section.id !== "hot-deals"
  );

  return (
    <>
      {hotDeals && renderSection(hotDeals)}

      {categories.slice(0, 1).map(renderSection)}

      <ImageBanners
        images={["banner_box4.jpg", "banner_box5.jpg"]}
        className=" [&>div]:w-[49%] max-[800px]:[&>div]:w-full"
      />

      {categories.slice(1).map(renderSection)}
    </>
  );
}

export default function HomePage({
  products: suppliedProducts,
  productsStatus: suppliedProductsStatus,
  productsError: suppliedProductsError,
  onRetry: suppliedOnRetry,
  onAddToCart,
  toggleFav,
  onSelectProduct,
  favs = [],
  cartItemCount = 0,
  setPage,
}) {
  const navigate = useNavigate();
  const [fetchedProducts, setFetchedProducts] = useState([]);
  const [fetchedProductsStatus, setFetchedProductsStatus] = useState("loading");
  const [fetchedProductsError, setFetchedProductsError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const handleSetPage =
    setPage ?? ((page) => navigate(page === "cart" ? "/cart" : "/"));
  const handleSelectProduct =
    onSelectProduct ??
    ((product) => {
      const productId = product._id ?? product.id;
      if (productId) {
        navigate(`/product/${productId}`);
      }
    });
  const products = suppliedProducts ?? fetchedProducts;
  const productsStatus = suppliedProductsStatus ?? fetchedProductsStatus;
  const productsError = suppliedProductsError ?? fetchedProductsError;
  const onRetry =
    suppliedOnRetry ?? (() => setRetryCount((current) => current + 1));
  const rowSize = 10;
  const sections = [
    ...(products.length
      ? [{
          id: "all-products",
          title: "All Products",
          items: products.slice(0, rowSize),
        }]
      : []),
    ...(products.length > rowSize
      ? [{
          id: "more-products",
          title: "More Products",
          items: products.slice(rowSize),
        }]
      : []),
  ];

  useEffect(() => {
    if (suppliedProducts !== undefined || suppliedProductsStatus !== undefined) {
      return undefined;
    }

    let isCurrentRequest = true;

    async function loadProducts() {
      setFetchedProductsStatus("loading");
      setFetchedProductsError("");

      try {
        const response = await api.get("/product/getProducts", {
          timeout: 15000,
        });
        const responseProducts = response.data?.products;

        if (!Array.isArray(responseProducts)) {
          throw new Error("The server returned an invalid products response.");
        }

        if (isCurrentRequest) {
          setFetchedProducts(
            responseProducts.map((product) => ({
              ...product,
              id: product._id ?? product.id,
              img:
                product.img ??
                (Array.isArray(product.images)
                  ? product.images[0]?.secure_url
                  : product.images?.secure_url),
            }))
          );
          setFetchedProductsStatus("success");
        }
      } catch (requestError) {
        if (isCurrentRequest) {
          setFetchedProductsError(
            requestError.response?.data?.message ||
              requestError.message ||
              "Unable to load products."
          );
          setFetchedProductsStatus("error");
        }
      }
    }

    loadProducts();

    return () => {
      isCurrentRequest = false;
    };
  }, [retryCount, suppliedProducts, suppliedProductsStatus]);

  return (
    <>
      <StoreHeader
        favs={favs}
        cartItemCount={cartItemCount}
        setPage={handleSetPage}
      />
      <main className="pt-[100px]">
        <HeroSlider />

        <PromoBanners />

        <ProductsMessage
          status={productsStatus}
          error={productsError}
          onRetry={onRetry}
        />

        {productsStatus === "success" && (
          <ProductSections
            sections={sections}
            onAddToCart={onAddToCart}
            toggleFav={toggleFav}
            onSelectProduct={handleSelectProduct}
          />
        )}

        <ImageBanners
          images={[
            "banner_box1.jpg",
            "banner_box2.jpg",
            "banner_box3.jpg",
          ]}
          className="gap-[2%] [&>div]:w-[32%] max-[800px]:[&>div]:w-[49%] max-[500px]:[&>div]:w-full"
        />
      </main>
      <StoreFooter />
    </>
  );
}
