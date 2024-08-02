import {asyncHandler} from "../utils/asyncHandler.js"
import {apiError} from "../utils/apiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js"


const generateAccessAndRefreshTokens = async (userId) =>
    {
    try {

        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken}

    } catch (error) {
        throw new apiError(500, "Something went wrong while generate access and refresh tokens")
    }
}


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


const loginUser = asyncHandler(async (req, res,) =>{
    
    // req body -> data
    // username or email
    // find the user 
    // check password
    // access and refresh token
    // send cookie

    const{email, username, password} = req.body

    if(!username || !email){
        throw new apiError(400, "Username or email is requred")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(!user){
        throw new apiError(400, "User does not exist")
    }


    const isPasswordValid = await user.isPsswordCorrect(password)

    if(!isPasswordValid){
        throw new apiError(401, "Invalid password")
    }


    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

    const  options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new apiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const  options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCokkies("accessToken", options)
    .clearCokkies("refreshToken", options)
    .json(new apiResponse(200, {},"User logged out"))
})

export {
    registerUser,
    loginUser,
    logoutUser

}