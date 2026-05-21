import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Toast from "../common/Toast";
import RentEaseLogo from "../../components/RentEaseLogo";

axios.defaults.withCredentials = true;

const inputClass =
  "w-full rounded-xl border border-stone-200/90 bg-white/75 px-4 py-2.5 text-stone-700 shadow-sm placeholder:text-stone-400 backdrop-blur-sm transition focus:border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-100/90 sm:py-3";

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
      return showToast("error", "Please fill all fields");
    }

    if (data.password !== data.confirmPassword) {
      return showToast("error", "Passwords do not match");
    }

    try {
      const res = await axios.post(
        "http://localhost:8001/api/user/forgotpassword",
        data,
        { withCredentials: true }
      );

      if (res.data.success) {
        showToast("success", "Your password has been changed!");
        setTimeout(() => navigate("/login"), 1000);
      } else {
        showToast("error", res.data.message);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        showToast("error", "User doesn't exist");
      } else {
        showToast("error", "Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-x-hidden">
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/signin.png')" }}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-stone-100/35 via-amber-50/30 to-orange-50/25"
        aria-hidden
      />

      <nav className="relative z-20 border-b border-stone-200/50 bg-stone-50/40 px-4 py-3 shadow-sm backdrop-blur-md sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <RentEaseLogo to="/" variant="light" size="md" className="shrink-0" />
          <div className="flex flex-wrap items-center justify-end gap-2 text-sm font-medium sm:gap-6 sm:text-base">
            <Link
              to="/"
              className="rounded-lg px-3 py-1.5 text-stone-700 transition hover:bg-white/50 hover:text-amber-900"
            >
              Home
            </Link>
            <Link
              to="/login"
              className="rounded-xl bg-gradient-to-r from-amber-100 to-stone-200 px-4 py-2 text-stone-800 shadow-sm ring-1 ring-stone-200/80 transition hover:from-amber-200 hover:to-stone-300 hover:shadow-md"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg px-3 py-1.5 text-stone-700 transition hover:bg-white/50 hover:text-amber-900"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="w-full max-w-md sm:max-w-lg">
          <div className="overflow-hidden rounded-2xl border border-stone-200/70 bg-stone-50/65 shadow-xl shadow-stone-300/25 backdrop-blur-md sm:rounded-3xl">
            <div className="border-b border-stone-200/60 bg-gradient-to-r from-stone-100/85 via-amber-50/80 to-orange-50/75 px-5 py-6 text-center sm:px-8 sm:py-8">
              <h1 className="text-2xl font-bold tracking-tight text-stone-800 sm:text-3xl">
                Reset your password
              </h1>
              <p className="mt-2 text-sm text-stone-600 sm:text-base">
                Enter your email and choose a new password
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 px-5 py-6 sm:space-y-5 sm:px-8 sm:py-8"
            >
              <div>
                <label
                  htmlFor="forgot-email"
                  className="mb-1.5 block text-sm font-medium text-stone-600"
                >
                  Email
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  name="email"
                  value={data.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="forgot-password"
                  className="mb-1.5 block text-sm font-medium text-stone-600"
                >
                  New password
                </label>
                <input
                  id="forgot-password"
                  type="password"
                  name="password"
                  value={data.password}
                  onChange={handleChange}
                  placeholder="Choose a secure password"
                  autoComplete="new-password"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="forgot-confirm-password"
                  className="mb-1.5 block text-sm font-medium text-stone-600"
                >
                  Confirm password
                </label>
                <input
                  id="forgot-confirm-password"
                  type="password"
                  name="confirmPassword"
                  value={data.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-amber-200 via-stone-300 to-orange-200 py-3 text-base font-semibold text-stone-800 shadow-md shadow-stone-300/50 transition hover:from-amber-300 hover:via-stone-400 hover:to-orange-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 focus:ring-offset-stone-50/80 active:scale-[0.99] sm:py-3.5"
              >
                Change password
              </button>

              <p className="text-center text-sm text-stone-600">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-amber-800 underline-offset-2 transition hover:text-amber-950 hover:underline"
                >
                  Sign in
                </Link>
              </p>

              <p className="text-center text-sm text-stone-600">
                Don&apos;t have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-amber-800 underline-offset-2 transition hover:text-amber-950 hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-stone-600/90 drop-shadow-sm sm:text-sm">
            Use the email linked to your Rentr account.
          </p>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
