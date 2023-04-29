import React, { useState } from "react";
import { auth } from "../Firebase";
import { onAuthStateChanged } from "firebase/auth";

function useAuthStatus() {
  const [loggedIn, setLoggedin] = useState<boolean>(false);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(true);
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      const uid = user.uid;
      setLoggedin(true);
      // ...
    } else {
      // User is signed out
      // ...
      setLoggedin(false);
    }
    setCheckingStatus(false);
  });
  return { loggedIn, checkingStatus };
}

export default useAuthStatus;
