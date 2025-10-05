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

const getRecommendedProducts = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    try {
        // Call your Python recommendation service API
        const recommendationServiceUrl = `http://localhost:5001/recommendations/${userId}?n=10`;
        const response = await axios.get(recommendationServiceUrl);

        const { productIds } = response.data;

        if (!productIds || productIds.length === 0) {
            // Fallback: return bestsellers or recent products if no recommendations
            const fallbackProducts = await Product.find({ bestseller: true }).limit(10);
            return res.status(200).json(new ApiResponse(200, fallbackProducts, "No specific recommendations, returning bestsellers."));
        }

        // Fetch the full product details from your database
        const recommendedProducts = await Product.find({
            '_id': { $in: productIds }
        });
        
        // Optional: Preserve the order from the recommendation service
        const orderedProducts = productIds.map(id => 
            recommendedProducts.find(p => p._id.toString() === id)
        ).filter(p => p); // Filter out any nulls if a product was deleted


        return res.status(200).json(new ApiResponse(200, orderedProducts, "Recommended products fetched successfully"));

    } catch (error) {
        console.error("Error fetching recommendations:", error.message);
        // Implement a fallback strategy if the AI service is down
        const fallbackProducts = await Product.find({ bestseller: true }).limit(10);
        return res.status(200).json(new ApiResponse(200, fallbackProducts, "Could not fetch recommendations, returning bestsellers."));
    }
});
export {
    addProduct,
    listProducts,
    removeProduct,
    getProcuctById,
    getRecommendedProducts
}