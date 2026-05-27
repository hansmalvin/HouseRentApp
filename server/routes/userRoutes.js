const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const {
  registerController,
  loginController,
  forgotPasswordController,
  getAllPropertiesController,
  getPropertyByIdController,
  updateProfileController,
  authController,
  bookingHandleController,
  cancelBookingController,
  updateBookingController,
  getAllBookingsController,
  reverseGeocodeController,
} = require("../controllers/userController");

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/forgotpassword", forgotPasswordController);
router.get("/getAllProperties", getAllPropertiesController);

// Single property detail — public, no auth required
router.get("/property/:id", getPropertyByIdController);

router.post("/getuserdata", authMiddleware, authController);
router.patch("/updateprofile", authMiddleware, updateProfileController);

// Booking CRUD
router.post("/bookinghandle/:propertyid", authMiddleware, bookingHandleController);
router.delete("/cancelbooking/:bookingid", authMiddleware, cancelBookingController);
router.patch("/updatebooking/:bookingid", authMiddleware, updateBookingController);

router.get("/getallbookings", authMiddleware, getAllBookingsController);
router.get("/reversegeocode", reverseGeocodeController);

module.exports = router;
