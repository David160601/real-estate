import { Button, Input } from "@material-tailwind/react";
import { doc, getDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { db } from "../Firebase";

function Contact({
  handleConfirm,
  landloadId,
  subject,
}: {
  handleConfirm?: any;
  landloadId: string;
  subject: string;
}) {
  const [landload, setLandload] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const getLandload = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "users", landloadId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        setLandload(docSnap.data());
      } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };
  console.log(landload);
  useEffect(() => {
    getLandload();
  }, []);
  return loading ? (
    <div>loading</div>
  ) : landload ? (
    <div className="my-2">
      <p className="text-sm">
        Contact {landload.name} for {subject}
      </p>
      <div className="my-3">
        {" "}
        <Input type="text" label="Message" />
      </div>
      <a
        onClick={handleConfirm}
        href={`mailto:phengdavid33@gmail.com?subject=test&body=test`}
      >
        {" "}
        <Button className="w-full">Submit</Button>
      </a>
    </div>
  ) : (
    <></>
  );
}

export default Contact;
