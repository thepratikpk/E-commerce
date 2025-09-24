
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import Stripe from 'stripe'

const deliveryCharge = process.env.DELIVERY_CHARGE || 10; // Use a default value
const currency = process.env.CURRENCY || 'inr';
const stripe = new Stripe(process.env.STRIP_SECRET_KEY)

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
        paymentMethod: "COD",
        status: 'pending',
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

const placeOrderStripe = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { items, address } = req.body;

    // Handle multiple URLs in DEV_ORIGIN, pick the first one for Stripe
    let frontendUrl;
    if (process.env.NODE_ENV === 'production') {
        frontendUrl = process.env.PROD_ORIGIN;
    } else {
        // For development, take the first URL from comma-separated list
        const devOrigins = process.env.DEV_ORIGIN?.split(',');
        frontendUrl = devOrigins?.[0]?.trim() || 'http://localhost:5175';
    }
    
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DEV_ORIGIN:', process.env.DEV_ORIGIN);
    console.log('PROD_ORIGIN:', process.env.PROD_ORIGIN);
    console.log('Frontend URL for Stripe:', frontendUrl);
    console.log('Frontend URL type:', typeof frontendUrl);
    console.log('Frontend URL length:', frontendUrl?.length);
    
    // We don't need the `amount` from the client; we'll calculate it securely on the server.
    if (!items || items.length === 0 || !address) {
        throw new ApiError(400, "Items and address are required.");
    }
    
    if (!frontendUrl || frontendUrl.trim() === '') {
        throw new ApiError(400, "Frontend URL not configured properly");
    }

    try {
        // Create the order first with a "pending" status.
        // The payment field remains false until the webhook confirms payment.
        const order = await Order.create({
            userId,
            items,
            amount: 0, // A temporary amount; will be updated after payment
            address,
            paymentMethod: "Stripe",
            payment: false,
            status: 'pending'
        });

        // Construct the line items for the Stripe Checkout Session
        const line_items = items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.productName, // Use productName from the schema
                },
                unit_amount: item.price * 100, // Stripe expects amount in cents
            },
            quantity: item.quantity,
        }));

        // Add a delivery charge as a line item
        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: 'Delivery Charge',
                },
                unit_amount: deliveryCharge * 100,
            },
            quantity: 1,
        });

        // Create the Stripe Checkout Session.
        const successUrl = `${frontendUrl}/verify?success=true&orderId=${order._id}`;
        const cancelUrl = `${frontendUrl}/verify?success=false&orderId=${order._id}`;
        
        console.log('=== STRIPE URL DEBUG ===');
        console.log('Raw frontendUrl:', JSON.stringify(frontendUrl));
        console.log('Success URL:', JSON.stringify(successUrl));
        console.log('Cancel URL:', JSON.stringify(cancelUrl));
        console.log('Order ID:', order._id);
        console.log('========================');
        
        const session = await stripe.checkout.sessions.create({
            success_url: successUrl,
            cancel_url: cancelUrl,
            line_items,
            mode: 'payment',
            metadata: {
                orderId: order._id.toString()
            }
        });

        // Update the order with the Stripe session ID
        await Order.findByIdAndUpdate(order._id, { stripeSessionId: session.id });

        // Do NOT clear the cart here. This must happen on a webhook.

        return res
            .status(200)
            .json(new ApiResponse(200, { session_url: session.url }, "Stripe session created. Redirecting to checkout..."));

    } catch (error) {
        // If an error occurs, throw it to be handled by asyncHandler
        throw new ApiError(400, "Stripe session creation failed: " + error.message);
    }
});

const verifyStripe = asyncHandler(async (req, res) => {
    const { orderId, success } = req.body;
    const userId = req.user._id;
    
    console.log('Verify Stripe called with:', { orderId, success, userId });
    
    if (!orderId) {
        throw new ApiError(400, "Order ID is required");
    }
    
    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }
    
    // Check if order belongs to the user
    if (order.userId.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized access to order");
    }
    
    if (success === "true") {
        await Order.findByIdAndUpdate(orderId, { 
            payment: true,
            status: 'processing'
        });
        await User.findByIdAndUpdate(userId, { cartData: {} });
        
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Payment verified successfully"));
    } else {
        await Order.findByIdAndDelete(orderId);
        
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Payment cancelled, order deleted"));
    }
})

const handleStripeWebhook = asyncHandler(async (req, res) => {
    // Verify the event to ensure it's from Stripe and hasn't been tampered with
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        // Return a 400 status if the signature is invalid
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.metadata.orderId;

        // Ensure the order exists
        const order = await Order.findById(orderId);
        if (!order) {
            throw new ApiError(404, "Order not found");
        }

        // Ensure the order has not already been paid
        if (order.payment) {
            return res.status(200).send("Order already paid");
        }

        // Update the order status to paid and processing
        order.payment = true;
        order.status = 'processing';
        order.amount = session.amount_total / 100; // Stripe provides amount in cents
        await order.save({ validateBeforeSave: false });

        // Find the user and clear their cart
        const user = await User.findById(order.userId);
        if (user) {
            await User.findByIdAndUpdate(user._id, { $set: { cartData: {} } }, { new: true });
        }
    }

    // Return a 200 response to Stripe to acknowledge the event
    res.status(200).json({ received: true });
});


const allOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find().populate({
        path: 'userId',
        select: 'name email phoneNo'
    }).populate({
        path: 'items.productId',
        select: 'name price images'
    });

    if (!orders || orders.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No orders found"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, orders, "All orders fetched successfully"));
});

const userOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ userId: req.user._id }).populate({
        path: 'items.productId',
        select: 'name price images'
    });

    if (!orders || orders.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No orders found for this user"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, orders, "User orders fetched successfully"));
});

const updateStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params || req.body;
    const { status } = req.body;

    if (!status) {
        throw new ApiError(400, "Status is required");
    }

    const order = await Order.findByIdAndUpdate(
        orderId,
        { $set: { status } },
        { new: true, runValidators: true }
    );

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Order status updated successfully"));
});


export {
    placeOrder,
    placeOrderStripe,

    allOrders,
    userOrders,
    updateStatus,
    verifyStripe,
    handleStripeWebhook
}