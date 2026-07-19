import { Router } from "express";
import { addWork, getUserWorks, deleteWork } from "./works.service.js";
import { authentication } from "../../middleware/authentication.middleware.js";
import { uploadSingle } from "../../db/connection.db.js";
const router = Router();

router.get("/",getUserWorks);
router.post("/",authentication(),uploadSingle("file"),addWork);
router.delete("/",authentication(),deleteWork);

export default router;