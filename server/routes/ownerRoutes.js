const express = require("express");
const multer = require("multer");
const { authMiddleware } = require("../middlewares/authMiddleware");
const {
  addPropertyController,
  getAllOwnerPropertiesController,
  handleAllBookingstatusController,
  deletePropertyController,
  updatePropertyController,
  getAllBookingsController,
} = require("../controllers/ownerController");
const { storage } = require("../config/cloudinary");

const router = express.Router();

const upload = multer({ storage });

router.post(
  "/postproperty",
  upload.array("propertyImages", 10),
  authMiddleware,
  addPropertyController
);

router.get("/getallproperties", authMiddleware, getAllOwnerPropertiesController);

router.get("/getallbookings", authMiddleware, getAllBookingsController);

router.post("/handlebookingstatus", authMiddleware, handleAllBookingstatusController);

router.delete(
  "/deleteproperty/:propertyid",
  authMiddleware,
  deletePropertyController
);

router.patch(
  "/updateproperty/:propertyid",
  upload.array("propertyImages", 10),
  authMiddleware,
  updatePropertyController
);

module.exports = router;