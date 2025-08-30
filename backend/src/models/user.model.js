import mongoose from "mongoose";
import bcrypt from 'bcryptjs'
import jwt from "jsonwebtoken"
const addressSchema = new mongoose.Schema({
    street: String,
    city: String,
    state: String,
    country: String,
    pincode: {
        type: String,
        match: [/^\d{6}$/, "Invalid pincode"]
    },
    isDefault: { type: Boolean, default: false }
})
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email address"]
    },
    password: {
        type: String,
        required: function () { return !this.isGoogleUser; }
    },

    phoneNo: {
        type: String,

    },
    address:[addressSchema],
    cartData: {
        type: Object,
        default: {}
    },
    refershToken:{
        type:String
    },
    
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    isGoogleUser: {
        type: Boolean,
        default: false
    }
}, {
    minimize: false,
    timestamps: true
})


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})


userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name
        },
        process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,

        },

        process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}


export const User=mongoose.model("User",userSchema)