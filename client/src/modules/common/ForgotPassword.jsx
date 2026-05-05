import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Toast from "../common/Toast";

axios.defaults.withCredentials = true;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, type: "", message: "" });
  const [data, setData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });


  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data.email || !data.password || !data.confirmPassword) {
      showToast("Please fill all fields");
    }

    if (data.password !== data.confirmPassword) {
       showToast("Passwords do not match");
    }

    try {
      const res = await axios.post(
        "http://localhost:8001/api/user/forgotpassword",
        data,
        { withCredentials: true }
      );

      if (res.data.success) {
        showToast("Your password has been changed!");
        navigate("/login");
      } else {
        showToast(res.data.message);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        showToast("User doesn't exist");
      } else {
        showToast("Something went wrong. Please try again.");
      }
      navigate("/register");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex flex-col">
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
      {/* Navbar */}
     <nav className="fixed top-0 left-0 w-full z-50 bg-black/30 backdrop-blur-lg shadow-md py-4 px-8 flex justify-between items-center">
             <h2 className="text-3xl font-extrabold text-indigo-400 tracking-wide">
               RentEase
             </h2>
             <div className="space-x-8 text-lg">
               <Link to="/" className="text-gray-200 hover:text-indigo-400 transition">
                 Home
               </Link>
               <Link to="/login" className="text-gray-200 hover:text-indigo-400 transition">
                 Login
               </Link>
               <Link
                 to="/register"
                 className="text-black bg-indigo-400 px-4 py-2 rounded-lg shadow hover:bg-indigo-500 transition"
               >
                 Register
               </Link>
             </div>
           </nav>

      {/* Forgot Password Form */}
      <div className="flex-grow flex justify-center items-center px-4">
        <div className="bg-gray-900/80 border border-gray-700 backdrop-blur-md shadow-2xl rounded-xl w-full max-w-md p-8">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-indigo-500/20 text-indigo-600 text-3xl font-bold shadow-inner">
              🔑
            </div>
            <h1 className="text-2xl font-semibold mt-4 text-white">
              Forgot Password?
            </h1>
            <p className="text-white text-sm mt-1">
              Enter your email and new password to reset your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              name="email"
              value={data.email}
              onChange={handleChange}
              placeholder="Email Address"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
            />
            <input
              type="password"
              name="password"
              value={data.password}
              onChange={handleChange}
              placeholder="New Password"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
            />
            <input
              type="password"
              name="confirmPassword"
              value={data.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
            />

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition duration-200"
            >
              Change Password
            </button>

            <div className="text-center text-red-400 text-sm mt-4">
              Don't have an account?{" "}
              <Link to="/register" className="text-indigo-600 hover:underline">
                Sign Up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

