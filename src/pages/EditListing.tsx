import { Button, Input } from "@material-tailwind/react";
import { useState, useMemo, useRef, useEffect } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import "leaflet/dist/leaflet.css";
import Leaflet from "leaflet";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { auth, db } from "../Firebase";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import Spinner from "../components/Spinner";
import { useNavigate, useParams } from "react-router-dom";

const icon = new Leaflet.DivIcon({
  className: "custom-div-icon",
  html: "<div style='background-color:#c30b82;' class='marker-pin'></div><i class='material-icons'><img src='https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png'></i>",
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [-3, -42],
});

function EditListing() {
  const [x, setX] = useState(104.888535);
  const [y, setY] = useState(11.562108);
  const storage = getStorage();
  const [markerDragged, setMarkerDragged] = useState(false);
  const [loading, setLoading] = useState(false);
  let { id } = useParams();
  const navigate = useNavigate();
  const markerRef = useRef(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker: any = markerRef.current;
        if (marker != null) {
          console.log(marker.getLatLng());
          const { lat, lng } = marker.getLatLng();
          setX(lng);
          setY(lat);
          setMarkerDragged(true);
        }
      },
    }),
    []
  );
  const uploadImages = async (files: any) => {
    try {
      const storage = getStorage();
      const urls = Promise.all(
        files.map(async (file: any) => {
          const storageRef = ref(
            storage,
            `${auth.currentUser?.uid}-${uuidv4()}`
          );
          const uploadTask = await uploadBytesResumable(storageRef, file);
          return await getDownloadURL(storageRef);
        })
      );
      return urls;
    } catch (error) {
      throw { error };
    }
  };
  const handleImageChange = (event: any) => {
    const allowImage = ["image/png", "image/jpg", "image/jpeg"];
    const files: any[] = [];
    let unSupportedImage = false;
    Object.entries(event.currentTarget.files).forEach(([key, value]) => {
      const file: any = value;
      if (!allowImage.includes(file.type)) unSupportedImage = true;
      files.push(value);
    });
    if (files.length > 6) {
      event.target.value = null;
      formik.setFieldValue("files", null);
      toast.error("Error maximun file upload", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
    if (!unSupportedImage) {
      formik.setFieldValue("files", files);
    } else {
      event.target.value = null;
      formik.setFieldValue("files", null);
      toast.error("Image not supported", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };
  const formik = useFormik({
    validateOnChange: false,
    initialValues: {
      type: "sale",
      name: "",
      bedrooms: 1,
      bathrooms: 1,
      parking: false,
      furnished: false,
      address: "",
      description: "",
      offer: false,
      regularPrice: 0,
      discountedPrice: 0,
      files: [],
      imgUrls: [],
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
      bedrooms: Yup.number().required().min(0),
      bathrooms: Yup.number().required().min(0),
      parking: Yup.boolean(),
      furnished: Yup.boolean(),
      address: Yup.string().required("Required"),
      description: Yup.string().required("Required"),
      offer: Yup.boolean(),
      regularPrice: Yup.number().required().min(0),
      discountedPrice: Yup.number().required().min(0),
      //   files: Yup.mixed().required(),
    }),
    onSubmit: async (values, {}) => {
      setLoading(true);
      try {
        // upload new file
        let imageUrls: any = [];
        if (values.files && values.files.length > 0) {
          imageUrls = await uploadImages(values.files);
          // delete old file
          values.imgUrls.map((url: string) => {
            const path = url.split("/")[7].split("?")[0];
            const desertRef = ref(storage, path);
            // Delete the file
            deleteObject(desertRef)
              .then(() => {
                console.log("deleted");
                // File deleted successfully
              })
              .catch((error) => {
                console.log(error);
                // Uh-oh, an error occurred!
              });
          });
        }
        const formData: any = {
          ...values,
          imgUrls: imageUrls,
          timestamp: serverTimestamp(),
          userRef: auth.currentUser?.uid,
          geolocation: {
            lat: y,
            lan: x,
          },
        };
        values.files.length === 0 && delete formData.imgUrls;
        delete formData.files;
        !values.offer && delete formData.discountedPrice;
        // delete old file
        let docId: any = id;
        const docRef = doc(db, "listings", docId);
        const updatedDoc = await updateDoc(docRef, formData);
        toast.success("Update Listing successfully", {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        console.log(docRef);
        navigate(`/category/${values.type}/${docRef.id}`);
      } catch (error: any) {
        console.log(error);
        toast.error("Create Listing failed", {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
      setLoading(false);
    },
  });
  const handleSubmit = (e: any) => {
    if (Object.keys(formik.errors).length > 0) {
      toast.error("Please complete all the information", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return;
    }
    if (
      formik.values.offer &&
      formik.values.discountedPrice >= formik.values.regularPrice
    ) {
      toast.error(
        "Discounted price cannot be smaller or equal regualar price",
        {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        }
      );
      return;
    }
    formik.handleSubmit();
  };
  const getListing = async (id: any) => {
    setLoading(true);
    try {
      const docRef = doc(db, "listings", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data: any = docSnap.data();
        if (auth.currentUser?.uid !== data.userRef) {
          navigate("/");
          toast.error("Not Allowed", {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        } else {
          formik.setFieldValue("address", data.address);
          formik.setFieldValue("bathrooms", data.bathrooms);
          formik.setFieldValue("bedrooms", data.bedrooms);
          formik.setFieldValue("description", data.description);
          formik.setFieldValue("furnished", data.furnished);
          formik.setFieldValue("name", data.name);
          formik.setFieldValue("offer", data.offer);
          formik.setFieldValue("parking", data.parking);
          formik.setFieldValue("regularPrice", data.regularPrice);
          formik.setFieldValue("type", data.type);
          formik.setFieldValue("imgUrls", data.imgUrls);
          data.offer &&
            formik.setFieldValue("discountedPrice", data.discountedPrice);
          setX(data.geolocation.lan);
          setY(data.geolocation.lat);
        }
        console.log(data);
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
    getListing(id);
  }, []);

  if (loading) {
    return <Spinner />;
  } else {
    return (
      <section>
        <div className="container mx-auto px-8 md:p-0 pb-8">
          <div className="my-6">
            <p className="font-extrabold text-3xl text-center">Edit Listing</p>
          </div>
          <div className="max-w-lg mx-auto">
            {/* sell rent */}
            <div>
              <p className="font-bold">Sell / Rent</p>
              <div className="bg-blue-gray-800 rounded-lg p-[3px] flex h-10 text-black space-x-2 shadow-xl">
                <div
                  onClick={() => {
                    formik.setFieldValue("type", "sale");
                  }}
                  className={` rounded-md flex-1 flex items-center justify-center cursor-pointer duration-500 ${
                    formik.values.type === "sale" && "bg-white"
                  }`}
                >
                  Sell
                </div>
                <div
                  onClick={() => {
                    formik.setFieldValue("type", "rent");
                  }}
                  className={` rounded-md flex-1 flex items-center justify-center cursor-pointer duration-500 ${
                    formik.values.type === "rent" && "bg-white"
                  }`}
                >
                  Rent
                </div>
              </div>
            </div>
            {/* name */}
            <div className="my-6">
              <Input
                error={formik.errors.name ? true : false}
                required
                {...formik.getFieldProps("name")}
                id="name"
                variant="outlined"
                label="Name"
              />
            </div>
            {/* bed bathrooms */}
            <div className=" md:flex md:space-x-4 md:items-center">
              {" "}
              <div className="flex-1">
                <Input
                  //   error={formik.errors.email ? true : false}
                  required
                  {...formik.getFieldProps("bedrooms")}
                  id="bedrooms"
                  variant="outlined"
                  label="Bedrooms"
                  type="number"
                  className="w-full"
                  min={0}
                />
              </div>
              <div className="mt-2 md:mt-0 flex-1">
                <Input
                  //   error={formik.errors.email ? true : false}
                  required
                  {...formik.getFieldProps("bathrooms")}
                  id="bathrooms"
                  variant="outlined"
                  label="Bathrooms"
                  type="number"
                  className="w-full"
                  min={0}
                />
              </div>
            </div>
            {/* parking spot */}
            <div className="my-6">
              <p className="font-bold">Parking spot</p>
              <div className="bg-blue-gray-800 rounded-lg p-[3px] flex h-10 text-black space-x-2 shadow-xl">
                <div
                  onClick={() => {
                    formik.setFieldValue("parking", true);
                  }}
                  className={` rounded-md flex-1 flex items-center justify-center cursor-pointer duration-500 ${
                    formik.values.parking && "bg-white"
                  }`}
                >
                  YES
                </div>
                <div
                  onClick={() => {
                    formik.setFieldValue("parking", false);
                  }}
                  className={` rounded-md flex-1 flex items-center justify-center cursor-pointer duration-500 ${
                    !formik.values.parking && "bg-white"
                  }`}
                >
                  NO
                </div>
              </div>
            </div>
            {/* furnished */}

            <div>
              <p className="font-bold">Furnished</p>
              <div className="bg-blue-gray-800 rounded-lg p-[3px] flex h-10 text-black space-x-2 shadow-xl">
                <div
                  onClick={() => {
                    formik.setFieldValue("furnished", true);
                  }}
                  className={` rounded-md flex-1 flex items-center justify-center cursor-pointer duration-500 ${
                    formik.values.furnished && "bg-white"
                  }`}
                >
                  YES
                </div>
                <div
                  onClick={() => {
                    formik.setFieldValue("furnished", false);
                  }}
                  className={` rounded-md flex-1 flex items-center justify-center cursor-pointer duration-500 ${
                    !formik.values.furnished && "bg-white"
                  }`}
                >
                  NO
                </div>
              </div>
            </div>

            <div className="my-6">
              <Input
                error={formik.errors.address ? true : false}
                required
                {...formik.getFieldProps("address")}
                id="address"
                variant="outlined"
                label="Address"
                type="text"
              />
            </div>

            <div className="">
              <Input
                error={formik.errors.description ? true : false}
                required
                {...formik.getFieldProps("description")}
                id="description"
                variant="outlined"
                label="Description"
                type="text"
              />
            </div>

            <div className="my-6">
              <p className="font-bold">Offer</p>
              <div className="bg-blue-gray-800 rounded-lg p-[3px] flex h-10 text-black space-x-2 shadow-xl">
                <div
                  onClick={() => {
                    formik.setFieldValue("offer", true);
                  }}
                  className={` rounded-md flex-1 flex items-center justify-center cursor-pointer duration-500 ${
                    formik.values.offer && "bg-white"
                  }`}
                >
                  YES
                </div>
                <div
                  onClick={() => {
                    formik.setFieldValue("offer", false);
                  }}
                  className={` rounded-md flex-1 flex items-center justify-center cursor-pointer duration-500 ${
                    !formik.values.offer && "bg-white"
                  }`}
                >
                  NO
                </div>
              </div>
            </div>

            <div className="flex items-center justify-start">
              <div className="mr-3">
                <Input
                  error={formik.errors.regularPrice ? true : false}
                  required
                  {...formik.getFieldProps("regularPrice")}
                  id="regularPrice"
                  variant="outlined"
                  label="Regular Price"
                  type="number"
                />
              </div>
              <p
                className={`text-sm ${
                  formik.values.type === "sale" && "opacity-0"
                }`}
              >
                $ / Month
              </p>
            </div>
            {formik.values.offer && (
              <div className="flex items-center justify-start my-6">
                <div className="mr-3">
                  <Input
                    error={formik.errors.discountedPrice ? true : false}
                    required
                    {...formik.getFieldProps("discountedPrice")}
                    id="discountedPrice"
                    variant="outlined"
                    label="Discounted Price"
                    type="number"
                  />
                </div>
                <p className="text-sm opacity-0">$ / Month</p>
              </div>
            )}
            <div className={`${formik.values.offer === false && "my-6"}`}>
              <p className="text-xs text-gray-600">
                The first image will be the cover Max 6. Supported Image
                png,jpg,jpeg
              </p>
              <div className="flex items-center justify-start mt-1">
                <Input
                  maxLength={6}
                  accept="image/png, image/jpg, image/jpeg"
                  error={formik.errors.files ? true : false}
                  required
                  id="files"
                  variant="outlined"
                  label="Images"
                  type="file"
                  name="files"
                  multiple
                  onBlur={() => {
                    formik.validateForm();
                  }}
                  onChange={handleImageChange}
                />
              </div>
            </div>
          </div>

          <div className="max-w-lg  mx-auto">
            <p className="font-bold">Map</p>
          </div>
          {/* map */}
          <div
            className={`${
              formik.values.offer === true && "mt-6 "
            } max-w-lg mx-auto`}
          >
            <MapContainer
              center={[y, x]}
              attributionControl={false}
              zoomControl={false}
              doubleClickZoom={false}
              zoom={12}
              style={{
                height: "50vh",
                width: "100%",
              }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker
                position={[y, x]}
                icon={icon}
                draggable={true}
                ref={markerRef}
                eventHandlers={eventHandlers}
              ></Marker>
            </MapContainer>
          </div>
          <div className="max-w-lg mx-auto my-6">
            <Button type="submit" onClick={handleSubmit} className="w-full">
              UPADATE LISTING
            </Button>
          </div>
        </div>
      </section>
    );
  }
}

export default EditListing;
