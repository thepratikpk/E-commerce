import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { addToCart, clearCart, getUserCart, removeCartItem, updateCart } from "../controllers/cart.controller.js";

const router=Router()

router.use(verifyJWT)

router.route("/add").post(addToCart);
router.route("/update").put(updateCart);
router.route("/remove").delete(removeCartItem);
router.route("/clear").delete(clearCart);
router.route("/").get(getUserCart);




export default router
