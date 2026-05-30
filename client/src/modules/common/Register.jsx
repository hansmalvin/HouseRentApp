import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Toast from "../common/Toast";
import RentEaseLogo from "../../components/RentEaseLogo";

axios.defaults.withCredentials = true;

const inputClass =
  "w-full rounded-xl border border-stone-200/90 bg-white/75 px-4 py-2.5 text-stone-700 shadow-sm placeholder:text-stone-400 backdrop-blur-sm transition focus:border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-100/90 sm:py-3";

const Register = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, type: "", message: "" });
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    type: "",
  });

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const emailValid = (email) => /^[^\s@]+@gmail\.com$/i.test(email.trim());

  const passwordValid = (password) =>
    password.length >= 6 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data.name || !data.email || !data.password || !data.type) {
      return showToast("error", "Please fill all fields");
    }

    if (!emailValid(data.email)) {
      return showToast("error", "Email must be a valid @gmail.com address");
    }

    if (!passwordValid(data.password)) {
      return showToast(
        "error",
        "Password must be at least 6 characters and include 1 uppercase letter, 1 number, and 1 symbol"
      );
    }

    try {
      const response = await axios.post(
        "http://localhost:8001/api/user/register",
        data,
        { withCredentials: true }
      );

      if (response.data.success) {
        showToast("success", response.data.message);
        setTimeout(() => navigate("/login"), 1000);
      } else {
        showToast("error", response.data.message);
      }
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
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

      {/* Background image */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/signin.png')" }}
        aria-hidden
      />

      {/* Light beige tint — keeps the photo visible */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-stone-100/35 via-amber-50/30 to-orange-50/25"
        aria-hidden
      />

      {/* Navbar */}
      <nav className="relative z-20 border-b border-stone-200/50 bg-stone-50/40 px-4 py-3 shadow-sm backdrop-blur-md sm:px-6 sm:py-4 max-[365px]:px-2 max-[365px]:py-2">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 max-[365px]:gap-1">
          <RentEaseLogo to="/" variant="light" size="md" className="shrink-0 max-[365px]:hidden" />
          <RentEaseLogo to="/" variant="light" size="sm" className="shrink-0 hidden max-[365px]:block" />
          <div className="flex items-center justify-end gap-2 text-sm font-medium sm:gap-6 sm:text-base max-[365px]:gap-1 max-[365px]:text-xs">
            <Link
              to="/"
              className="rounded-lg px-3 py-1.5 text-stone-700 transition hover:bg-white/50 hover:text-amber-900 max-[365px]:px-1.5 max-[365px]:py-1"
            >
              Home
            </Link>
            <Link
              to="/login"
              className="rounded-lg px-3 py-1.5 text-stone-700 transition hover:bg-white/50 hover:text-amber-900 max-[365px]:px-1.5 max-[365px]:py-1"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-gradient-to-r from-amber-100 to-stone-200 px-4 py-2 text-stone-800 shadow-sm ring-1 ring-stone-200/80 transition hover:from-amber-200 hover:to-stone-300 hover:shadow-md max-[365px]:px-2 max-[365px]:py-1"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="w-full max-w-md sm:max-w-lg">
          <div className="overflow-hidden rounded-2xl border border-stone-200/70 bg-stone-50/65 shadow-xl shadow-stone-300/25 backdrop-blur-md sm:rounded-3xl">
            <div className="border-b border-stone-200/60 bg-gradient-to-r from-stone-100/85 via-amber-50/80 to-orange-50/75 px-5 py-6 text-center sm:px-8 sm:py-8">
              <h1 className="text-2xl font-bold tracking-tight text-stone-800 sm:text-3xl">
                Create your account
              </h1>
              <p className="mt-2 text-sm text-stone-600 sm:text-base">
                Join Rentr as a renter or property owner
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 px-5 py-6 sm:space-y-5 sm:px-8 sm:py-8"
            >
              <div>
                <label
                  htmlFor="register-name"
                  className="mb-1.5 block text-sm font-medium text-stone-600"
                >
                  Full name
                </label>
                <input
                  id="register-name"
                  type="text"
                  name="name"
                  value={data.name}
                  onChange={handleChange}
                  placeholder="Renter or owner name"
                  autoComplete="name"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="register-email"
                  className="mb-1.5 block text-sm font-medium text-stone-600"
                >
                  Email
                </label>
                <input
                  id="register-email"
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
                  htmlFor="register-password"
                  className="mb-1.5 block text-sm font-medium text-stone-600"
                >
                  Password
                </label>
                <input
                  id="register-password"
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
                <span className="mb-2 block text-sm font-medium text-stone-600">
                  Account type
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "Renter", label: "Renter" },
                    { value: "Owner", label: "Owner" },
                  ].map(({ value, label }) => {
                    const selected = data.type === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setData({ ...data, type: value })}
                        className={`rounded-xl border px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 focus:ring-offset-stone-50/80 ${
                          selected
                            ? "border-amber-300 bg-gradient-to-r from-amber-100 via-stone-200 to-orange-100 text-stone-800 shadow-md ring-1 ring-amber-200/80"
                            : "border-stone-200/90 bg-white/75 text-stone-600 hover:border-amber-200 hover:bg-amber-50/50"
                        }`}
                        aria-pressed={selected}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-amber-200 via-stone-300 to-orange-200 py-3 text-base font-semibold text-stone-800 shadow-md shadow-stone-300/50 transition hover:from-amber-300 hover:via-stone-400 hover:to-orange-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 focus:ring-offset-stone-50/80 active:scale-[0.99] sm:py-3.5"
              >
                Sign up
              </button>

              <p className="text-center text-sm text-stone-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-amber-800 underline-offset-2 transition hover:text-amber-950 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-stone-600/90 drop-shadow-sm sm:text-sm">
            By signing up, you agree to use Rentr responsibly.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Register;
