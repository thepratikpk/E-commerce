import { Router } from "express";
import { changecurrentPassword, getcurrentuser, googleLogin, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router=Router()

router.route('/login').post(loginUser)
router.route('/register').post(registerUser)
router.route('/refresh-token').post(refreshAccessToken)
router.route('/google-login').post(googleLogin)

router.use(verifyJWT)
router.route('/logout').post(logoutUser)
router.route('/me').get(getcurrentuser)
router.route('/change-password').patch(changecurrentPassword)
router.route('/update-account').patch(updateAccountDetails)



export default router