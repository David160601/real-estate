import React from "react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
// import required modules
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper";
import { listing } from "../interface/listing";
import { useNavigate } from "react-router-dom";
function Slider({ listings }: { listings: listing[] }) {
  const navigate = useNavigate();
  const handleListingCLick = (type: string, id: string) => {
    navigate(`/category/${type}/${id}`);
  };
  return (
    <Swiper
      pagination={{
        type: "progressbar",
      }}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      navigation={true}
      modules={[Autoplay, Pagination, Navigation, EffectFade]}
      className="mySwiper"
      effect={"fade"}
    >
      {listings?.map((listing) => {
        return (
          <SwiperSlide key={listing.id}>
            <div
              onClick={() => {
                handleListingCLick(listing.data.type, listing.id);
              }}
              className="h-[40vh] cursor-pointer relative"
              style={{
                background: `url("${listing.data.imgUrls[0]}")`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="bg-blue-600 text-white font-bold bg-opacity-70 absolute p-2 top-2 left-2 rounded-br-2xl">
                {listing.data.name}
              </div>
              <div className="bg-red-600 text-white font-bold bg-opacity-70 absolute p-2 bottom-2 left-2 rounded-tr-2xl">
                $ {listing.data.regularPrice}{" "}
                {listing.data.type === "rent" && "/ month"}
              </div>
            </div>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}

export default Slider;
