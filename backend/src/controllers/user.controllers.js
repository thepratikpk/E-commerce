import { asyncHandler } from "../utils/asynchandler.js"
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { User } from "../models/user.model.js"
import validator from 'validator'
const generateRefreshAndAccessTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refershToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something is wrong while generating tokens")
    }
}

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

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, phoneNo, address, cartData } = req.body;

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
        cartData,
        isGoogleUser: false
    })

    const createdUser = await User.findById(user._id).select(
        "-password"
    )
    return res
        .status(201)
        .json(new ApiResponse(201, createdUser, "User Registered Successfully"))
})

export { loginUser, registerUser }