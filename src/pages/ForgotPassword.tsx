import { useState } from "react";
import loginIcon from "../asset/login.svg";
import { Input, Button } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import OAuth from "../components/OAuth";
import { useFormik } from "formik";
import * as Yup from "yup";
import { auth } from "../Firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { toast } from "react-toastify";
import { ThreeDots } from "react-loader-spinner";
function ForgotPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const formik = useFormik({
    validateOnBlur: false,
    validateOnChange: false,
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const user = await sendPasswordResetEmail(auth, values.email);
        toast.success("Email Sent", {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      } catch (error: any) {
        const errorCode = error.code;
        const errorMessage = error.message;
        toast.error(
          errorMessage === "Firebase: Error (auth/user-not-found)."
            ? "Invalid Email"
            : "Could not send Email",
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
      }
      setLoading(false);
    },
  });

  return (
    <section>
      <div className="container mx-auto">
        <div className="my-6 ">
          <p className="font-extrabold text-3xl text-center">Forgot Password</p>
        </div>
        <div className="grid md:grid-cols-2 md:space-x-12 ">
          <div className="rounded-xl p-8">
            <img src={loginIcon} alt="Login Icon" />
          </div>
          <form
            onSubmit={formik.handleSubmit}
            className="p-8  flex flex-col justify-center "
          >
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

            <div className="flex justify-between my-4">
              <p className="text-xs md:text-sm">
                Don't Have an account?{" "}
                <span
                  onClick={() => {
                    return navigate("/sign-up");
                  }}
                  className="text-red-500 cursor-pointer"
                >
                  Register
                </span>
              </p>
              <p
                onClick={() => {
                  navigate("/sign-in");
                }}
                className="text-xs md:text-sm text-blue-600 cursor-pointer"
              >
                Sign in instead
              </p>
            </div>
            <Button
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
                <p> SEND EMAIL</p>
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

export default ForgotPassword;
