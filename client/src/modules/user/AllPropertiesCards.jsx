import axios from "axios";
import React, { useState, useEffect } from "react";
import Toast from "../common/Toast";


const AllPropertiesCards = ({ loggedIn }) => {
  const [allProperties, setAllProperties] = useState([]);
  const [filterPropertyType, setPropertyType] = useState("");
  const [filterPropertyAdType, setPropertyAdType] = useState("");
  const [filterPropertyAddress, setPropertyAddress] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [userDetails, setUserDetails] = useState({ fullName: "", phone: "" });
  const [toast, setToast] = useState({ show: false, type: "", message: "" });

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const getAllProperties = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8001/api/user/getAllProperties",
        { withCredentials: true }
      );
      setAllProperties(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleBooking = async (status, propertyId, ownerId) => {
    try {
      const res = await axios.post(
        `http://localhost:8001/api/user/bookinghandle/${propertyId}`,
        { userDetails, status, ownerId },
        { withCredentials: true }
      );

      if (res.data.success) {
        showToast(res.data.message);
        setShowModal(false);
      } else {
        showToast(res.data.message);
      }
    } catch (error) {
      console.log(error);
      showToast("Booking failed");
    }
  };

  useEffect(() => {
    getAllProperties();
  }, []);

  const filteredProperties = allProperties
    .filter(
      (property) =>
        filterPropertyAddress === "" ||
        property.propertyAddress
          .toLowerCase()
          .includes(filterPropertyAddress.toLowerCase())
    )
    .filter(
      (property) =>
        filterPropertyAdType === "" ||
        property.propertyAdType
          .toLowerCase()
          .includes(filterPropertyAdType.toLowerCase())
    )
    .filter(
      (property) =>
        filterPropertyType === "" ||
        property.propertyType
          .toLowerCase()
          .includes(filterPropertyType.toLowerCase())
    );

  const openModal = (property) => {
    setSelectedProperty(property);
    setShowModal(true);
  };

  return (
    <div className="p-6 text-white">
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Filters */}
      <div className="flex gap-4 items-center mb-6">
        <input
          type="text"
          placeholder="Search by Address"
          value={filterPropertyAddress}
          onChange={(e) => setPropertyAddress(e.target.value)}
          className="bg-gray-800/70 border border-gray-700 p-2 rounded w-1/3 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={filterPropertyAdType}
          onChange={(e) => setPropertyAdType(e.target.value)}
          className="bg-gray-800/70 border border-gray-700 p-2 rounded text-white focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Ad Types</option>
          <option value="sale">Sale</option>
          <option value="rent">Rent</option>
        </select>
        <select
          value={filterPropertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          className="bg-gray-800/70 border border-gray-700 p-2 rounded text-white focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Types</option>
          <option value="commercial">Commercial</option>
          <option value="land/plot">Land/Plot</option>
          <option value="residential">Residential</option>
        </select>
      </div>

      {/* Property Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.length > 0 ? (
          filteredProperties.map((property) => (
            <div
              key={property._id}
              className="bg-gray-800/70 border border-gray-700 rounded-lg shadow-lg hover:shadow-indigo-600/40 transition transform hover:-translate-y-1 overflow-hidden"
            >
              <img
                src={`http://localhost:8001${property.propertyImage[0]?.path}`}
                alt="Property"
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg text-white">{property.propertyAddress}</h3>
                <p className="text-gray-400 text-sm">
                  {property.propertyType} - {property.propertyAdType}
                </p>
                {loggedIn && (
                  <>
                    <p className="mt-2 text-sm">
                      <b>Owner:</b> {property.ownerContact}
                    </p>
                    <p className="text-sm">
                      <b>Availability:</b> {property.isAvailable}
                    </p>
                    <p className="text-sm">
                      <b>Price:</b> ₹{property.propertyAmt}
                    </p>
                  </>
                )}
                {property.isAvailable === "Available" ? (
                  loggedIn ? (
                    <button
                      onClick={() => openModal(property)}
                      className="mt-3 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
                    >
                      Get Info / Book
                    </button>
                  ) : (
                    <p className="mt-2 text-yellow-400 text-xs">
                      Login to see details
                    </p>
                  )
                ) : (
                  <p className="mt-2 text-red-400 text-xs">Not Available</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No properties available at the moment.</p>
        )}
      </div>

      {/* Booking Modal */}
      {showModal && selectedProperty && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 backdrop-blur-sm">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-2xl relative border border-gray-700 shadow-xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              ✖
            </button>
            <h3 className="text-xl font-bold mb-4 text-white">Property Info</h3>
            <img
              src={`http://localhost:8001${selectedProperty.propertyImage[0]?.path}`}
              alt="Property"
              className="w-full h-48 object-cover rounded mb-4"
            />
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <p>
                  <b>Owner Contact:</b> {selectedProperty.ownerContact}
                </p>
                <p>
                  <b>Availability:</b> {selectedProperty.isAvailable}
                </p>
                <p>
                  <b>Price:</b> ₹{selectedProperty.propertyAmt}
                </p>
              </div>
              <div>
                <p>
                  <b>Location:</b> {selectedProperty.propertyAddress}
                </p>
                <p>
                  <b>Type:</b> {selectedProperty.propertyType}
                </p>
                <p>
                  <b>Ad Type:</b> {selectedProperty.propertyAdType}
                </p>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-300">
              <b>Additional Info:</b> {selectedProperty.additionalInfo}
            </p>

            {/* Booking Form */}
            <form
              className="mt-4 space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleBooking("pending", selectedProperty._id, selectedProperty.ownerId);
              }}
            >
              <input
                type="text"
                name="fullName"
                placeholder="Your Full Name"
                required
                className="bg-gray-800 border border-gray-700 p-2 w-full rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
                value={userDetails.fullName}
                onChange={(e) =>
                  setUserDetails({ ...userDetails, fullName: e.target.value })
                }
              />
              <input
                type="number"
                name="phone"
                placeholder="Phone Number"
                required
                className="bg-gray-800 border border-gray-700 p-2 w-full rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
                value={userDetails.phone}
                onChange={(e) =>
                  setUserDetails({ ...userDetails, phone: e.target.value })
                }
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
              >
                Book Property
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllPropertiesCards;
