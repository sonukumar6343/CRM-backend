const mongoose= require("mongoose");
const workQueueSchema= new mongoose.Schema({
    orderId:{
        type:mongoose.Types.ObjectId,
        ref:'Order',
        required:true
    },
    status:{
        type:String,
        enum:["Pending","InProgress","Completed"],
        default:"Pending"

    },
    assignedTo:{
        type:mongoose.Types.ObjectId,
        ref:'User'

    },
    priority:{
        type:Number,
        default:1,
    },
    StartedAt:{
        Date,
    },
    CompletedAt:{
        Date
    }




},{timeStamp:true})

module.exports = mongoose.model("WorkQueue",workQueueSchema);