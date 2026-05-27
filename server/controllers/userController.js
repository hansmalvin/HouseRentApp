const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userSchema = require("../models/UserSchema");
const propertySchema = require("../models/PropertySchema");
const bookingSchema = require("../models/BookingSchema");

//////////for registering/////////////////////////////
const registerController = async (req, res) => {
  try {
    if (req.body.type === "Admin") {
      return res.status(403).send({
        message: "Admin accounts cannot be registered",
        success: false,
      });
    }

    if (!["Renter", "Owner"].includes(req.body.type)) {
      return res.status(400).send({
        message: "Invalid account type",
        success: false,
      });
    }

    let granted = "";
    const existsUser = await userSchema.findOne({ email: req.body.email });
    if (existsUser) {
      return res
        .status(200)
        .send({ message: "User already exists", success: false });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;

    if (req.body.type === "Owner") {
      granted = "ungranted";
      const newUser = new userSchema({ ...req.body, granted });
      await newUser.save();
    } else {
      const newUser = new userSchema(req.body);
      await newUser.save();
    }

    return res.status(201).send({ message: "Register Success", success: true });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: `${error.message}` });
  }
};

////for the login
const loginController = async (req, res) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;
    const loginEmail = req.body.email?.trim().toLowerCase();

    if (
      adminEmail &&
      adminPassword &&
      loginEmail === adminEmail &&
      req.body.password === adminPassword
    ) {
      const token = jwt.sign({ id: "admin", role: "Admin" }, process.env.JWT_KEY, {
        expiresIn: "1d",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.status(200).send({
        message: "Login success successfully",
        success: true,
        user: {
          _id: "admin",
          name: "Admin",
          email: process.env.ADMIN_EMAIL?.trim(),
          type: "Admin",
        },
      });
    }

    const user = await userSchema.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "User not found", success: false });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);

    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Invalid email or password", success: false });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, {
      expiresIn: "1d",
    });

    user.password = undefined;

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.status(200).send({
      message: "Login success successfully",
      success: true,
      user: user,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: `${error.message}` });
  }
};

/////forgotting password
const forgotPasswordController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const updatedUser = await userSchema.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { returnDocument: "after" }
    );

    if (!updatedUser) {
      return res
        .status(200)
        .send({ message: "User not found", success: false });
    }

    return res.status(200).send({
      message: "Password changed successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: `${error.message}` });
  }
};

const updateProfileController = async (req, res) => {
  try {
    const { userId, name } = req.body;
    const trimmedName = typeof name === "string" ? name.trim() : "";

    if (!trimmedName) {
      return res
        .status(200)
        .send({ message: "Name is required", success: false });
    }

    const updatedUser = await userSchema.findByIdAndUpdate(
      userId,
      { name: trimmedName },
      { returnDocument: "after" }
    );

    if (!updatedUser) {
      return res
        .status(200)
        .send({ message: "User not found", success: false });
    }

    updatedUser.password = undefined;

    return res.status(200).send({
      success: true,
      message: "Profile updated",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: `${error.message}` });
  }
};

////auth controller
const authController = async (req, res) => {
  console.log(req.body);
  try {
    const user = await userSchema.findOne({ _id: req.body.userId });
    console.log(user);
    if (!user) {
      return res
        .status(200)
        .send({ message: "user not found", success: false });
    } else {
      return res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: "auth error", success: false, error });
  }
};

/////////get all properties in home
const getAllPropertiesController = async (req, res) => {
  try {
    const allProperties = await propertySchema.find({});
    if (!allProperties) {
      throw new Error("No properties available");
    } else {
      res.status(200).send({ success: true, data: allProperties });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: "auth error", success: false, error });
  }
};

/////////get single property by ID (for detail page)
const getPropertyByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await propertySchema.findById(id).lean();
    if (!property) {
      return res.status(404).send({ success: false, message: "Property not found" });
    }
    // Populate owner email from UserSchema via ownerId
    const owner = await userSchema.findById(property.ownerId).select("email").lean();
    property.ownerEmail = owner?.email || null;
    return res.status(200).send({ success: true, data: property });
  } catch (error) {
    console.error("Error fetching property by ID:", error);
    return res.status(500).send({ success: false, message: "Failed to fetch property" });
  }
};

///////////booking handle///////////////
const bookingHandleController = async (req, res) => {
  const { propertyid } = req.params;
  const { userDetails, status, userId, ownerId, checkIn, checkOut } = req.body;

  try {
    // ── Prorated price calculation ────────────────────────────────
    let totalDays = null;
    let totalPrice = null;

    if (checkIn && checkOut) {
      const inDate = new Date(checkIn);
      const outDate = new Date(checkOut);
      const diffMs = outDate.getTime() - inDate.getTime();
      totalDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));

      // Fetch the property to get its monthly price
      const property = await propertySchema.findById(propertyid).lean();
      if (property && property.propertyAmt) {
        // Price per day = monthly price / 30
        const dailyRate = property.propertyAmt / 30;
        totalPrice = Math.round(dailyRate * totalDays);
      }
    }

    const booking = new bookingSchema({
      propertyId: propertyid,
      userID: userId,
      ownerID: ownerId,
      userName: userDetails.fullName,
      phone: userDetails.phone,
      bookingStatus: status,
      checkIn: checkIn ? new Date(checkIn) : null,
      checkOut: checkOut ? new Date(checkOut) : null,
      totalDays,
      totalPrice,
    });

    await booking.save();

    return res.status(200).send({
      success: true,
      message: "Booking status updated",
      data: { totalDays, totalPrice },
    });
  } catch (error) {
    console.error("Error handling booking:", error);
    return res
      .status(500)
      .send({ success: false, message: "Error handling booking" });
  }
};

/////get all bookings for single tenants//////
const getAllBookingsController = async (req, res) => {
  const { userId } = req.body;
  try {
    const getAllBookings = await bookingSchema.find();
    const updatedBookings = getAllBookings.filter(
      (booking) => booking.userID.toString() === userId
    );
    return res.status(200).send({
      success: true,
      data: updatedBookings,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ message: "Internal server error", success: false });
  }
};

module.exports = {
  registerController,
  loginController,
  forgotPasswordController,
  updateProfileController,
  authController,
  getAllPropertiesController,
  getPropertyByIdController,
  bookingHandleController,
  getAllBookingsController,
};
