import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from 'jsonwebtoken'
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Check if this is an admin request (has Authorization header)
    const authHeader = req.header("Authorization");
    const cookieToken = req.cookies?.accessToken;

    let token;
    let isAdminRequest = false;

    if (authHeader) {
      // Admin request using Bearer token
      token = authHeader.replace(/^Bearer\s?/, "");
      isAdminRequest = true;
      console.log('🔐 Admin request with Bearer token');
    } else if (cookieToken) {
      // User request using cookie
      token = cookieToken;
      console.log('🔐 User request with cookie token');
    } else {
      console.log('🔐 No token found in request');
      throw new ApiError(401, "Unauthorized Token");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log('🔐 Token decoded for user:', decodedToken._id, isAdminRequest ? '(Admin)' : '(User)');

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    if (!user) {
      console.log('🔐 User not found for token:', decodedToken._id);
      throw new ApiError(401, "Invalid AccessToken");
    }

    console.log('🔐 Authenticated user:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      requestType: isAdminRequest ? 'Admin' : 'User'
    });

    req.user = user;
    req.isAdminRequest = isAdminRequest;
    next();
  } catch (error) {
    console.log('🔐 Auth error:', error.message);
    throw new ApiError(401, error?.message || "Invalid Access Token Error");
  }
});

// export const verifyJWT =asyncHandler(async(req,res,next)=>{
//     try {
//         const token = req.cookies?.accessToken || req.header("Authorization")?.replace(/^Bearer\s?/, "");


//         if(!token){
//             throw new ApiError(401,"Unauthorized Token")
//         }

//         const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

//         if(!decodedToken){
//             throw new ApiError(401,"Invalid Token")
//         }
//         const user=await User.findById(decodedToken?._id).select("-password -refreshToken")

//         if(!user){
//             throw new ApiError(401,"Invalid AccessToken")
//         }

//         req.user=user
//         next()
//     } catch (error) {
//         throw new ApiError(401,error?.message || "Invalid Access Token Error")
//     }
// })

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!req.user) {
      return res.status(401).json({ message: "Authentication details not found. Please log in." });
    }

    if (!userRole) {
      return res.status(403).json({ message: "User role not found. Access denied." });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: `Role '${userRole}' is not authorized to access this route. Required roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};