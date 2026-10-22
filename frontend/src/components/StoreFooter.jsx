import { container, getImageUrl } from "../assets.js";

export default function StoreFooter() {
  return (
      <footer className="bg-[#121416]">
        <div className={`${container} flex justify-between py-10 max-[1000px]:flex-wrap`}>
          <div className="w-[30%] max-[1000px]:w-[40%] max-[800px]:w-1/2 max-[500px]:!w-full max-[1000px]:mb-5 max-[800px]:mb-[30px]">
            <img className="!w-[180px]" src={getImageUrl("img/white_logo.png")} alt="" />
            <p className="w-[90%] !text-[#b1b1b1] text-sm leading-normal my-[15px]">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sequi, vero?
            </p>
            <div className="flex gap-[10px]">
              {[
                "fa-solid fa-phone",
                "fa-brands fa-facebook-f",
                "fa-brands fa-instagram",
                "fa-brands fa-x-twitter",
              ].map((ic) => (
                <a
                  key={ic}
                  href="#"
                  className="w-10 h-10 flex items-center justify-center bg-[#ff8716] rounded-[3px] relative top-0 transition-all duration-300 hover:-top-[5px]"
                >
                  <i className={`${ic} !text-white text-[20px]`} />
                </a>
              ))}
            </div>
          </div>

          {[
            {
              title: "Find It Fast",
              links: [
                "Laptops & Computers",
                "Smart Phones & Tablets",
                "TV & Audio",
                "Appliances",
                "Jewelry & Watches",
              ],
            },
            {
              title: "Quick Links",
              links: [
                "Your Account",
                "Returns & Exchanges",
                "Shipping & Delivery",
                "Estimated Delivery Time",
                "Purchase Hisotry",
              ],
            },
            {
              title: "Service us",
              links: ["Support Center", "Term & Conditions", "Privacy Policy", "Help", "FAQS"],
            },
          ].map((col) => (
            <div
              key={col.title}
              className="w-[22%] max-[1000px]:w-[30%] max-[800px]:w-1/2 max-[500px]:!w-full max-[1000px]:mb-5 max-[800px]:mb-[30px]"
            >
              <h4 className="!text-white text-[18px] mb-5">{col.title}</h4>
              <div className="flex flex-col gap-[7px]">
                {col.links.map((l) => (
                  <a
                    key={l}
                    href="#"
                    className="!text-[#b1b1b1] text-sm relative left-0 transition-all duration-300 hover:left-2 hover:!text-[#ff8716]"
                  >
                    <i className="fa-solid fa-caret-right !text-[#ff8716] text-sm mr-[5px]" /> {l}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#1d1f22]">
          <div
            className={`${container} flex justify-between items-center py-[5px] max-[800px]:flex-col max-[800px]:gap-[10px]`}
          >
            <p className="!text-white">
              &copy; <span>Reda Store.</span> All Rights Reserved.
            </p>
            <div className="w-[350px]">
              <img src={getImageUrl("img/payment_method.png")} alt="" />
            </div>
          </div>
        </div>
      </footer>
  );
}
