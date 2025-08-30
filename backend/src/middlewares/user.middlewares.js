import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from 'jsonwebtoken'
export const verifyJWT =asyncHandler(async(req,res,next)=>{
    try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","")

        if(!token){
            throw new ApiError(401,"Unauthorized Token")
        }

        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

        if(!decodedToken){
            throw new ApiError(401,"Invalid Token")
        }
        const user=await User.findById(decodedToken?._id).select("-password -refreshTokens")

        if(!user){
            throw new ApiError(401,"Invalid AccessToken")
        }

        req.user=user
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Access Token Error")
    }
})