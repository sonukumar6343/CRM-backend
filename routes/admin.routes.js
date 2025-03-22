const express= require("express");
const router = express.Router();

const {auth,isAdmin} = require("../middleware/auth");

const {adminController}= require("../controller/admin.controller");
const {
    createLead,
    updateLead,
    deleteLead,
    convertToCustomer
    }= require('../controller/lead.controller');

const{
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerOrders


    }= require("../controller/customer.controller")


const{
    createOrder,
    updateOrder,
    deleteOrder,
    getOrderById,
    getOrders,
    assignOrder,
    approveOrder

    }= require("../controller/order.controller")


// router.get("/admin",auth,isAdmin,adminController);
router.post("/createLead",auth,isAdmin,createLead);
router.put("/updateLead/:id",auth,isAdmin,updateLead);
router.delete("/deleteLead/:id",auth,isAdmin,deleteLead);
router.post("/convertToCustomer/:id",auth,isAdmin,convertToCustomer);

//create customer route
router.post("/createCustomer",auth,isAdmin,createCustomer);
router.put("/updateCustomer/:id",auth,isAdmin,updateCustomer);
router.delete("/deleteCustomer/:id",auth,isAdmin,deleteCustomer);
router.get("/getCustomerOrders/:id",auth,isAdmin,getCustomerOrders);

//create Order

router.post("/createOrder/:id",auth,isAdmin,createOrder);
router.put("/updateOrder/:id",auth,isAdmin,updateOrder);
router.delete("/deleteOrder/:id",auth,isAdmin,deleteOrder);
router.get("/getOrderById/:id",auth,isAdmin,getOrderById,);
router.get("/getOrders",auth,isAdmin,getOrders);
router.put("/assignOrder/:id",auth,isAdmin,assignOrder);
router.put("/approveOrder",auth,isAdmin,approveOrder);


module.exports= router