import { PortfolioModel } from "../../db/models/Portfolio.model.js";
import * as DBService from "../../db/service/db.service.js";
import { asyncHandler, successResponse } from "../../utils/response.js";
import { gfs, gfsBucket } from "../../db/connection.db.js";
import { UserModel } from "../../db/models/User.model.js";
import { decryptEncryption, generateEncryption } from "../../utils/security/encryption.security.js";
import { WorkModel } from "../../db/models/Work.model.js";


export const createPortfolio = asyncHandler(async (req, res, next)=>{

    const {userId} = req.body;

    // if(await DBService.findOne({model:PortfolioModel,filter:{userId}}))
    // {
    //     return next(new Error("Portfolio already exists for user",{cause:409}));
    // }

    const user = await DBService.findOne({
        model: UserModel,
        filter: {_id: userId}
    });

    if(!user)
    {
        return next(new Error("User not found",{cause:404}));
    }

    const {fullName, email, phone} = user;

    const portfolio = await DBService.create({
        model: PortfolioModel,
        data: [{userId, fullName, email, phone, theme: ""}]
    });

    return successResponse({res,status:201,data:{portfolio}}); 
});

export const getPortfolio = asyncHandler(async (req, res, next)=>{

    const {portfolioId} = req.params;

    const portfolio = await DBService.findOne({
        model: PortfolioModel,
        filter: {_id: portfolioId},
        populate: [{path:"works"}]
    });

    portfolio.phone = await decryptEncryption({ciphertext:portfolio.phone});

    if(!portfolio)
    {
        return next(new Error("Portfolio not found",{cause:404}));
    }

    return successResponse({res,status:200,data:{portfolio}});

});


export const getUserPortfolios = asyncHandler(async (req, res, next)=>{

    const {userId} = req.params;


    const portfolios = await DBService.find({
        model: PortfolioModel,
        filter: {userId},
        populate: [{path:"works"}]
    });

    if(!portfolios)
    {
        return next(new Error("Portfolio not found",{cause:404}));
    }

    return successResponse({res,status:200,data:{portfolios}});

});


export const updatePortfolioInfo = asyncHandler(async (req, res, next)=>{

    const {portfolioId} = req.params;

    const portfolio = await DBService.findOne({
        model: PortfolioModel,
        filter: {_id: portfolioId},
        populate: [{path:"works"}]
    });

    if(!portfolio)
    {
        return next(new Error("Portfolio not found",{cause:404}));
    }

    const { fullName, email, phone, roles, links, about, picture, theme } = req.body;

    const phoneEncrypted = await generateEncryption({plaintext:phone});
    
    const updatedPortfolio = await DBService.updateOne({
        model: PortfolioModel,
        filter: {_id: portfolioId},
        update: {fullName, email, phone: phoneEncrypted, roles, links, about, picture, theme}
    });

    if(!updatedPortfolio)
    {
        return next(new Error("Failed to update portfolio",{cause:400}));
    }

    updatedPortfolio.works = portfolio.works;
    updatedPortfolio.phone = phone;

    return successResponse({res,status:200,data:{portfolio:updatedPortfolio}});

});

export const updatePortfolioResume = asyncHandler(async (req, res, next)=>{

    const {portfolioId} = req.params;

    const portfolio = await DBService.findOne({
        model: PortfolioModel,
        filter: {_id: portfolioId}
    });

    if(!portfolio)
    {
        return next(new Error("Portfolio not found",{cause:404}));
    }
    
    const updatedPortfolio = await DBService.updateOne({
        model: PortfolioModel,
        filter: {_id: portfolioId},
        update: {resume:req.file?.filename || null}
    });

    if(!updatedPortfolio)
    {
        return next(new Error("Failed to update portfolio",{cause:400}));
    }

    if(portfolio.resume !== updatedPortfolio.resume && portfolio.resume)
    {
        const file = await gfs.files.findOne({ filename: portfolio.resume });
        
        if (!file) return next(new Error("File to delete not found", { cause: 404 }));
    
        await gfsBucket.delete(file._id, (err) => {
            if (err) {
                return next(new Error("File to delete not found", { cause: 404 }));
            }
            console.log("Deleted old resume successfully");
        });
    }

    return successResponse({res,status:200,data:{portfolio:updatedPortfolio}});

});


