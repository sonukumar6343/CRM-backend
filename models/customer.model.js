const mongoose= require("mongoose");
const customerSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    phoneNo:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        trim:true
    },

    password:{
        type:String,
        required:true
    },
    createdBy:{
        type:String,
        default:null

    },
    address:{
        type:mongoose.Types.ObjectId,
        ref:'Address'
        

    }
},{timestamps:true});

module.exports= mongoose.model('Customer',customerSchema);