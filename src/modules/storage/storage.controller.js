import { Router } from "express";
import { authentication } from "../../middleware/authentication.middleware.js";
import { uploadSingle } from "../../db/connection.db.js";
import { deleteFile, getFile, getImage, uploadFile, downloadFile } from "./storage.service.js";
const router = Router();

router.post("/",uploadSingle("file"),uploadFile);
router.get("/image/:filename",getImage);
router.get("/:filename",getFile);
router.get("/download/:filename",downloadFile);
router.delete("/:filename",deleteFile);

export default router;