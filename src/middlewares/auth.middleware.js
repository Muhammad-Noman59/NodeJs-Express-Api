import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import  jwat from "jsonwebtoken";



export const verifyJWT = asyncHandler(async(req, _, next) => {

   try {
    const token =  req.cookies?.accessToken || req.header
     ("Authorization")?.replace("Bearer ", "")
 
     if(!token){
         throw new apiError(401, "Unauhoized request")
     }
 
     const decodedToken = jwat.verify(token, process.env.ACCESS_TOKEN_SECRET)
 
     const user = await User.findById(decodedToken?._id).
     select("-password -refreshToken")
 
     if(!user){
 
         throw new apiError(401 , "Invalid access token")
     }
 
     req.user = user;
     next()
   } catch (error) {

    throw new apiError(401, error?.message || 
        "Invalid access token"
    )
   }
}) 