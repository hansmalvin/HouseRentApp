const express = require("express");
const multer = require("multer");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { addPropertyController, getAllOwnerPropertiesController, handleAllBookingstatusController, deletePropertyController, updatePropertyController, getAllBookingsController } = require("../controllers/ownerController");


const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post(
  "/postproperty",
  upload.array("propertyImages"),
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
  upload.single("propertyImage"),
  authMiddleware,
  updatePropertyController
);

module.exports = router;