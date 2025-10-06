import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { User } from "../models/user.model.js"
import validator from 'validator'
const generateRefreshAndAccessTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something is wrong while generating tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, phoneNo, address} = req.body;

    if (
        [name, email, password].some(
            (field) => !field || typeof field !== "string" || field.trim() === ""
        )
    ) {
        throw new ApiError(400, "name, email and password is required");
    }



    const existedUser = await User.findOne({ email })
    if (existedUser) {
        throw new ApiError(400, "User is already existed")
    }
    if (!validator.isEmail(email)) {
        throw new ApiError
    }
    if (password.length < 6) {
        throw new ApiError(401, "Password must be 6 characters")
    }

    const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        phoneNo,
        address,
        isGoogleUser: false
    })

    const createdUser = await User.findById(user._id).select(
        "-password"
    )
    return res
        .status(201)
        .json(new ApiResponse(201, createdUser, "User Registered Successfully"))
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        throw new ApiError(400, "All feilds are required")
    }
    const user = await User.findOne({ email })
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    if (user.isGoogleUser) {
        throw new ApiError(400, "This account is registered with Google")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Password is Incorrect")
    }

    const { accessToken, refreshToken } = await generateRefreshAndAccessTokens(user._id)

    const loggedUser = await User.findById(user._id).select("-password -refreshToken")

    const isProduction = process.env.NODE_ENV === "production";
    const options = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Lax"
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedUser, accessToken }, "User logged in Successfully"))
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id,
        {
            $set: { refreshToken: undefined }
        },
        { new: true });

    const isProduction = process.env.NODE_ENV === "production";
    const options = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Lax"
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
})

const changecurrentPassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body
    if(!oldPassword||!newPassword){
        throw new ApiError(400,"All fields are required")
    }

    const user=await User.findById(req.user._id)

    if (user.isGoogleUser) {
        throw new ApiError(400, "Cannot change password for Google-linked accounts.");
    }

    const isPasswordvalid=await user.isPasswordCorrect(oldPassword)

    if(!isPasswordvalid){
        throw new ApiError(400,"Old password is incorrect")
    }

    user.password=newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password changed Successfully"))

})

const getcurrentuser=asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200,req.user,"User fetched Successfully"))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized refresh-token request")
    }

    try {
        const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
        if(!decodedToken){
            throw new ApiError(401,"Token not decoded")
        }

        const user=await User.findById(decodedToken._id).select("-password")
        if(!user){
            throw new ApiError(401,"Invalid refresh-token")
        }

        if(incomingRefreshToken!==user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired or used")
        }
        const isProduction = process.env.NODE_ENV === "production";

        const options={
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "None" : "Lax"
        }
        const {accessToken,refreshToken}=await generateRefreshAndAccessTokens(user._id)
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(new ApiResponse(200,{accessToken,refreshToken, user: user.toObject()},"Access-token refreshed"))
    } catch (error) {
    throw new ApiError(401,error?.message || "invalid refresh token")
    }
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { name, email, phoneNo, address } = req.body;

    const updateFields = {};
    if (name && typeof name === "string" && name.trim() !== "") {
        updateFields.name = name;
    }
    if (email && typeof email === "string" && email.trim() !== "") {
        updateFields.email = email.toLowerCase();
    }
    if (phoneNo) {
        updateFields.phoneNo = phoneNo;
    }
    if (address) {
        updateFields.address = address;
    }

    if (Object.keys(updateFields).length === 0) {
        throw new ApiError(400, "At least one field (name, email, phoneNo, or address) is required to update.");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: updateFields,
        },
        {
            new: true,
            runValidators: true,
        }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"));
});


const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) throw new ApiError(400, "Google ID token required");

  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID_BACKEND,
  });

  const payload = ticket.getPayload();
  const { sub: googleId, email, name } = payload;

  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
      user.isGoogleUser = true;
      await user.save({ validateBeforeSave: false });
    }
  } else {
    user = await User.create({
      name: name || email,
      email: email.toLowerCase(),
      googleId,
      isGoogleUser: true,
    });
  }

  const { accessToken, refreshToken } = await generateRefreshAndAccessTokens(
    user._id
  );

  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: loggedUser, accessToken, refreshToken },
        "Google login successful"
      )
    );
});

export {
    loginUser,
    registerUser,
    logoutUser,
    changecurrentPassword,
    getcurrentuser,
    refreshAccessToken,
    updateAccountDetails,
    googleLogin
}