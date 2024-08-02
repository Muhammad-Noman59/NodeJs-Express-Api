import {asyncHandler} from "../utils/asyncHandler.js"
import {apiError} from "../utils/apiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js"

const registerUser = asyncHandler( async (req, res) =>{

    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response

     const { username, fullName, email, password }= req.body
     console.log("email: ", email);

    if(
        [username, fullName, email, password].some((field)=>
           field?.trim() === "" )
    ){
        throw new apiError(400, "All field are required")
    }

    const existsUser = await User.findOne({
        $or : [{ username }, { email }]
    })

    if(existsUser){
        throw new apiError(409, "User with email or username already exists")

    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files &&Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }


    console.log("Avatar File: ", req.files);

    if(!avatarLocalPath){
        throw new apiError(400, "Avatar is required")
    }


    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new apiError(400, "Avatar is required")
    }


    const userRes = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    })

    const createdUser = await User.findById(userRes._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new apiError(500, "Something went wrong while registering the user.")

    }


    return res.status(201,).json(
        new apiResponse(200, createdUser, "User register successfully")
    )

})

export {registerUser}