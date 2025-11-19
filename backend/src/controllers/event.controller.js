
import { Event } from "../models/event.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Log an event. Accepts:
 * { userId, sessionId, productId, action, value, metadata }
 */


// Rate limiting to prevent infinite loops
const eventCache = new Map();
const RATE_LIMIT_WINDOW = 10000; // 10 seconds

const logEvent = asyncHandler(async (req, res) => {
    const { userId, sessionId, productId, action, value, metadata } = req.body;
    if (!action) {
        throw new ApiError(400, "action is required");
    }

    // Create a unique key for rate limiting based on user, product, and action
    const rateLimitKey = `${userId || sessionId || req.ip}_${productId}_${action}`;
    const now = Date.now();

    // Check rate limit
    if (eventCache.has(rateLimitKey)) {
        const lastRequest = eventCache.get(rateLimitKey);

        if (now - lastRequest < RATE_LIMIT_WINDOW) {
            // Rate limited - return success but don't log
            return res
                .status(200)
                .json(new ApiResponse(200, { rateLimited: true }, "Event rate limited"));
        }
    }

    // Update the cache with current timestamp
    eventCache.set(rateLimitKey, now);

    // Clean up old entries periodically
    if (eventCache.size > 1000) {
        const cutoff = now - RATE_LIMIT_WINDOW;
        for (const [key, timestamp] of eventCache.entries()) {
            if (timestamp < cutoff) {
                eventCache.delete(key);
            }
        }
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