import { Button } from "@material-tailwind/react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";
import { auth, db } from "../Firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
const provider = new GoogleAuthProvider();

function OAuth() {
  const navigate = useNavigate();
  const handleClick = async () => {
    try {
      const { user } = await signInWithPopup(auth, provider);
      toast.success("Sign In Success", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      const docRef = doc(db, "users", user.uid);
      const docSnap: any = await getDoc(docRef);
      if (!docSnap.exists()) {
        setDoc(docRef, {
          name: user.displayName,
          email: user.email,
          timestamp: serverTimestamp(),
        });
      }
      navigate("/");
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      // ...\
      toast.error("Could not authorize with Google", {
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
  return (
    <Button onClick={handleClick} className="w-full py-3" color="red" size="sm">
      <div className="flex justify-center items-center space-x-2">
        <div className="p-[2px] bg-white rounded-full">
          <FcGoogle className="h-4 w-4" />
        </div>
        <p> CONTINUE WITH GOOGLE</p>
      </div>
    </Button>
  );
}

export default OAuth;
