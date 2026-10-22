import { getImageUrl, container } from "../assets.js";

export default function StoreHeader({ favs, cartItemCount = 0, setPage }) {
  const selectOptions = [
    "All Categories",
    "Electronics & Digita",
    "Phones & Tablety",
    "Fashion & Clothings",
    "Telivsion & Monitor",
    "Jewelry & Watches",
    "Washing Machine",
    "Toys & Hobbies",
  ];

  return (
      <header className="bg-white fixed top-0 left-0 right-0 shadow-[5px_8px_8px_#d1d1d13b] z-[1000]">
        {/* top header */}
        <div>
          <div className={`${container} flex items-center justify-between py-[15px] max-[1100px]:flex-wrap`}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setPage("home");
              }}
              className="w-[180px] max-[1100px]:w-[140px]"
            >
              <img src={getImageUrl("img/logo.png")} alt="" />
            </a>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="w-[610px] flex items-center rounded-[2px] bg-[#F3F3F3] max-[1100px]:order-3 max-[1100px]:w-[80%] max-[1100px]:mx-auto max-[1100px]:mt-5 max-[500px]:!w-full"
            >
              <div className="relative after:content-[''] after:absolute after:top-1/2 after:-translate-y-1/2 after:right-0 after:w-px after:h-1/2 after:bg-[#b9b9b9]">
                <select
                  id="category"
                  name="category"
                  className="h-[55px] w-[190px] max-[1100px]:w-[200px] max-[500px]:!w-[140px] bg-[#F3F3F3] text-[16px] cursor-pointer pl-[10px] mr-[10px] border-none outline-none"
                >
                  {selectOptions.map((o) => (
                    <option key={o} value={o} className="text-[15px]">
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                name="search"
                id="search"
                placeholder="Search for Products"
                required
                className="h-[55px] w-[400px] max-[1100px]:w-[calc(100%-200px)] max-[500px]:!w-[calc(100%-140px)] py-[5px] pr-[15px] pl-[10px] bg-[#F3F3F3] border-none outline-none"
              />

              <button
                type="submit"
                className="h-[55px] w-[60px] bg-[#ff8716] text-[18px] cursor-pointer border-none outline-none"
              >
                <i className="fa-solid fa-magnifying-glass text-white" />
              </button>
            </form>

            <div className="flex gap-[30px]">
              <div className="relative cursor-pointer">
                <a href="#">
                  <i className="fa-regular fa-heart text-[24px]" />
                  <span className="absolute -top-[10px] -right-[10px] w-5 h-5 text-center leading-5 bg-[#ff8716] !text-white text-[11px] rounded-full">
                    {favs.length}
                  </span>
                </a>
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => setPage("cart")}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setPage("cart");
                  }
                }}
                className="relative cursor-pointer"
                aria-label={`Open shopping cart, ${cartItemCount} items`}
              >
                <i className="fa-solid fa-cart-shopping text-[24px]" aria-hidden="true" />
                <span className="absolute -top-[10px] -right-[10px] w-5 h-5 text-center leading-5 bg-[#ff8716] !text-white text-[11px] rounded-full">
                  {cartItemCount}
                </span>
              </div>

            </div>
          </div>
        </div>
      </header>
  );
}
