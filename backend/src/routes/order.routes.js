import { Router } from "express";
import express from 'express'
import { allOrders, handleStripeWebhook, placeOrder, placeOrderStripe, updateStatus, userOrders, verifyStripe } from "../controllers/order.controller.js";
import { authorizeRoles, verifyJWT } from "../middlewares/auth.middlewares.js";

const router=Router()

router.use(verifyJWT)

router.route('/list').get(authorizeRoles('admin'),allOrders)
router.route('/status/:orderId').put(authorizeRoles('admin'),updateStatus)

// Payment features
router.route('/place').post(placeOrder)
router.route('/stripe').post(placeOrderStripe)


// user Features
router.route('/userorders').get(userOrders)

router.route('/verifyStripe').post(verifyStripe)
router.route('/webhook').post( 
    express.raw({ type: 'application/json' }), 
    handleStripeWebhook
);

export default router
