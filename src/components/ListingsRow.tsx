import { useNavigate } from "react-router-dom";
import { listing } from "../interface/listing";
import ListingCard from "./ListingCard";
function ListingsRow({
  title = "Title",
  subTitle = "Sub Title",
  listings,
  className,
  subTitleLink,
}: {
  title: string;
  subTitle: string;
  listings: listing[];
  className?: string;
  subTitleLink: string;
}) {
  const navigate = useNavigate();
  return (
    <div className={className}>
      <p className="font-semibold text-3xl">{title} </p>
      <p
        onClick={() => {
          navigate(subTitleLink);
        }}
        className="text-blue-600 cursor-pointer"
      >
        {subTitle}
      </p>
      <div className="grid xs:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
        {listings.map((item: listing) => {
          return <ListingCard key={item.id} listing={item.data} id={item.id} />;
        })}
      </div>
    </div>
  );
}

export default ListingsRow;
