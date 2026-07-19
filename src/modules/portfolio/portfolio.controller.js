import { Router } from "express";
import * as portfolioService from "./portfolio.service.js";
import { uploadSingle } from "../../db/connection.db.js";

const router = Router();

router.post("/",portfolioService.createPortfolio);
router.get("/all/:userId",portfolioService.getUserPortfolios);
router.get("/:portfolioId",portfolioService.getPortfolio);
router.patch("/:portfolioId/resume",uploadSingle("resume"),portfolioService.updatePortfolioResume);
router.patch("/:portfolioId/thumbnail",uploadSingle("thumbnail"),portfolioService.updatePortfolioThumbnail);
router.patch("/:portfolioId",portfolioService.updatePortfolioInfo);
router.delete("/:portfolioId",portfolioService.deletePortfolio);

export default router;