import { listingDetail } from "../interface/listing";

export const getData = (data: any) => {
  let result: listingDetail = {
    name: data.name,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    parking: data.parking,
    furnished: data.furnished,
    address: data.address,
    description: data.description,
    offer: data.offer,
    regularPrice: data.regularPrice,
    imgUrls: data.imgUrls,
    userRef: data.userRef,
    timestamp: data.timestamp,
    discountedPrice: data.discountedPrice,
    type: data.type,
    geolocation: data.geolocation,
  };
  return result;
};
