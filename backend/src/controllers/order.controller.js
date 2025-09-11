
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asynchandler.js";


const placeOrder = asyncHandler(async (req, res) => {
    const { items, amount, address, paymentMethod } = req.body;
    const userId = req.user._id;

    if (!items || !amount || !address || !paymentMethod) {
        throw new ApiError(400, "All fields are required");
    }

    const order = await Order.create({
        userId,
        items,
        amount,
        address,
        paymentMethod:"COD",
        status: "pending",
        payment: false
    });

    // Clear the user's cart after the order is placed
    await User.findByIdAndUpdate(userId, {
        $set: { cartData: {} }
    });

    return res
        .status(201)
        .json(new ApiResponse(201, order, "Order placed successfully"));
});

const placeOrderStripe=asyncHandler(async(req,res)=>{

})

const placeOrderRazorpay=asyncHandler(async(req,res)=>{
    
})

const allOrders=asyncHandler(async(req,res)=>{

})

const userOrders=asyncHandler(async(req,res)=>{

})
const updateStatus=asyncHandler(async(req,res)=>{

})


export {
    placeOrder,
    placeOrderStripe,
    placeOrderRazorpay,
    allOrders,
    userOrders,
    updateStatus
}