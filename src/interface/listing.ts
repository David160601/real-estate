export interface listingDetail {
  name: string;
  bedrooms: number;
  bathrooms: number;
  parking: boolean;
  furnished: boolean;
  address: string;
  description: string;
  offer: boolean;
  regularPrice: number;
  imgUrls: string[];
  userRef: string;
  timestamp: any;
  type: string;
  discountedPrice?: number;
  geolocation: {
    lan: number;
    lat: number;
  };
}
export interface listing {
  id: string;
  data: listingDetail;
}
