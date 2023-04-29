import { Fragment, useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { handler } from "@material-tailwind/react/types/components/dialog";
import { ThreeDots } from "react-loader-spinner";

export default function CustomDialog({
  title = "Title",
  message = "Message",
  handleOpen,
  open = false,
  handleConfirm,
  loading,
}: {
  title: string;
  handleOpen: handler;
  open: boolean;
  message: string;
  handleConfirm: handler;
  loading?: boolean;
}) {
  function getWindowDimensions() {
    if (typeof window !== "undefined") {
      const { innerWidth: width, innerHeight: height } = window;
      return {
        width,
        height,
      };
    } else {
      return {
        width: undefined,
        height: undefined,
      };
    }
  }
  const [windowDimensions, setWindowDimensions] = useState<any>(
    getWindowDimensions()
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [windowDimensions, setWindowDimensions]);

  const getDialogSize = () => {
    if (windowDimensions?.width <= parseInt("768")) {
      return "xl";
    } else if (windowDimensions?.width <= parseInt("1024")) {
      return "lg";
    } else {
      return "sm";
    }
  };
  return (
    <Fragment>
      <Dialog
        open={open}
        handler={handleOpen}
         size={getDialogSize()}
      >
        <DialogHeader>{title}</DialogHeader>
        <DialogBody divider>{message}</DialogBody>
        <DialogFooter>
          <Button
            disabled={loading}
            variant="text"
            color="red"
            onClick={handleOpen}
            className="mr-1"
          >
            <span>Cancel</span>
          </Button>
          <Button
            variant="gradient"
            color="green"
            className="flex items-center justify-center"
            onClick={handleConfirm}
          >
            {loading ? (
              <ThreeDots
                height="20"
                width="20"
                radius="9"
                color="#FFFFFF"
                ariaLabel="three-dots-loading"
                visible={true}
              />
            ) : (
              <span>Confirm</span>
            )}
          </Button>
        </DialogFooter>
      </Dialog>
    </Fragment>
  );
}
