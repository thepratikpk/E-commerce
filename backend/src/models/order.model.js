import mongoose from "mongoose";

// Sub-schema for address to ensure consistency with the User model.
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

// A sub-schema to define the structure of each item in the order.
const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    productName: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    size: {
        type: String,
        required: false,
    }
});

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: {
        type: [orderItemSchema], // Use the sub-schema for items
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    address: {
        type: addressSchema, // Use the shared address sub-schema
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        required: true,
       
    },
    payment: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

export const Order = mongoose.model("Order", orderSchema);
