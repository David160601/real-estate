import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../Firebase";
import { useParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import { listingDetail } from "../interface/listing";
import { Swiper, SwiperSlide } from "swiper/react";
import "leaflet/dist/leaflet.css";
import Leaflet from "leaflet";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { ImLocation2 } from "react-icons/im";
import { FaBed, FaBath } from "react-icons/fa";
import { RiParkingBoxFill } from "react-icons/ri";
import { BiChair } from "react-icons/bi";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// import required modules

import { Autoplay, Pagination, Navigation, EffectFade } from "swiper";
import { Button } from "@material-tailwind/react";
import Contact from "../components/Contact";
import { getData } from "../services/listing";

const icon = new Leaflet.DivIcon({
  className: "custom-div-icon",
  html: "<div style='background-color:#c30b82;' class='marker-pin'></div><i class='material-icons'><img src='https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png'></i>",
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [-3, -42],
});

function Listing() {
  let { id, categoryName } = useParams();
  const [loading, setLoading] = useState(false);
  const [listing, setListing] = useState<listingDetail>();
  const [contacting, setContacting] = useState<boolean>(false);
  const getListing = async () => {
    setLoading(true);
    try {
      const listingId: any = id;
      const docRef = doc(db, "listings", listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data: any = docSnap.data();
        setListing(getData(data));
      } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };
  useEffect(() => {
    getListing();
  }, []);

  const getLatLan = (number: any) => {
    return number;
  };
  return loading ? (
    <Spinner />
  ) : listing ? (
    <div>
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
        {listing?.imgUrls.map((url) => {
          return (
            <SwiperSlide key={url}>
              <div
                className="h-[40vh] cursor-pointer"
                style={{
                  background: `url("${url}")`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>
            </SwiperSlide>
          );
        })}
      </Swiper>
      <div className="container mx-auto px-8 md:p-0 my-6">
        <div className="bg-white rounded-xl shadow-lg p-3 grid md:grid-cols-2 gap-6">
          <div className="">
            <p className="text-xl font-bold text-blue-800">
              {listing?.name} <span>{listing?.regularPrice} $</span>{" "}
            </p>
            <div className="flex items-center flex-wrap my-2">
              <ImLocation2 className="h-full fill-green-400 mr-1" />
              <p className="">{listing?.address}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-center justify-center bg-red-600 p-1 rounded-xl w-full cursor-pointer">
                <p className="text-md font-bold text-white text-center">
                  For {categoryName}
                </p>
              </div>
              {listing.offer && (
                <div className="flex items-center justify-center bg-green-600  p-1 rounded-xl w-full cursor-pointer">
                  <p className="text-md font-bold text-white text-center">
                    $ {listing.discountedPrice} Discount
                  </p>
                </div>
              )}
            </div>

            <p className="text-sm my-3">
              {" "}
              <span className="font-bold">Description </span> -{" "}
              {listing?.description}
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <p className="text-sm font-bold flex items-center">
                <span
                  className="mr-1
                "
                >
                  <FaBed />
                </span>
                <span className="mr-1">{listing.bedrooms}</span>
                Bed{listing?.bedrooms > 1 && "s"}
              </p>
              <p className="text-sm font-bold flex items-center">
                <span
                  className="mr-1
                "
                >
                  <FaBath />
                </span>
                <span className="mr-1">{listing.bathrooms}</span>
                Bath{listing?.bedrooms > 1 && "s"}
              </p>
              {listing.parking && (
                <div className="flex items-center">
                  <RiParkingBoxFill className="mr-1" />{" "}
                  <p className="text-sm font-bold">Parking Spot</p>
                </div>
              )}
              {listing.furnished && (
                <div className="flex items-center">
                  <BiChair className="mr-1" />{" "}
                  <p className="text-sm font-bold">Furnished</p>
                </div>
              )}
            </div>
            {contacting === false &&
            auth.currentUser?.uid !== listing.userRef ? (
              <div className="my-6">
                <Button
                  onClick={() => {
                    setContacting(true);
                  }}
                  className="w-full"
                >
                  Contact Landlord
                </Button>
              </div>
            ) : (
              contacting && (
                <Contact
                  subject={listing.name}
                  landloadId={listing.userRef}
                  handleConfirm={() => {
                    setContacting(false);
                  }}
                />
              )
            )}
          </div>
          <div>
            <MapContainer
              center={[
                getLatLan(listing?.geolocation?.lat || 1),
                getLatLan(listing?.geolocation?.lan || 1),
              ]}
              attributionControl={false}
              zoomControl={false}
              doubleClickZoom={false}
              zoom={12}
              style={{
                minHeight: "40vh",
                width: "100%",
              }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker
                position={[
                  getLatLan(listing?.geolocation?.lat || 1),
                  getLatLan(listing?.geolocation?.lan || 1),
                ]}
                icon={icon}
              ></Marker>
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
}

export default Listing;
