import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asynchandler.js";


const addToCart = asyncHandler(async (req, res) => {

    const { itemId, size } = req.body;
    if (!itemId || !size) {
        throw new ApiError(400, "Item ID and size are required to add to cart.");
    }

    const userId = req.user._id;

    // 2. Construct the update operation dynamically.
    // The key is built using dot notation to target the specific item and size.
    const keyPath = `cartData.${itemId}.${size}`;
    const update = { $inc: { [keyPath]: 1 } };

    // 3. Perform a single, atomic database update.
    // This uses `$inc` (increment) and finds the user by their ID.
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        update,
        { new: true, runValidators: true }
    ).select("cartData");


    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }


    return res
        .status(200)
        .json(new ApiResponse(
            200,
            updatedUser.cartData,
            "Item added to cart successfully"
        ));
});

const updateCart = asyncHandler(async (req, res) => {

    const { itemId, size, quantity } = req.body;
    if (!itemId || !size || quantity === undefined) {
        throw new ApiError(400, "Item ID, size, and quantity are required.");
    }


    if (quantity < 0) {
        throw new ApiError(400, "Quantity cannot be a negative number.");
    }

    const userId = req.user._id;

    // 2. Construct the key path for the nested field.
    const keyPath = `cartData.${itemId}.${size}`;

    // 3. Perform a single, atomic database update using $set on the nested field.
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { [keyPath]: quantity } },
        { new: true }
    ).select("cartData");


    if (!updatedUser) {
        throw new ApiError(404, "User not found.");
    }


    return res
        .status(200)
        .json(new ApiResponse(
            200,
            updatedUser.cartData,
            "Cart updated successfully"
        ));
});

const getUserCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;


    const user = await User.findById(userId).select("cartData");


    if (!user) {
        throw new ApiError(404, "User not found");
    }


    return res
        .status(200)
        .json(new ApiResponse(
            200,
            user.cartData,
            "Cart data retrieved successfully"
        ));
});

const clearCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { cartData: {} } },
        { new: true }
    ).select("cartData");

    if (!updatedUser) {
        throw new ApiError(404, "User not found.");
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            updatedUser.cartData,
            "Cart cleared successfully"
        ));
});


const removeCartItem = asyncHandler(async (req, res) => {
    const { itemId, size } = req.body;
    if (!itemId || !size) {
        throw new ApiError(400, "Item ID and size are required.");
    }

    const userId = req.user._id;
    const keyPath = `cartData.${itemId}.${size}`;

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $unset: { [keyPath]: 1 } },
        { new: true }
    ).select("cartData");

    if (!updatedUser) {
        throw new ApiError(404, "User not found.");
    }

    const itemData = updatedUser.cartData[itemId];
    if (itemData && Object.keys(itemData).length === 0) {
        await User.findByIdAndUpdate(
            userId,
            { $unset: { [`cartData.${itemId}`]: "" } },
            { new: true }
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedUser.cartData,
                "Item removed from cart successfully"
            )
        );
});



export {
    addToCart,
    updateCart,
    getUserCart,
    clearCart,
    removeCartItem
}