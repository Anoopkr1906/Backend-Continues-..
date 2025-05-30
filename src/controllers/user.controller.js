import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req , res) => {
    // step1 -> get user details from frontend

    // step2 -> validate user details

    // step3 -> check if user already exists

    // step4 -> check for images , avatar and cover image

    // step5 -> upload them to cloudinary , avatar

    // step6 -> create user object - create entry in database

    // step7 -> remove password and refresh token from response 

    // step8 -> check for user creation 

    // step9 -> return response to frontend

    const { fullName , email , username , password} = req.body ;
    
    // console.log("email: ", email);

    if([fullName , email , username , password].some((field) => field?.trim() === "")){
        throw new ApiError(400 , "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [
            {username},
            {email}
        ]
    })

    // TODO: console log the existedUser object to see what it contains
    if(existedUser) {
        throw new ApiError(409 , "User already exists with this username or email")
    }

    // TODO: console log the req.files object to see what it contains
    // console.log("req.files: " , req.files);

    
    const avatarLocalPath =  req.files?.avatar[0]?.path ;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path ;

    let coverImageLocalPath ;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar file is required")
    }

    const avatar =  await uploadOnCloudinary(avatarLocalPath);

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(500 , "Avatar upload failed")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    })

    const createdUser = await User.findByIdAndUpdate(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500 , "User creation failed as something went wrong with server")
    }

    return res.status(201).json(
        new ApiResponse(200 , createdUser , "User registered successfully")
    )

})






export { registerUser }