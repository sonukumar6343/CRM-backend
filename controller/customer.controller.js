const Customer = require("../models/customer.model");
const Order= require("../models/order.model");

const Address = require("../models/Address.model")



exports.createCustomer= async(req,res)=>{
    try {
        const{
            name,
            email,phoneNo,address,
        }=req.body;

        if(!name || !email || !phoneNo ){
            return res.status(400).json({
                success:false,
                message:"All fields are mandatory"
            })
        };

        const trimmedEmail= email.trim()
        const existingCustomer= await Customer.findOne({email:trimmedEmail});

        if(existingCustomer){
            return res.status(400).json({
                success:false,
                message:"Customers already registered with this email id"
            })
        }

        let savedAddress = null;
        if(address){
            if(!address.street || !address.city || !address.state || !address.pincode){
                return res.status(400).json({
                    success:false,
                    message:"Address must include street,city,state and pincode",
                });
            }
            //create the address
            const newAddress = new Address({
                street: address.street,
                city:address.city,
                state:address.state,
                pincode:address.pincode,
                additionalDetail:address.additionalDetail
            });

            savedAddress = await newAddress.save();
        }

        console.log("savedAddress is:",savedAddress);


        

        const newCustomer = new Customer({
            name,
            email,
            phoneNo,
            address:savedAddress ?savedAddress._id : null,
            createdBy:req.user.id
        });

        const customer = await newCustomer.save();

        const populatedCustomer = await customer.populate("address");
        return res.status(200).json({
            success:true,
            message:"New Customer created successfully",
            populatedCustomer,
        })

        
    } catch (error) {
        console.error("problem in creating new customer",error)
        return res.status(400).json({
            success:false,
            message:"problem in creating the new customer",
            error:error.message
        })
        
    }
}




exports.updateCustomer = async(req,res)=>{
    try {
        const {id}= req.params;
        const {name,email,address,phoneNo}= req.body;

        console.log("address",address);
       

        const existingCustomer = await Customer.findById(id);

        console.log(existingCustomer);

        if(!existingCustomer){
            return res.status(404).json({
                success:false,
                message:"Customer not found"

            })
        }

        const updateField={}
        if(name) updateField.name=name;
        if(email) updateField.email = email;

        console.log("updateField",updateField);

        // Update the address if provided
        if (address) {
            console.log("inside address field");
            const existingAddress = await Address.findById(existingCustomer.address);
            if (!existingAddress) {
                return res.status(404).json({
                    success: false,
                    message: "Address not found for the customer",
                });
            }

            // Update the address fields
            if (address.street) existingAddress.street = address.street;
            if (address.city) existingAddress.city = address.city;
            if (address.state) existingAddress.state = address.state;
            if (address.pincode) existingAddress.pincode = address.pincode;
            if (address.additionalDetail) existingAddress.additionalDetail = address.additionalDetail;

            // Save the updated address
            await existingAddress.save();

        
        
    }
    if(phoneNo) updateField.phoneNo= phoneNo

        const customer = await Customer.findByIdAndUpdate(id, {$set:updateField}, { new: true }).populate(
            "address"
        );

         console.log("customer is:",customer)


        return res.status(200).json({
            success: true,
            message: "Customer updated successfully",
            customer,
        });


}catch (error) {
        console.error("Error updating customer", error);
        return res.status(500).json({
            success: false,
            message: "Error updating customer",
            error: error.message,
        });
        
    }
}

//delete the customer

exports.deleteCustomer = async(req,res)=>{
    try {
        const customer = await Customer.findById(req.params.id);
        console.log("customer is :",customer);
        if(!customer){
            return res.status(404).json({
                success:false,
                message:"customer not found with this id"
            })
        }

        const orderCount= await Order.countDocuments({customer:req.params.id});
        console.log("order count is:",orderCount);
        if(orderCount>0){
            return res.status(400).json({
                success:false,
                message:"cannot delete the customer with the existing order,please try to deactivate instead "
            });
        }

        if(customer.address){
            const address = await Address.findById(customer.address);
            console.log("address is:",address);

            if(address){
                await address.deleteOne();
                console.log("Address deleted successfully:",address);
            }

        }

        //delete the customer address
       

        await customer.deleteOne();

        return res.status(200).json({
            success:true,
            message:"customer and their address  removed successfully"
        })


        
    } catch (error) {
        console.log("error occured while removing customer:",error);
        return res.status(400).json({
            success:false,
            message:"problem in removing customer",
            error:error.message
        })
        
    }
}

exports.getCustomerOrders= async(req,res)=>{
    try {
        const orders= await Order.find({customer:req.params.id})
        .populate('customer','name email')
        .populate('assignedTo','name email')
        .populate('approvedBy','name email')
        .populate('createdBy','name email')

        if(!orders){
            return res.status(404).json({
                success:false,
                message:"No order found"
            })

        }
        return res.status(200).json({
            success:true,
            message:"All orders fetched successfully",
            orders,
        })

        
    } catch (error) {
        console.log("problem in fetching customer order");
        return res.status(400).json({
            success:false,
            message:"problem in fetchin customer order",
            error :error.message
        })
        
    }
}
