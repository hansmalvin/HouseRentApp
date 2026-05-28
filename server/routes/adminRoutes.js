const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { getAllUsersController, handleStatusController, getAllPropertiesController, getAllBookingsController, deleteUserController, adminDeletePropertyController, adminDeleteBookingController } = require("../controllers/adminController");

const router = express.Router()

router.get('/getallusers', authMiddleware, getAllUsersController)

router.post('/handlestatus', authMiddleware, handleStatusController)

router.get('/getallproperties', authMiddleware, getAllPropertiesController)

router.get('/getallbookings', authMiddleware, getAllBookingsController)

router.delete('/deleteuser/:userid', authMiddleware, deleteUserController)
router.delete('/deleteproperty/:propertyid', authMiddleware, adminDeletePropertyController)
router.delete('/deletebooking/:bookingid', authMiddleware, adminDeleteBookingController)

module.exports = router