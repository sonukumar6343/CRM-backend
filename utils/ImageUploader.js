const cloudinary = require('cloudinary').v2

exports.uploadImageToCloudinary = async (files,folder,height,quality)=>{

    try {
        const options ={folder};
    if(height){
        options.height = height;
    }
    if(quality){
        options.quality =quality;
    }
    options.resource_type= "auto";

    //check if files is an array or a single file 

    if(Array.isArray(files)){
        //handle multiple file uploads

        const uploadResults = await Promise.all(
            files.map((file)=>cloudinary.uploader.upload(file.tempFilePath,options))


        );
        return uploadResults;

    }
    else{
        //handle single file upload
        const uploadResult = await cloudinary.uploader.upload(files.tempFilePath,options)
        return uploadResult;
    }
        
    } catch (error) {
        console.error("error while uploading top the cloudinary");
        throw(error);
        
    }
    


   
}