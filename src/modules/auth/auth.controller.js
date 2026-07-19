import { Router } from "express";
import * as authService from "./auth.service.js";
import { authentication } from "../../middleware/authentication.middleware.js";
const router = Router();


router.post("/signup",authService.signUp);
router.post("/login",authService.login);
router.post("/update-password",authentication(),authService.updatePassword);
router.post("/signup/gmail",authService.signUpWithGmail);
// router.get("/refresh-access",authService.refresshAccess);

export default router;