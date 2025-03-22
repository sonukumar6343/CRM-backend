const orderModel = require("../models/order.model");
const workQueueModel =require("../models/workQueueItem.model");


exports.graphicsController = async(req,res)=>{
  try {
    console.log("welcome to graphics designer");
    
    return res.status(200).json({
        success:true,
        message:"welcome to graphics designer"
    })
    
  } catch (error) {
    return res.status(400).json({
        success:false,
        message:"error in grapghics cpontroller",
        error:error.message
    })
    
  }
}