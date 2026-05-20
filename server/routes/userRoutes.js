const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { registerController, loginController, forgotPasswordController, getAllPropertiesController, updateProfileController, authController, bookingHandleController, getAllBookingsController } = require("../controllers/userController");


const router = express.Router();

router.post("/register", registerController);

router.post("/login", loginController);

router.post("/forgotpassword", forgotPasswordController);

router.get('/getAllProperties', getAllPropertiesController)

router.post("/getuserdata", authMiddleware, authController);

router.patch("/updateprofile", authMiddleware, updateProfileController);

router.post("/bookinghandle/:propertyid", authMiddleware, bookingHandleController);

router.get('/getallbookings', authMiddleware, getAllBookingsController)

module.exports = router;