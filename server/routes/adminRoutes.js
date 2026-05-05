const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { getAllUsersController, handleStatusController, getAllPropertiesController, getAllBookingsController } = require("../controllers/adminController");


const router = express.Router()

router.get('/getallusers', authMiddleware, getAllUsersController)

router.post('/handlestatus', authMiddleware, handleStatusController)

router.get('/getallproperties', authMiddleware, getAllPropertiesController)

router.get('/getallbookings', authMiddleware, getAllBookingsController)

module.exports = router