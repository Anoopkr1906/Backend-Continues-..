import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { isPasswordCorrect , generateAccessToken , generateRefreshToken} from "../models/user.model.js";

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

    if(!username || !email){
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

export { 
    registerUser,
    loginUser,
    logoutUser
}