import { useState, useEffect } from "react";
import { signOut, updateProfile } from "firebase/auth";
import { auth, db } from "../Firebase";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Input } from "@material-tailwind/react";
import { toast } from "react-toastify";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { FcHome } from "react-icons/fc";

import { listing } from "../interface/listing";
import ListingCard from "../components/ListingCard";
import { Blocks } from "react-loader-spinner";
import { deleteObject, getStorage, ref } from "firebase/storage";
function Profile() {
  const user: any = auth.currentUser;
  const storage = getStorage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [listingLoading, setListingLoading] = useState<boolean>(false);
  const [changingName, setChangingName] = useState<boolean>(false);
  const [listings, setListing] = useState([]);
  const formik = useFormik({
    validateOnChange: false,
    initialValues: {
      name: user.displayName,
      email: user.email,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        const updatedUser = await updateProfile(user, {
          displayName: values.name,
        });
        const docRef = doc(db, "users", user.uid);
        const updatedUserDb = await updateDoc(docRef, { name: values.name });
        toast.success("Update Name Successfully", {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      } catch (error) {
        toast.error("Update name fail", {
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
      setChangingName(false);
      setLoading(false);
    },
  });
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate("/sign-in");
        // Sign-out successful.
      })
      .catch((error) => {});
  };
  const handleCreateListingClick = () => {
    navigate("/create-listing");
  };
  const getListings = async () => {
    setListingLoading(true);
    try {
      const q = query(
        collection(db, "listings"),
        where("userRef", "==", auth.currentUser?.uid),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      let listings: any = [];
      querySnapshot.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      setListing(listings);
    } catch (error) {
      console.log(error);
    }
    setListingLoading(false);
  };
  const handleDeleteListing = async (id: string) => {
    try {
      await deleteDoc(doc(db, "listings", id));
      setListing(
        listings.filter((listing: listing) => {
          /// delete old iamge
          if (listing.id === id) {
            listing.data.imgUrls.map((url) => {
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
          return listing.id !== id;
        })
      );

      toast.success("Delete Listing Successfully", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (error) {
      toast.error("Delete Listing failed", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      console.log(error);
    }
  };
  useEffect(() => {
    getListings();
  }, [auth.currentUser?.uid]);
  return (
    <div className="pb-8">
      <div className="container mx-auto px-8 md:p-0 ">
        <div className="my-6">
          <p className="font-extrabold text-3xl text-center">My Profile</p>
        </div>
        <div className="max-w-md mx-auto">
          <div>
            <div className="">
              <Input
                disabled={changingName ? false : true}
                error={formik.errors.name ? true : false}
                id="name"
                variant="outlined"
                label="Full Name"
                {...formik.getFieldProps("name")}
              />
            </div>
          </div>
          <div className="my-3">
            <div>
              <Input
                disabled
                {...formik.getFieldProps("email")}
                id="email"
                variant="outlined"
                label="Email Address"
              />
            </div>
          </div>
          <div className="flex justify-between my-4">
            <p className="text-xs md:text-sm">
              Do you want to edit your name?{" "}
              {changingName ? (
                <>
                  <span
                    onClick={() => {
                      setChangingName(false);
                      formik.setFieldValue(
                        "name",
                        auth.currentUser?.displayName
                      );
                    }}
                    className="text-red-500 cursor-pointer mr-2"
                  >
                    Cancel
                  </span>
                  {formik.values.name !== auth.currentUser?.displayName && (
                    <span
                      onClick={() => {
                        formik.handleSubmit();
                      }}
                      className="text-green-500 cursor-pointer"
                    >
                      Accept
                    </span>
                  )}
                </>
              ) : (
                <span
                  onClick={() => {
                    setChangingName(true);
                  }}
                  className="text-red-500 cursor-pointer"
                >
                  Edit
                </span>
              )}
            </p>
            <p
              onClick={handleLogout}
              className="text-xs md:text-sm text-blue-600 cursor-pointer"
            >
              Sign out
            </p>
          </div>
          <Button
            onClick={handleCreateListingClick}
            className="w-full py-3"
            size="sm"
          >
            <div className="flex justify-center items-center space-x-2">
              <div className="p-[2px] bg-white rounded-full">
                <FcHome className="h-4 w-4" />
              </div>
              <p> SELL OR RENT YOUR HOME</p>
            </div>
          </Button>
        </div>
      </div>
      {listingLoading ? (
        <div className="container mx-auto px-8 md:p-0 flex justify-center items-center h-[30vh]">
          <Blocks
            visible={true}
            height="80"
            width="80"
            ariaLabel="blocks-loading"
            wrapperStyle={{}}
            wrapperClass="blocks-wrapper"
          />
        </div>
      ) : (
        listings.length > 0 && (
          <div className="container mx-auto px-8 md:p-0">
            <div className="my-6">
              <p className="font-extrabold text-3xl text-center">My Listings</p>
            </div>
            <div className="grid xs:grid-cols-1 md:grid-cols-2 lg:grid-cols-4  gap-4">
              {listings.map((item: listing) => {
                return (
                  <ListingCard
                    handleDelete={handleDeleteListing}
                    key={item.id}
                    listing={item.data}
                    id={item.id}
                    allowAction={true}
                  />
                );
              })}
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default Profile;
