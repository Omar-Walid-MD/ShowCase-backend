import { asyncHandler, successResponse } from "../../utils/response.js";
import * as DBService from "../../db/service/db.service.js";
import { gfs, gfsBucket } from "../../db/connection.db.js";

export const uploadFile = asyncHandler(async (req,res,next) => {

    return successResponse({res,data:{file: req.file}});
});

export const getFile = asyncHandler(async (req,res,next) => {

    const {filename} = req.params;
    const file = await gfs.files.findOne({filename});
    if(file) return successResponse({res,data:{file}});
    else return next(new Error("File not found",{cause:404}));
});

export const downloadFile = asyncHandler(async (req,res,next) => {

    const {filename} = req.params;
    
    const file = await gfs.files.findOne({filename});

    if(!file) return next(new Error("File not found",{cause:404}));
    
    res.setHeader("Content-Type", file.contentType);

    const stream = gfsBucket.openDownloadStream(file._id);

    stream.on("error",()=>{
        next(new Error("Failed to download file"));
    });

    stream.pipe(res);
    
});

export const getImage = asyncHandler(async (req,res,next) => {

    const {filename} = req.params;
    const file = await gfs.files.findOne({filename});

    if(!file) return next(new Error("File not found",{cause:404}));

    if(file.contentType === "image/jpeg" || file.contentType === "image/png")
    {
        const readStream = gfsBucket.openDownloadStream(file._id);
        readStream.pipe(res);
    }
    else next(new Error("File is not an image"));

});

export const deleteFile = asyncHandler(async (req, res, next) => {

    const file = await gfs.files.findOne({ filename: req.params.filename });

    if (!file) return next(new Error("File to delete not found", { cause: 404 }));

    await gfsBucket.delete(file._id, (err) => {
        if (err) {
            return next(new Error("Failed to delete", { cause: 404 }));
        }
    });

    return successResponse({ res, message: "Deleted file successfully"});
});