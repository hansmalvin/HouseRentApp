const mongoose = require('mongoose')

const propertyModel = mongoose.Schema({
   ownerId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
   },
   propertyType:{
      type:String,
      required:[true,'Please provide a Property Type']
   },
   propertyAdType:{
      type: String,
      required:[true,'Please provide a Property Ad Type']
   },
   propertyAddress:{
      type: String,
      required:[true,"Please Provide an Address"]
   },
   ownerContact:{
      type: String,
      required: [true, 'Please provide owner contact']
   },
   propertyAmt:{
      type :Number ,
      default: 0,
   },
   propertyImages:{
      type: [
         {
            url: { type: String },
            publicId: { type: String },
         }
      ],
      default: [],
   },
   additionalInfo:{
      type: String,
   },
   amenities: {
      type: [String],
      default: [],
   },
   ownerName: {
      type: String,
   },
   isAvailable: {
      type: String,
      enum: ["Available", "Unavailable"],
      default: "Available",
   },
},{
   strict: false,
})

const propertySchema = mongoose.model('propertyschema', propertyModel)

module.exports = propertySchema