import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false // allow anonymous events
    },
    sessionId: {
        type: String,
        required: false // anonymous user tracking
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: false
    },
    action: {
        type: String,
        enum: ["view", "add_to_cart", "purchase", "search", "rating"],
        required: true
    },
    value: {
        type: Number,
        required: false // e.g. quantity or rating
    },
    metadata: {
        type: Object,
        default: {}
    },
    userAgent: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Useful indexes for queries
eventSchema.index({ userId: 1, createdAt: -1 });
eventSchema.index({ productId: 1, action: 1 });
eventSchema.index({ sessionId: 1, createdAt: -1 });

export const Event = mongoose.model("Event", eventSchema);
