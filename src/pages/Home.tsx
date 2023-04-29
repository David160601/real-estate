import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../Firebase";
import { listing } from "../interface/listing";
import Spinner from "../components/Spinner";
import Slider from "../components/Slider";
import ListingsRow from "../components/ListingsRow";
import { getData } from "../services/listing";
function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const [listings, setListings] = useState<listing[]>([]);
  const [offerListings, setOfferlistings] = useState<listing[]>([]);
  const [rentListings, setRentlistings] = useState<listing[]>([]);
  const [sellListings, setSelllistings] = useState<listing[]>([]);
  const getListings = async () => {
    setLoading(true);
    try {
      //SLIDER
      let listings: listing[] = [];
      const q = query(
        collection(db, "listings"),
        orderBy("timestamp", "desc"),
        limit(5)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        listings.push({
          id: doc.id,
          data: getData(doc.data()),
        });
      });
      setListings(listings);
      // OFFERS
      let offerListings: listing[] = [];
      const qOffer = query(
        collection(db, "listings"),
        where("offer", "==", true),
        orderBy("timestamp", "desc"),
        limit(5)
      );
      const querySnapshotOffer = await getDocs(qOffer);
      querySnapshotOffer.forEach((doc) => {
        const data = doc.data();
        offerListings.push({
          id: doc.id,
          data: getData(doc.data()),
        });
      });
      setOfferlistings(offerListings);

      // RENTS
      let rentListings: listing[] = [];
      const qRent = query(
        collection(db, "listings"),
        where("type", "==", "rent"),
        orderBy("timestamp", "desc"),
        limit(5)
      );
      const querySnapshotRent = await getDocs(qRent);
      querySnapshotRent.forEach((doc) => {
        const data = doc.data();
        rentListings.push({
          id: doc.id,
          data: getData(doc.data()),
        });
      });
      setRentlistings(rentListings);
      // SELLS
      let sellListing: listing[] = [];
      const qSell = query(
        collection(db, "listings"),
        where("type", "==", "sale"),
        orderBy("timestamp", "desc"),
        limit(5)
      );
      const querySnapshotSell = await getDocs(qSell);
      querySnapshotSell.forEach((doc) => {
        const data = doc.data();
        sellListing.push({
          id: doc.id,
          data: getData(doc.data()),
        });
      });
      setSelllistings(sellListing);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };
  console.log(rentListings);
  useEffect(() => {
    getListings();
  }, []);
  return loading ? (
    <Spinner />
  ) : listings ? (
    <div className="mb-6">
      <Slider listings={listings} />
      <div className="container mx-auto px-8 md:p-0 mt-6">
        {offerListings?.length > 0 && (
          <ListingsRow
            subTitleLink="/offers"
            title="Recent offers"
            subTitle="Show more offers"
            listings={offerListings}
          />
        )}

        {rentListings?.length > 0 && (
          <ListingsRow
            subTitleLink="/category/rent"
            className="my-2"
            title="Places for rent"
            subTitle="Show more places for rent"
            listings={rentListings}
          />
        )}

        {sellListings?.length > 0 && (
          <ListingsRow
            subTitleLink="/category/sale"
            className="my-2"
            title="Places for sale"
            subTitle="Show more places for sale"
            listings={sellListings}
          />
        )}
      </div>
    </div>
  ) : (
    <></>
  );
}

export default Home;
