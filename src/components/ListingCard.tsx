import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
} from "@material-tailwind/react";
import { listingDetail } from "../interface/listing";
import { ImLocation2 } from "react-icons/im";
import Moment from "react-moment";
import { BsTrashFill } from "react-icons/bs";
import { AiFillEdit } from "react-icons/ai";
import { useState } from "react";
import CustomDialog from "./Dialog";
import { useNavigate } from "react-router-dom";
import { auth } from "../Firebase";
export default function Example({
  listing,
  id,
  handleDelete,
  allowAction = false,
}: {
  listing: listingDetail;
  id: string;
  handleDelete?: any;
  allowAction?: boolean;
}) {
  const navigate = useNavigate();
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const handleDeleteDialogClick = () => {
    setOpenDeleteDialog(!openDeleteDialog);
  };
  const handleConfirmDeleteDialogClick = async () => {
    setLoading(true);
    await handleDelete(id);
    setLoading(false);
    setOpenDeleteDialog(false);
  };
  const handleEditClick = () => {
    navigate(`/edit-listing/${id}`);
  };
  const handleListingCLick = () => {
    navigate(`/category/${listing.type}/${id}`);
  };
  return (
    <>
      <CustomDialog
        loading={loading}
        handleConfirm={handleConfirmDeleteDialogClick}
        handleOpen={handleDeleteDialogClick}
        open={openDeleteDialog}
        title={`Delete ${listing.name}`}
        message="Are you sure ?"
      />
      <Card className="cursor-pointer w-full ">
        <CardHeader
          onClick={handleListingCLick}
          floated={false}
          className="relative h-56"
        >
          <div className="bg-blue-600  absolute top-2 left-2 p-1 rounded-md z-30">
            <p className="text-white text-xs">
              <Moment fromNow>{listing.timestamp?.toDate()}</Moment>
            </p>
          </div>
          <img
            src={listing.imgUrls[0]}
            alt="img-blur-shadow"
            className="h-full w-full object-cover hover:scale-125 duration-500"
          />
        </CardHeader>
        <CardBody className="text-start flex-2" style={{ flex: "2" }}>
          <Typography variant="h5" className="mb-2">
            {listing.name}
          </Typography>
          <div className="flex items-center">
            <ImLocation2 className="h-full fill-green-400 mr-1" />
            <p className="line line-clamp-1 text-sm text-clip">
              {listing.address}
            </p>
          </div>
          <div className="my-1">
            <p className="text-sm">
              $ {listing.regularPrice} {listing.type === "rent" && "/ Month"}
            </p>
          </div>
        </CardBody>
        <CardFooter divider className="flex items-center justify-between py-3">
          <div className="flex gap-3">
            <Typography variant="small" color="gray" className="flex gap-1">
              Bed{listing.bedrooms > 1 && "s"} {listing.bedrooms}
            </Typography>
            <Typography variant="small" color="gray" className="flex gap-1">
              Bath{listing.bathrooms > 1 && "s"} {listing.bathrooms}
            </Typography>
          </div>
          {allowAction && (
            <div className="flex gap-2">
              <AiFillEdit
                onClick={handleEditClick}
                className="cursor-pointer"
              />
              <BsTrashFill
                onClick={handleDeleteDialogClick}
                className="fill-red-500 cursor-pointer"
              />{" "}
            </div>
          )}
        </CardFooter>
      </Card>
    </>
  );
}
