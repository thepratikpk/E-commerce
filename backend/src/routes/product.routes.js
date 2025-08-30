import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { addProduct } from "../controllers/product.controllers.js";

const router=Router()

router.route('/add').post(upload.fields([
    {name:'image1',maxCount:1},{name:'image2',maxCount:1},{name:'image3',maxCount:1},{name:'image4',maxCount:1},
]),addProduct)


export default router
