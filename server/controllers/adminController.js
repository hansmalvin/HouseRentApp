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

/////////delete user their bookings///////////////
const deleteUserController = async (req, res) => {
  const { userid } = req.params;
  try {
    const user = await userSchema.findByIdAndDelete(userid);
    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }

    const { cloudinary } = require("../config/cloudinary");

    // OWNER 
    // If the deleted user was an Owner, delete all their properties
    // (Cloudinary images + all bookings on each property)
    if (user.type === "Owner") {
      const ownerProperties = await propertySchema.find({ ownerId: userid });

      await Promise.all(
        ownerProperties.map(async (property) => {
          try {
            // Delete all Cloudinary images for this property
            if (property.propertyImages?.length) {
              await Promise.all(
                property.propertyImages.map((img) =>
                  img.publicId
                    ? cloudinary.uploader.destroy(img.publicId)
                    : Promise.resolve()
                )
              );
            }
            // Delete all bookings tied to this property
            // covers both renter bookings and any owner-side records
            await bookingSchema.deleteMany({ propertyId: property._id });

            // Delete the property itself
            await propertySchema.findByIdAndDelete(property._id);
          } catch {
            // silent don't block the overall delete if one property fails
          }
        })
      );
    }

    // RENTER 
    // If the deleted user was a Renter, find their booked sale listings
    // first so we can reset isAvailable before deleting their bookings
    if (user.type === "Renter") {
      const activeBookings = await bookingSchema.find({
        $or: [{ userID: userid }, { renter: userid }],
        bookingStatus: "booked",
      });

      if (activeBookings.length > 0) {
        await Promise.all(
          activeBookings.map(async (booking) => {
            try {
              const property = await propertySchema.findById(booking.propertyId);
              if (
                property &&
                String(property.propertyAdType).toLowerCase() === "sale" &&
                property.isAvailable === "Unavailable"
              ) {
                await propertySchema.findByIdAndUpdate(
                  property._id,
                  { isAvailable: "Available" },
                  { new: true }
                );
              }
            } catch {
              // silent
            }
          })
        );
      }

      // Delete all their bookings
      await bookingSchema.deleteMany({
        $or: [{ userID: userid }, { renter: userid }],
      });
    }

    return res.status(200).send({
      success: true,
      message: "User and all related data deleted",
    });
  } catch (error) {
    console.log("Error in deleteUserController", error);
    return res.status(500).send({ success: false, message: "Failed to delete user" });
  }
};

/////////delete property///////////////
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