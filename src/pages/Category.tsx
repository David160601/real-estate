import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../Firebase";
import { listing } from "../interface/listing";
import Spinner from "../components/Spinner";
import { getData } from "../services/listing";
import ListingCard from "../components/ListingCard";
import { Button } from "@material-tailwind/react";
import { useParams } from "react-router-dom";
function Category() {
  let { categoryName } = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [offersListings, setOffersListings] = useState<listing[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [docSize, setDocSize] = useState<number>(0);
  const getOffersListings = async () => {
    setLoading(true);
    try {
      let listings: listing[] = [];
      const q = query(
        collection(db, "listings"),
        where("type", "==", categoryName),
        orderBy("timestamp", "desc"),
        limit(8)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        listings.push({
          id: doc.id,
          data: getData(doc.data()),
        });
      });

      const snapshot = await getCountFromServer(
        query(
          collection(db, "listings"),
          where("type", "==", categoryName),
          orderBy("timestamp", "desc")
        )
      );
      if (listings.length < snapshot.data().count) {
        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 8];
        setLastDoc(lastVisible);
      }
      setDocSize(snapshot.data().count);
      setOffersListings(listings);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };
  const getMoreOffersListings = async () => {
    setLoading(true);
    try {
      let listings: listing[] = [];
      const q = query(
        collection(db, "listings"),
        where("offer", "==", true),
        orderBy("timestamp", "desc"),
        limit(8),
        startAfter(lastDoc)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        listings.push({
          id: doc.id,
          data: getData(doc.data()),
        });
      });
      if (listings.length + offersListings.length < docSize) {
        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastDoc(lastVisible);
      } else if (listings.length + offersListings.length === docSize) {
        console.log("happen");
        setLastDoc(null);
      }
      setOffersListings([...offersListings, ...listings]);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    getOffersListings();
  }, []);

  return loading ? (
    <Spinner />
  ) : (
    <div className="pb-8">
      <div className="container mx-auto px-8 md:p-0 ">
        <div className="my-6">
          <p className="font-extrabold text-3xl text-center">
            Places for {categoryName}
          </p>
        </div>
        {offersListings.length > 0 ? (
          <>
            {" "}
            <div className="grid xs:grid-cols-1 md:grid-cols-2 lg:grid-cols-4  gap-4">
              {offersListings.map((item: listing) => {
                return (
                  <ListingCard
                    key={item.id}
                    listing={item.data}
                    id={item.id}
                    allowAction={false}
                  />
                );
              })}
            </div>
            {lastDoc && (
              <div className=" flex  justify-center my-6">
                <Button
                  onClick={getMoreOffersListings}
                  className="w-full md:w-auto"
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        ) : (
          <div>
            <p className="text-center">
              There are no places for {categoryName} now !
            </p>{" "}
          </div>
        )}
      </div>
    </div>
  );
}

export default Category;
