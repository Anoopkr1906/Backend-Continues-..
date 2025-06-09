// this middleware only if there is a user or not 

import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async(req , res , next) =>{

    try {
        const token = req.cookies?.accessToken ||req.header("Authorization")?.replace("Bearer ", "");
    
        if(!token){
            throw new ApiError(401, "Unauthorized request. Please login again.");
        }
    
        const decoded_token =  jwt.verify(token , process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decoded_token?._id).select("-password -refreshToken");
    
        if(!user){
            // discuss about frontend
            throw new ApiError(401 , "Invalid accessToken");
        }
    
        req.user = user ;
        next();
    } catch (error) {
        throw new ApiError(401 , error?.message || "Invalid accessToken")
    }
})