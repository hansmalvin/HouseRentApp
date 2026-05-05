import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import p1 from "../../images/p1.jpg";
import p2 from "../../images/p2.jpg";
import p3 from "../../images/p3.jpg";
import p4 from "../../images/p4.jpg";
import AllPropertiesCards from "../user/AllPropertiesCards";

const images = [p1, p2, p3, p4];

const Home = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-800 via-gray-900 to-black">
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

      {/* Hero Section */}
      <div className="relative w-full h-[70vh] mt-16 overflow-hidden">
        {images.map((img, idx) => (
          <div
            key={idx}
            className={`absolute w-full h-full transition-opacity duration-1000 ${currentIndex === idx ? "opacity-100" : "opacity-0"
              }`}
          >
            <img src={img} alt={`Slide ${idx}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          </div>
        ))}

        {/* Center Text */}
        <div className="absolute bottom-20 w-full text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-lg mb-4 animate-fadeIn">
            Find Your Dream Rental Property
          </h1>
          <p className="text-lg md:text-xl font-light drop-shadow-md text-gray-200">
            Comfort, Convenience & Class — All in One Place
          </p>
        </div>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${currentIndex === idx
                  ? "bg-indigo-400 scale-125 shadow-lg"
                  : "bg-gray-400 hover:bg-indigo-300"
                }`}
            ></button>
          ))}
        </div>
      </div>

      {/* Properties Section */}
      <div className="max-w-7xl mx-auto w-full py-20 px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Explore Our Premium Properties
          </h1>
          <p className="text-gray-300 font-medium text-lg max-w-2xl mx-auto">
            Looking to post your property?
            <Link
              to="/register"
              className="ml-2 px-4 py-2 border border-indigo-400 text-indigo-400 rounded-lg hover:bg-indigo-500 hover:text-white transition duration-300"
            >
              Register as Owner
            </Link>
          </p>
        </div>

        {/* Property Cards */}
        <div className="mt-12">
          <AllPropertiesCards />
        </div>
      </div>
    </div>

  );
};

export default Home;
