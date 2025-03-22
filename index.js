const express= require('express');
const app= express();
const database = require("./config/database")
const dotenv= require("dotenv");
const cookieParser=require("cookie-parser");
dotenv.config();

const PORT= process.env.PORT || 3000;

const {cloudinaryConnect} = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:"/tmp",
    })
)
//cloudinary connection
cloudinaryConnect();


const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes");
const designerRoutes = require("./routes/designer.routes");
const superAdminRoutes = require("./routes/superAdmin.routes");
const accountRoutes = require("./routes/account.routes");










database.connectWithDb();


app.use(express.json());
app.use(cookieParser());


//routes
app.use("/api/v1/auth",userRoutes)
app.use("/api/v1/admin",adminRoutes)
app.use("/api/v1/sa",superAdminRoutes)
app.use("/api/v1/d",designerRoutes)
app.use("/api/v1/ac",accountRoutes)


app.get("/",(req,res)=>{
    return res.json({
        message:"your server is up and  running"
    })
});

app.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`);
    
})