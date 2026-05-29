const userSchema = require("../models/UserSchema");
const propertySchema = require("../models/PropertySchema");
const bookingSchema = require("../models/BookingSchema");
const { cloudinary } = require("../config/cloudinary");

//////////adding property by owner////////
const addPropertyController = async (req, res) => {
  try {
    const propertyImages = (req.files || []).map((file) => ({
      url: file.path,
      publicId: file.filename,
    }));

    const user = await userSchema.findById(req.body.userId);

    // amenities is sent as a JSON string from FormData; parse it back to an array
    let amenities = [];
    if (req.body.amenities) {
      try {
        amenities = JSON.parse(req.body.amenities);
      } catch {
        amenities = [];
      }
    }

    const newPropertyData = new propertySchema({
      ...req.body,
      propertyImages,
      amenities,
      ownerId: user._id,
      ownerName: user.name,
      isAvailable: "Available",
    });

    await newPropertyData.save();

    return res.status(200).send({
      success: true,
      message: "New Property has been stored",
    });
  } catch (error) {
    console.log("Error in addPropertyController:", error);
    return res.status(500).send({
      success: false,
      message: "Failed to add property",
      error: error.message,
    });
  }
};

///////////all properties of owner/////////
const getAllOwnerPropertiesController = async (req, res) => {
  const { userId } = req.body;
  try {
    const getAllProperties = await propertySchema.find();
    const updatedProperties = getAllProperties.filter(
      (property) => property.ownerId.toString() === userId
    );
    return res.status(200).send({
      success: true,
      data: updatedProperties,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error", success: false });
  }
};

//////delete the property by owner/////
const deletePropertyController = async (req, res) => {
  const propertyId = req.params.propertyid;
  try {
    const property = await propertySchema.findById(propertyId);
    if (!property) {
      return res.status(404).send({ success: false, message: "Property not found" });
    }

    // Delete all images from Cloudinary
    if (property.propertyImages?.length) {
      await Promise.all(
        property.propertyImages.map((img) =>
          cloudinary.uploader.destroy(img.publicId)
        )
      );
    }

    await propertySchema.findByIdAndDelete(propertyId);

    return res.status(200).send({
      success: true,
      message: "The property is deleted",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error", success: false });
  }
};

//////updating the property/////////////
const updatePropertyController = async (req, res) => {
  const { propertyid } = req.params;
  try {
    const updateData = { ...req.body };
    delete updateData.userId;

    // amenities is sent as a JSON string from FormData; parse it back to an array
    if (updateData.amenities) {
      try {
        updateData.amenities = JSON.parse(updateData.amenities);
      } catch {
        updateData.amenities = [];
      }
    }

    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      const existing = await propertySchema.findById(propertyid);
      if (existing?.propertyImages?.length) {
        await Promise.all(
          existing.propertyImages.map((img) =>
            cloudinary.uploader.destroy(img.publicId)
          )
        );
      }

      updateData.propertyImages = req.files.map((file) => ({
        url: file.path,
        publicId: file.filename,
      }));
    }

    const property = await propertySchema.findOneAndUpdate(
      { _id: propertyid, ownerId: req.body.userId },
      updateData,
      { returnDocument: "after" }
    );

    if (!property) {
      return res.status(404).send({
        success: false,
        message: "Property not found or unauthorized update.",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Property updated successfully.",
    });
  } catch (error) {
    console.error("Error updating property:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update property.",
    });
  }
};

const getAllBookingsController = async (req, res) => {
  const { userId } = req.body;
  try {
    const getAllBookings = await bookingSchema.find({ ownerID: userId });

    // Enrich each booking with the renter's email from UserSchema
    const enriched = await Promise.all(
      getAllBookings.map(async (booking) => {
        const obj = booking.toObject();
        try {
          const renter = await userSchema.findById(booking.userID).select("email");
          obj.userEmail = renter?.email ?? null;
        } catch {
          obj.userEmail = null;
        }
        return obj;
      })
    );

    return res.status(200).send({
      success: true,
      data: enriched,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error", success: false });
  }
};

//////////handle bookings status//////////////
const handleAllBookingstatusController = async (req, res) => {
  const { bookingId, propertyId, status } = req.body;
  try {
    await bookingSchema.findByIdAndUpdate(
      { _id: bookingId },
      { bookingStatus: status },
      { returnDocument: "after" }
    );

    await propertySchema.findByIdAndUpdate(
      { _id: propertyId },
      { isAvailable: status === "booked" ? "Unavailable" : "Available" },
      { returnDocument: "after" }
    );

    return res.status(200).send({
      success: true,
      message: `Changed the status of property to ${status}`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error", success: false });
  }
};

const terminateBookingController = async (req, res) => {
  const { bookingid } = req.params;
  const { userId } = req.body;
  try {
    const booking = await bookingSchema.findById(bookingid);
    if (!booking) {
      return res.status(404).send({ success: false, message: "Booking not found" });
    }
    // Only allow termination of pending bookings
    if (booking.bookingStatus === "booked") {
      return res.status(400).send({ success: false, message: "Cannot terminate a confirmed booking" });
    }
    // Verify the owner owns the property linked to this booking
    if (booking.ownerID.toString() !== userId) {
      return res.status(403).send({ success: false, message: "Not authorised to terminate this booking" });
    }
    await bookingSchema.findByIdAndDelete(bookingid);
    return res.status(200).send({ success: true, message: "Booking terminated successfully" });
  } catch (error) {
    console.error("Error terminating booking:", error);
    return res.status(500).send({ success: false, message: "Failed to terminate booking" });
  }
};

module.exports = {
  addPropertyController,
  getAllOwnerPropertiesController,
  deletePropertyController,
  updatePropertyController,
  getAllBookingsController,
  handleAllBookingstatusController,
  terminateBookingController,
};