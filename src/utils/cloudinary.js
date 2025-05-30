import {v2 as cloudinary} from "cloudinary";
import e from "express";
import fs from "fs";


// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        // upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath , {
            resource_type: "auto"
        })

        // TODO : console log the response object to see what it contains and further deep study

        // file has been uploaded successfully
        console.log("File uploaded successfully to Cloudinary" , response.url);

        fs.unlinkSync(localFilePath); // delete the file from local storage after upload

        return response ;

    } catch (error) {
        fs.unlinkSync(localFilePath); // delete the file from local storage as the upload operation got failed
        return null; // return null if upload failed
    }
}


export { uploadOnCloudinary };



    
 