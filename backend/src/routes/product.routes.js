import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { addProduct, getProcuctById, listProducts, removeProduct } from "../controllers/product.controllers.js";
import { authorizeRoles, verifyJWT } from "../middlewares/auth.middlewares.js";

const router=Router()

router.route('/add').post(verifyJWT,authorizeRoles('admin'),upload.fields([
    {name:'image1',maxCount:1},{name:'image2',maxCount:1},{name:'image3',maxCount:1},{name:'image4',maxCount:1},
]),addProduct)

router.route('/remove/:id').delete(verifyJWT,authorizeRoles('admin'),removeProduct)
router.route('/list').get(listProducts)
router.route('/:id').get(getProcuctById)
export default router
