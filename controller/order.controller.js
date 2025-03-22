const Order = require("../models/order.model");
const {uploadImageToCloudinary} = require("../utils/ImageUploader")
const  WorkQueueItem = require("../models/workQueueItem.model");

exports.createOrder=async(req,res)=>{
    try {
      console.log("inside create order controller ");
        const{requirements,dimensions,assignedTo}=req.body;

        console.log("requirements are:",requirements);
        console.log("dimensions are:",dimensions);
       

        const files= req.files.images;
        console.log("files",files);

        // const customerId= req.user.id;
        const customerId = req.params.id
        console.log("customer id is ",customerId);

        if(!requirements || !dimensions || !files){
            return res.status(400).json({
                success:false,
                message:"All fields are mandatory"
            })
        }




        const filesArray= Array.isArray(files) ? files :[files]


         //upload Image To cloudinary
        const filesImage = await uploadImageToCloudinary(
            files,
            process.env.FOLDER_NAME
        );

        const imageUrls = filesImage.map((file)=>file.secure_url);


        console.log("filesImage is:",filesImage);
        console.log("imageurl is ",imageUrls);

        const newOrder = new Order({
            customer:customerId,
            requirements,
            dimensions,
            image:imageUrls,
            createdBy:req.user.id,

        });

        const order= await newOrder.save();

          // If assigned to a user, notify them (e.g., via WebSocket)
        //   if (assignedTo) {
        //     io.to(`user_${assignedTo}`).emit("new-order-assigned", {
        //         orderId: order._id,
        //         message: "You have been assigned a new order",
        //     });


            
        // }

        //populat related field and return the related order

        const populatedOrder= await Order.findById(order._id)
        .populate("customer","name email")
        .populate("assignedTo","name email")
        .populate("createdBy","name email");

        res.status(201).json({
            success:true,
            message:"Order created successfully",
            data:populatedOrder,
        })

        
    } catch (error) {
        console.error("error occured while creating order",error);
        return res.status(400).json({
            success:false,
            message:"problem in creating the order",
            error:error.message
        })
        
    }
}


exports.assignOrder= async(req,res)=>{
    try {
        const {assignedTo}= req.body;
        console.log("assignedTo");

        let order= await Order.findById(req.params.id);
        console.log("order is :",order);
        if(!order){
            return res.status(404).json({
                success:false,
                message:"Order not found"
            })
        };

        if(!assignedTo){
            return res.status(400).json({
                success:false,
                message:"All fields are mandatory",
            })
        }

        order= await Order.findByIdAndUpdate(req.params.id,{
            $set:{
                assignedTo,
                status:'Assigned'
            }
        },{new:true}).populate('customer',"name email")
        .populate('assignedTo',"name email")
        .populate('createdBy', "name email")

        return res.status(200).json({
          success:true,
          message:"order assigned successfully",
          order
        })

        
    } catch (error) {
        console.error("problem in assigning order",error);
        return res.status(402).json({
            success:false,
            message:"unable to assign order",
            error:error.message
        })
        
    }
}


exports.getOrders = async (req, res) => {
    try {
      const { status, customer, assignedTo } = req.query;
      
      let query = {};
      if (status) query.status = status;
      if (customer) query.customer = customer;
      if (assignedTo) query.assignedTo = assignedTo;
      
      
      
      const orders = await Order.find(query)
        .populate('customer', 'name email')
        .populate('assignedTo', 'name email')
        .populate('approvedBy', 'name email')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
      
      return res.status(200).json({
        success:true,
        message:"all orders has been fetched successfully",
        orders
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };


  
  exports.getOrderById = async (req, res) => {
    try {
      
      const order = await Order.findById(req.params.id)
        .populate('customer', 'name email phone')
        .populate('assignedTo', 'name email')
        .populate('approvedBy', 'name email')
        .populate('createdBy', 'name email');
      
      if (!order) {
        return res.status(404).json({ msg: 'Order not found' });
      }
      
      
      
      res.status(200).json({
        success:true,
        message:"order has been fetched successfully",
        order});
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Order not found' });
      }
      res.status(500).send('Server error');
    }
  };




  exports.updateOrder = async (req, res) => {
    try {
      
      const { requirements, dimensions,} = req.body;
      
      // Check if order exists
      let order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ msg: 'Order not found' });
      }
      
      const updateFields = {};
      if (requirements) updateFields.requirements = requirements;
      if (dimensions) updateFields.dimensions = dimensions;
      

      //check if new files are uploaded
      if(req.files && req.files.images){
        const files= req.files.images;

        //ensure files are in array format
        const filesArray = Array.isArray(files)? files:[files];

        //upload new image to cloudinary
        const filesImage = await Promise.all(
          filesArray.map((file)=>
            uploadImageToCloudinary(file,process.env.FOLDER_NAME)
          )
        );

        //extract secure urls from the uploaded images
        const imageUrls= filesImage.map((file)=>file.secure_url);
        updateFields.image=imageUrls;
      }
  
      order = await Order.findByIdAndUpdate(
        req.params.id,
        { $set: updateFields },
        { new: true }
      ).populate('customer', 'name email')
        .populate('assignedTo', 'name email')
        .populate('approvedBy', 'name email')
        .populate('createdBy', 'name email');
  
      res.status(200).json({
        success:true,
        message:"order has been updated successfully",
        order});
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Order not found' });
      }
      res.status(500).send('Server error');
    }
  };
  

  exports.deleteOrder = async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      
      if (!order) {
        return res.status(404).json({ msg: 'Order not found' });
      }
      
      
      
      // Remove related work queue items
      await WorkQueueItem.deleteMany({ order: req.params.id });
      
      // Remove order
      await order.deleteOne();
      
      res.json({ msg: 'Order and related items removed' });
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Order not found' });
      }
      res.status(500).send('Server error');
    }}




    exports.approveOrder = async (req, res) => {
        try {
          // Check if order exists
          let order = await Order.findById(req.params.id);
          if (!order) {
            return res.status(404).json({
              success:false, 
              msg: 'Order not found'
             });
          }
          
          
          
          // Check if order is in the right status
          if (order.status !== 'PendingApproval') {
            return res.status(400).json({ msg: 'Order is not in pending approval status' });
          }
      
          // Update order status and add to work queue
          order = await Order.findByIdAndUpdate(
            req.params.id,
            { 
              $set: { 
                status: 'InWorkQueue',
                approvedBy: req.user.id
              }
            },
            { new: true }
          ).populate('customer', 'name email')
            .populate('assignedTo', 'name email')
            .populate('approvedBy', 'name email')
            .populate('createdBy', 'name email');
          
          // Create work queue item
          const workQueueItem = new WorkQueueItem({
            order: order._id,
            status: 'Pending'
          });
          
          await workQueueItem.save();
          
          // // Notify display team
          // io.to('display_team').emit('new-work-queue-item', {
          //   orderId: order._id,
          //   message: 'New item added to work queue'
          // });
      
          res.status(200).json({
            success:true,
            message:"order approved",
            order

            });
        } catch (err) {
          console.error(err.message);
          if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Order not found' });
          }
          res.status(500).send('Server error');
        }
      };




