const mongoose = require("mongoose");

const bookingModel = mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "propertyschema",
    },
    ownerID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    userName: {
      type: String,
      required: [true, "Please provide a User Name"],
    },
    phone: {
      type: String,
      required: [true, "Please provide a Phone Number"],
    },
    bookingStatus: {
      type: String,
      required: [true, "Please provide a booking Type"],
    },
    // Date fields (rent listings only)
    checkIn: {
      type: Date,
      default: null,
    },
    checkOut: {
      type: Date,
      default: null,
    },
    totalDays: {
      type: Number,
      default: null,
    },
    totalPrice: {
      type: Number,
      default: null,
    },
  },
  {
    strict: false,
  }
);

const bookingSchema = mongoose.model("bookingschema", bookingModel);

module.exports = bookingSchema;
