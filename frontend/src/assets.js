const imageAssets = import.meta.glob("./img/**/*.{png,jpg,jpeg,svg}", {
  eager: true,
  query: "?url",
  import: "default",
});

export const getImageUrl = (path) => {
  const url = imageAssets[`./${path.replace(/^\/+/, "")}`];
  if (!url) {
    throw new Error(`Image asset not found: ${path}`);
  }
  return url;
};

export const container = "w-[90%] mx-auto max-w-[1350px]";
export const btn =
  "py-[10px] px-[18px] capitalize rounded-[2px] cursor-pointer bg-[#ff8716] text-white flex gap-[10px] items-center transition duration-300 hover:scale-110";
