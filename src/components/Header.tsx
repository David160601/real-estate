import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "../Firebase";
import { onAuthStateChanged } from "firebase/auth";
function Header() {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();
  const getActiveRoute = (route: string) => {
    if (route === location.pathname) return true;
    else return false;
  };
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        setLoggedIn(true);
        // ...
      } else {
        // User is signed out

        setLoggedIn(false);
        // ...
      }
    });
  }, [auth]);

  return (
    <header className="px-3 md:px-0 bg-white border-b-2 py-3 shadow-sm sticky top-0 z-40">
      <div className="container flex items-center justify-between mx-auto">
        <img
          onClick={() => {
            navigate("/");
          }}
          className="h-4 md:h-5 cursor-pointer"
          src="https://static.rdc.moveaws.com/images/logos/rdc-logo-default.svg"
          alt=""
        />
        <ul className="flex items-center space-x-10">
          <li
            onClick={() => {
              navigate("/");
            }}
            className={`cursor-pointer font-semibold border-b-2 text-gray-500 text-sm duration-500  ${
              getActiveRoute("/") &&
              " border-b-red-500 text-gray-900 font-medium"
            }   hover:border-b-red-500 hover:text-gray-900`}
          >
            Home
          </li>
          <li
            onClick={() => {
              navigate("/offers");
            }}
            className={`cursor-pointer font-semibold text-gray-500 border-b-2 text-sm duration-500  ${
              getActiveRoute("/offers") &&
              "border-b-red-500 text-gray-900 font-medium"
            }  hover:border-b-red-500 hover:text-gray-900`}
          >
            Offers
          </li>
          <li
            onClick={() => {
              if (loggedIn) {
                navigate("/profile");
              } else {
                navigate("/sign-in");
              }
            }}
            className={`cursor-pointer font-semibold text-gray-500 border-b-2 text-sm duration-500 ${
              (getActiveRoute("/sign-in") || getActiveRoute("/profile")) &&
              " border-b-red-500 text-gray-900 font-medium"
            }  hover:border-b-red-500 hover:text-gray-900`}
          >
            {loggedIn ? "Profile" : "Sign in"}
          </li>
        </ul>
      </div>
    </header>
  );
}

export default Header;