export const updatePortfolioThumbnail = asyncHandler(async (req, res, next)=>{

    const {portfolioId} = req.params;

    const portfolio = await DBService.findOne({
        model: PortfolioModel,
        filter: {_id: portfolioId}
    });

    if(!portfolio)
    {
        return next(new Error("Portfolio not found",{cause:404}));
    }

    
    const updatedPortfolio = await DBService.updateOne({
        model: PortfolioModel,
        filter: {_id: portfolioId},
        update: {thumbnail:req.file?.filename || null}
    });

    if(!updatedPortfolio)
    {
        return next(new Error("Failed to update portfolio",{cause:400}));
    }


    if(portfolio.thumbnail !== updatedPortfolio.thumbnail && portfolio.thumbnail)
    {
        const file = await gfs.files.findOne({ filename: portfolio.thumbnail });
        
        if (!file) return next(new Error("File to delete not found", { cause: 404 }));
    
        await gfsBucket.delete(file._id, (err) => {
            if (err) {
                return next(new Error("File to delete not found", { cause: 404 }));
            }
            console.log("Deleted old thumbnail successfully");
        });
    }

    return successResponse({res,status:200,data:{portfolio:updatedPortfolio}});

});

export const deletePortfolio = asyncHandler(async (req, res, next)=>{

    const {portfolioId} = req.params;

    const portfolio = await DBService.findOne({
        model: PortfolioModel,
        filter: {_id: portfolioId},
        populate: [{path:"works"}]
    });

    if(!portfolio)
    {
        return next(new Error("Portfolio not found",{cause:404}));
    }

    // delete resume if found
    if(portfolio?.picture?.pictureType === "upload")
    {
        const file = await gfs.files.findOne({ filename: portfolio.picture.pictureData });
        
        if (!file) return next(new Error("File to delete not found", { cause: 404 }));
    
        await gfsBucket.delete(file._id, (err) => {
            if (err) {
                return next(new Error("File to delete not found", { cause: 404 }));
            }
        });
    }

    // delete resume if found
    if(portfolio.resume)
    {
        const file = await gfs.files.findOne({ filename: portfolio.resume });
        
        if (!file) return next(new Error("Resume to delete not found", { cause: 404 }));
    
        await gfsBucket.delete(file._id, (err) => {
            if (err) {
                return next(new Error("Resume to delete not found", { cause: 404 }));
            }
        });
    }

    // delete thumbnail if found
    if(portfolio.thumbnail)
    {
        const file = await gfs.files.findOne({ filename: portfolio.thumbnail });
        
        if (!file) return next(new Error("Thumbnail to delete not found", { cause: 404 }));
    
        await gfsBucket.delete(file._id, (err) => {
            if (err) {
                return next(new Error("Thumbnail to delete not found", { cause: 404 }));
            }
        });
    }

    if(portfolio?.works.length)
    {
        for (const work of portfolio.works)
        {
            // delete work picture
            if(work.picture)
            {
                const file = await gfs.files.findOne({ filename: work.picture });
                
                if (!file) return next(new Error("Work picture to delete not found", { cause: 404 }));
            
                await gfsBucket.delete(file._id, (err) => {
                    if (err) {
                        return next(new Error("Work picture to delete not found", { cause: 404 }));
                    }
                });
            }
        }

        await DBService.deleteOne({
            model: WorkModel,
            filter: {_id: work._id}
        });
    }
    
    const result = await DBService.deleteOne({
        model: PortfolioModel,
        filter: {_id: portfolioId}
    });

    return successResponse({res,status:200,data:{result}});

});
