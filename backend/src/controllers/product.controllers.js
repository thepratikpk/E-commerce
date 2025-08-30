import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const addProduct = asyncHandler(async (req, res) => {
    const { name, description, price, category, subCategory, sizes, bestseller } = req.body
    if (!name || !description || !price || !category || !subCategory || !sizes) {
        throw new ApiError(400, "All required fields must be provided")
    }
    const imageFields = ["image1", "image2", "image3", "image4"]

    const uploadedImages = await Promise.all(
        imageFields.map(async (field) => {
            const localFilePath = req.files?.[field]?.[0]?.path

            if (!localFilePath) return null
            const cloudinaryRes = await uploadOnCloudinary(localFilePath)
            return cloudinaryRes?.secure_url || null
        })
    )
    
    const images = uploadedImages.filter(Boolean) //filter--only the not null images

    const product = await Product.create({
        name,
        description,
        price,
        category,
        subCategory,
        sizes,
        bestseller: bestseller === "true" ? true : false,
        images: images
    })

    return res
        .status(200)
        .json(new ApiResponse(200, product, "Product is created"))
})

export {
    addProduct
}