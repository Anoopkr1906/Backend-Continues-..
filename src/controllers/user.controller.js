import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
// import { isPasswordCorrect , generateAccessToken , generateRefreshToken} from "../models/user.model.js";

// method for generate access token and refresh token and use it everywhere just by calling this method to generate those ...
const generateAccessAndRefreshtokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken =  user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {
            accessToken,
            refreshToken
        }

    } catch (error) {
        throw new ApiError(500 , "Something went wrong while generating access and refresh tokens")
    }
}

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


const loginUser = asyncHandler(async (req , res) => {
    // step1 -> get data from req.body or backend
    // step2 -> check for username or email
    // step3 -> find user in dtabase
    // step4 -> check if user exist and check for password
    // step5 -> access token and refresh token generation
    // step6 -> send cookies 
    // step7 -> send response to frontend

    const {email , username , password} = req.body ;

    if(!username && !email){
        throw new ApiError(400 , "Username or email is required")
    }

    const user = await User.findOne({
        $or: [ {username} , {email} ]
    });

    if(!user){
        throw new ApiError(404 , "User does not exist with this username or email");
    }

    const isPasswordValid =  await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401 , "Invalid password or user credentials");
    }

    const {accessToken , refreshToken} = await generateAccessAndRefreshtokens(user._id);

    // next directly update the user object or again call the database to get the user object without password and refresh token
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        // this ensures that cookies are only modifiable by the server and not by the client side javascript
        httpOnly : true , 
        secure : true,
    }

    return res
    .status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .json(
        new ApiResponse(200 ,
                {
                    user: loggedInUser, accessToken , refreshToken
                },
                "User logged in successfully"
            )
    )

})


const logoutUser = asyncHandler( async(req , res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {   
            // gives object which field we want to update
            $set : {refreshToken: undefined}
        },
        {
            new: true , // returns the updated user object
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).clearCookie("accessToken" , options)
                            .clearCookie("refreshToken" , options)
                            .json(new ApiResponse(200 , {} , "User logged out successfully"))
})


// this function is used to refresh the access token using the refresh token when the user's access token has expired but he wants to continue the session so he gives his refresh token and we match it with the refresh token present in our server , if they both match , we provide him/her a new access token for continuing the session
const refreshAccessToken = asyncHandler(async(req , res) => {
    const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken ;

    if(!incomingRefreshToken){
        throw new ApiError(401 , "Unauthorized request")
    }

    try {
        const decodedToken =  jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        )

        const user = await User.findById(decodedToken?._id);

        if(!user){
            throw new ApiError(401 , "Invalid refresh token")
        }

        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401 , "Refresh token is expired or used")
        }

        const {accessToken , newRefreshToken} = await generateAccessAndRefreshtokens(user._id) ;

        const options = {
            httpOnly : true,
            secure : true,
        }

        return res
        .status(200)
        .cookie("accessToken" , accessToken , options)
        .cookie("refreshToken" , newRefreshToken , options)
        .json(
            new ApiResponse(
                200,
                {accessToken , refreshToken : newRefreshToken},
                "Access Token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401 , error?.message || " Invalid refreshToken");
    }

})


// to change the current password of user
const changeCurrentPassword = asyncHandler(async(req , res) => {
    const {oldPassword , newPassword} = req.body;

    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new ApiError(400 , "Invalid password");
    }

    user.password = newPassword ;
    await user.save({validateBeforeSave: false});

    return res
            .status(200)
            .json(new ApiResponse(200 , {} , "password changed succesfully"));
})


const getCurrentUser = asyncHandler(async(req,res) => {
    return res
            .status(200)
            .json(new ApiResponse(200 , req.user , "Current user fetched successfully")) 
})

//to update account details 
const updateAccountDetails = asyncHandler(async(req , res) => {
    const {fullName , email} = req.body ;

    if(!fullName || !email){
        throw new ApiError(400 , "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName: fullName,
                email: email 
            }
        },
        {new : true}
    ).select("-password")

    return res
            .status(200)
            .json(new ApiResponse(200 , user , "Account details updated successfully"))


})

// Always write seperate controllers for updation of files
//below is the controller for updating avatar of user which is a file
const updateUserAvatar = asyncHandler(async(req , res) => {
    const avatarLocalPath =  req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar file is missing")
    }

    // TODO : delete old image functionality can be added here if needed
    const avatar = uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400 , "Error while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar : avatar.url
            }
        },
        {new : true}
    ).select("-password")

    return res
            .status(200)
            .json(
                new ApiResponse(200 , user , "Avatar updated successfully")
            )

})


const updateUserCoverImage = asyncHandler(async(req , res) => {
    const coverImageLocalPath =  req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400 , "Avatar file is missing")
    }

    const coverImage = uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400 , "Error while uploading coverImage")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage : coverImage.url
            }
        },
        {new : true}
    ).select("-password")

    return res
            .status(200)
            .json(
                new ApiResponse(200 , user , "Cover Image updated successfully")
            )


})



export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}