import { asyncHandler, successResponse } from "../../utils/response.js";
import * as DBService from "../../db/service/db.service.js";
import { WorkModel } from "../../db/models/Work.model.js";
import { gfs, gfsBucket } from "../../db/connection.db.js";
import { PortfolioModel } from "../../db/models/Portfolio.model.js";

export const getUserWorks = asyncHandler(async (req, res, next) => {

    const works = await DBService.find({
        model: WorkModel,
        filter: {
            userId: req.user._id
        }
    });

    return successResponse({ res, data: { works } });
});

export const addWork = asyncHandler(async (req, res, next) => {

    const { title, tags, picture, description, link, portfolioId } = req.body;

    const [work] = await DBService.create({
        model: WorkModel,
        data: [{
            title,
            tags: tags.split(","),
            portfolioId,
            picture: req.file.filename,
            description,
            link
        }]
    });

    const portfolio = await DBService.findOne({
        model: PortfolioModel,
        filter: {_id: portfolioId}
    });

    if(!portfolio)
    {
        return next(new Error("Portfolio not found",{cause:404}));
    }

    portfolio.works.push(work._id);

    const updatedPortfolio = await DBService.updateOne({
        model: PortfolioModel,
        filter: {_id: portfolioId},
        update: portfolio
    });

    return successResponse({ res, status:201, data: { work } });
});

export const deleteWork = asyncHandler(async (req, res, next) => {

    const work = await DBService.deleteOne({
        model: WorkModel,
        filter: { _id: req.body.workId }
    });

    const file = await gfs.files.findOne({ filename: work.picture });

    if (!file) return next(new Error("File to delete not found", { cause: 404 }));

    await gfsBucket.delete(file._id, (err) => {
        if (err) {
            return next(new Error("File to delete not found", { cause: 404 }));
        }
        console.log("Deleted work picture successfully");
    });

    const portfolio = await DBService.findOne({
        model: PortfolioModel,
        filter: {_id: work.portfolioId}
    });

    if(!portfolio)
    {
        return next(new Error("Portfolio not found",{cause:404}));
    }

    portfolio.works.remove(work._id);

    const updatedPortfolio = await DBService.updateOne({
        model: PortfolioModel,
        filter: {_id: portfolio._id},
        update: portfolio
    });

    return successResponse({ res, message: "Deleted Work from Gallery" });
});