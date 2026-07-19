import { Router } from "express";
import { getNewLoginCredentials, profile, updateUser } from "./users.service.js";
import { authentication } from "../../middleware/authentication.middleware.js";
import { tokenTypeEnum } from "../../utils/security/token.security.js";
const router = Router();

router.get("/",authentication(),profile);
router.get("/refresh-token",authentication({tokenType:tokenTypeEnum.refresh}),getNewLoginCredentials);
router.patch("/",authentication(),updateUser);

export default router;