
import { Event } from "../models/event.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Log an event. Accepts:
 * { userId, sessionId, productId, action, value, metadata }
 */


const logEvent = asyncHandler(async (req, res) => {
    const { userId, sessionId, productId, action, value, metadata } = req.body;
    if (!action) {
        throw new ApiError(400, "action is required");
    }

    const ev = await Event.create({
        userId: userId || undefined,
        sessionId: sessionId || undefined,
        productId: productId || undefined,
        action,
        value,
        metadata,
        userAgent: req.get("User-Agent")
    });

    console.log('Event logged:', {
        id: ev._id,
        action: ev.action,
        userId: ev.userId,
        productId: ev.productId
    });

    return res
        .status(200)
        .json(new ApiResponse(200, ev, "Event logged successfully"));
});

const getEvents = asyncHandler(async (req, res) => {
    const { limit = 50, action, userId } = req.query;

    const filter = {};
    if (action) filter.action = action;
    if (userId) filter.userId = userId;

    const events = await Event.find(filter)
        .populate('userId', 'name email')
        .populate('productId', 'name price')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

    return res
        .status(200)
        .json(new ApiResponse(200, events, "Events fetched successfully"));
});


export {
    logEvent,
    getEvents
}