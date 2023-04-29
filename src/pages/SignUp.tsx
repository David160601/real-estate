import { useState } from "react";
import loginIcon from "../asset/login.svg";
import { Input, Button } from "@material-tailwind/react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import OAuth from "../components/OAuth";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { db, auth } from "../Firebase";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { ThreeDots } from "react-loader-spinner";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
function SignUp() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const formik = useFormik({
    validateOnChange: false,
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
      email: Yup.string().email("Invalid email address").required("Required"),
      password: Yup.string()
        .min(6, "Must be 6 characters or more")
        .required("Required"),
    }),
    onSubmit: (values, { resetForm }) => {
      setLoading(true);
      createUserWithEmailAndPassword(auth, values.email, values.password)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          updateProfile(userCredential.user, {
            displayName: values.name,
          });
          const data: any = { ...values };
          delete data.password;
          data.timestamp = serverTimestamp();
          setDoc(doc(db, "users", user.uid), data);
          const notify = () =>
            toast.success("Sign Up Success", {
              position: "bottom-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            });
          notify();
          resetForm();
          navigate("/");
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          const notify = () =>
            toast.error(
              errorMessage === "Firebase: Error (auth/email-already-in-use)."
                ? "Email already in use"
                : "Sign Un Error",
              {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
              }
            );
          notify();
          console.log(errorMessage);
        });
      setLoading(false);
    },
  });

  return (
    <section>
      <div className="container mx-auto">
        <div className="my-6 ">
          <p className="font-extrabold text-3xl text-center">Sign Up</p>
        </div>
        <div className="grid md:grid-cols-2 md:space-x-12 ">
          <div className="rounded-xl p-8">
            <img src={loginIcon} alt="Login Icon" />
          </div>
          <form
            onSubmit={formik.handleSubmit}
            className="p-8  flex flex-col justify-center "
          >
            <div>
              <p
                className={`text-[10px] my-1 text-red-500 opacity-0 ${
                  formik.errors.name && "opacity-100"
                }`}
              >
                {formik.errors.name ? formik.errors.name : "Name Error"}
              </p>
              <div className="">
                <Input
                  error={formik.errors.name ? true : false}
                  required
                  id="name"
                  variant="outlined"
                  label="Full Name"
                  {...formik.getFieldProps("name")}
                />
              </div>
            </div>
            <div className="">
              <p
                className={`text-[10px] my-1 text-red-500 opacity-0 ${
                  formik.errors.email && "opacity-100"
                }`}
              >
                {formik.errors.email ? formik.errors.email : "Email Error"}
              </p>
              <div>
                <Input
                  error={formik.errors.email ? true : false}
                  required
                  {...formik.getFieldProps("email")}
                  id="email"
                  variant="outlined"
                  label="Email Address"
                />
              </div>
            </div>
            <div>
              <p
                className={`text-[10px] my-1 text-red-500 opacity-0 ${
                  formik.errors.password && "opacity-100"
                }`}
              >
                {formik.errors.password
                  ? formik.errors.password
                  : "Password Error"}
              </p>
              <div className="relative flex w-full ">
                <Input
                  error={formik.errors.password ? true : false}
                  required
                  {...formik.getFieldProps("password")}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  className="pr-20"
                  containerProps={{
                    className: "min-w-0",
                  }}
                />
                <Button
                  onClick={handleShowPassword}
                  size="sm"
                  className="!absolute right-1 top-1 rounded"
                >
                  {showPassword ? (
                    <AiFillEyeInvisible
                      onClick={handleShowPassword}
                      className="h-4 w-4"
                    />
                  ) : (
                    <AiFillEye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex justify-between my-4">
              <p className="text-xs md:text-sm">
                Have an account?
                <span
                  onClick={() => {
                    return navigate("/sign-in");
                  }}
                  className="text-red-500 cursor-pointer ml-1"
                >
                  Sign in
                </span>
              </p>
              <p
                onClick={() => {
                  navigate("/forgot-password");
                }}
                className="text-xs md:text-sm text-blue-600 cursor-pointer"
              >
                Forgot password?
              </p>
            </div>
            <Button
              disabled={loading}
              onClick={() => {
                formik.handleSubmit();
              }}
              className="w-full flex justify-center"
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
                <p> SIGN UP</p>
              )}
            </Button>
            <div className="flex items-center">
              <div className="h-[1px] w-full bg-gray-500"></div>
              <span className="mx-2 text-sm my-4">OR</span>
              <div className="h-[1px] w-full bg-gray-500"></div>
            </div>
            <OAuth />
          </form>
        </div>
      </div>
    </section>
  );
}

export default SignUp;
