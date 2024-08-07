import {v2 as cloudinary} from "cloudinary"
import fs from "fs"




    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
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
            // console.log("file is uploaded on cloudinary",
            //     response.url
            // )
            console.log("Cloudinary Response is: ",response);
            fs.unlinkSync(losdFilePath)
            return response

        } catch (error) {
            
            fs.unlinkSync(losdFilePath) // remove the locally saved temporary as the upload opration failed
            return null
        }
    }
    
export{uploadOnCloudinary}
  
    