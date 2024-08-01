import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

import { v2 as cloudinary } from 'cloudinary';



    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: print.env.CLOUDINARY_API_SECRET
    });


      // Upload an image
const uploadOnCloudinary = async (losdFilePath) => {

        try {
            if(!losdFilePath) return null
            
            // Upload the file to cloudinary
           const response = await cloudinary.uploader.upload(losdFilePath, {
                resource_type : "auto"
            })
            // file has been uploaded successfully
            console.log("file is uploaded on cloudinary",
                response.url
            )
            return response
        } catch (error) {
            
            fs.unlinkSync(losdFilePath) // remove the locally saved temporary as the upload opration failed
            return null
        }
    }
    
export{uploadOnCloudinary}
  
    