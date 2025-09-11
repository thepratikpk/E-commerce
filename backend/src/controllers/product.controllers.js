import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { deleteFromCloudinary, getPublicIdFromUrl, uploadOnCloudinary } from "../utils/cloudinary.js";


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
        sizes: JSON.parse(sizes),
        bestseller: bestseller === "true" ? true : false,
        images: images
    })

    return res
        .status(200)
        .json(new ApiResponse(200, product, "Product is created"))
})

const listProducts = asyncHandler(async (req, res) => {
    const products = await Product.find()

    if (!products) {
        throw new ApiError(400, "Failed to Fetch Products")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, products, "All products are fetched"))
})

const removeProduct=asyncHandler(async(req,res)=>{
    const {id}=req.params || req.body

    const product=await Product.findById(id)
    if(!product){
        throw new ApiError(404,"Product not found")
    }
    if (product.images && product.images.length > 0) {
    await Promise.all(
        product.images.map(async (imageUrl) => {
            const publicId = getPublicIdFromUrl(imageUrl);
            if (publicId) {
                await deleteFromCloudinary(publicId);
            }
        })
    );
}

    await product.deleteOne()
    return res
    .status(200)
    .json(new ApiResponse(200,null,"Product Is removed"))
})

const getProcuctById=asyncHandler(async(req,res)=>{
    const product =await Product.findById(req.params.id)

    if(!product){
        throw new ApiError(400,"Id of Prodcuct is not fetched")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,product,"Product is fethced by Id"))
})
export {
    addProduct,
    listProducts,
    removeProduct,
    getProcuctById
}