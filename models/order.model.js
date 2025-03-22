const mongoose= require("mongoose");

const orderSchema=new mongoose.Schema({
    orderId:{
        type:String,
        unique:true

    },
    customer:{
        type:mongoose.Types.ObjectId,
        ref:'Customer',
        required:true


    },

    requirements:{
        type:String,
    },

    dimensions:{
    type:String,

    },

    status:{
        type:String,
        enum:["New","Assigned","InProgress","PendingApproval","Approved","InWorkQueue","completed","billed",'paid'],
        default:"New"
    },

    image:[{
        type:String,
        }],
    

    assignedTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',

    },
    approvedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },

    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',

    }

},{timeStamp:true});


orderSchema.pre('save', function (next) {
    if (this.isNew) {  // Ensure it only runs for new documents
        this.orderId = generateUnique(); // Assign the generated ID to orderId
    }
    next();
});

// Function to generate a unique ID
function generateUnique() {
    const date = Date.now(); // Get current timestamp in milliseconds
    const number = Math.floor(Math.random() * 10000).toString().padStart(4, '0'); // 4-digit random number
    return `ORD-${date}-${number}`;
}



module.exports=mongoose.model("Order",orderSchema);