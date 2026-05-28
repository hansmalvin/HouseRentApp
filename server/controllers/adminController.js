const userSchema = require("../models/UserSchema");
const propertySchema = require("../models/PropertySchema");
const bookingSchema = require("../models/BookingSchema");

/////////getting all users///////////////
const getAllUsersController = async (req, res) => {
  try {
    const allUsers = await userSchema.find({});
    if (!allUsers) {
      return res.status(401).send({
        success: false,
        message: "No users presents",
      });
    } else {
      return res.status(200).send({
        success: true,
        message: "All users",
        data: allUsers,
      });
    }
  } catch (error) {
    console.log("Error in get All Users Controller ", error);
  }
};

/////////handling status for owner/////////
const handleStatusController = async (req, res) => {
  const { userid, status } = req.body;
  try {
    const user = await userSchema.findByIdAndUpdate(
      userid,
      { granted: status },
      { returnDocument: "after" }
    );
    return res.status(200).send({
      success: true,
      message: `User has been ${status}`,
    });
  } catch (error) {
    console.log("Error in get All Users Controller ", error);
  }
};

/////////getting all properties in app//////////////
const getAllPropertiesController = async (req, res) => {
  try {
    const allProperties = await propertySchema.find({});
    if (!allProperties) {
      return res.status(401).send({
        success: false,
        message: "No properties presents",
      });
    } else {
      return res.status(200).send({
        success: true,
        message: "All properties",
        data: allProperties,
      });
    }
  } catch (error) {
    console.log("Error in get All Users Controller ", error);
  }
};

////////get all bookings////////////
const getAllBookingsController = async (req, res) => {
  try {
    const allBookings = await bookingSchema.find();
    return res.status(200).send({
      success: true,
      data: allBookings,
    });
  } catch (error) {
    console.log("Error in get All Users Controller ", error);
  }
};

/////////delete user + their bookings///////////////
const deleteUserController = async (req, res) => {
  const { userid } = req.params;
  try {
    const user = await userSchema.findByIdAndDelete(userid);
    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }
    await bookingSchema.deleteMany({
      $or: [{ userID: userid }, { renter: userid }],
    });
    return res.status(200).send({ success: true, message: "User and their bookings deleted" });
  } catch (error) {
    console.log("Error in deleteUserController", error);
    return res.status(500).send({ success: false, message: "Failed to delete user" });
  }
};

/////////delete property (reuses owner logic — also cleans up bookings)///////////////
const adminDeletePropertyController = async (req, res) => {
  const { propertyid } = req.params;
  try {
    const property = await propertySchema.findByIdAndDelete(propertyid);
    if (!property) {
      return res.status(404).send({ success: false, message: "Property not found" });
    }
    // Delete Cloudinary images if present
    if (property.propertyImages?.length) {
      const cloudinary = require("../config/cloudinary").cloudinary;
      await Promise.all(
        property.propertyImages.map((img) =>
          img.publicId ? cloudinary.uploader.destroy(img.publicId) : Promise.resolve()
        )
      );
    }
    // Delete all bookings tied to this property
    await bookingSchema.deleteMany({ propertyId: propertyid });
    return res.status(200).send({ success: true, message: "Property and related bookings deleted" });
  } catch (error) {
    console.log("Error in adminDeletePropertyController", error);
    return res.status(500).send({ success: false, message: "Failed to delete property" });
  }
};

/////////delete a single booking///////////////
const adminDeleteBookingController = async (req, res) => {
  const { bookingid } = req.params;
  try {
    const booking = await bookingSchema.findByIdAndDelete(bookingid);
    if (!booking) {
      return res.status(404).send({ success: false, message: "Booking not found" });
    }
    return res.status(200).send({ success: true, message: "Booking deleted" });
  } catch (error) {
    console.log("Error in adminDeleteBookingController", error);
    return res.status(500).send({ success: false, message: "Failed to delete booking" });
  }
};

module.exports = {
  getAllUsersController,
  handleStatusController,
  getAllPropertiesController,
  getAllBookingsController,
  deleteUserController,
  adminDeletePropertyController,
  adminDeleteBookingController,
};