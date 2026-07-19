import { asyncHandler, successResponse } from "../../utils/response.js";
import { decryptEncryption } from "../../utils/security/encryption.security.js";
import { generateLoginCredentials } from "../../utils/security/token.security.js";
import * as DBService from "../../db/service/db.service.js";
import { UserModel } from "../../db/models/User.model.js";


export const profile = asyncHandler(async (req,res,next) => {

    req.user.phone = await decryptEncryption({ciphertext:req.user.phone});

    return successResponse({res,data:{user:req.user}});
});

export const getNewLoginCredentials = asyncHandler(async (req,res,next) => {

    const credentials = await generateLoginCredentials({user:req.user});    

    return successResponse({res,data:{credentials}});
});

export const updateUser = asyncHandler(async (req,res,next) => {

    const update = req.body;

    const user = await DBService.updateOne({
        model: UserModel,
        filter: {
            _id: req.user._id 
        },
        update
    });

    user.phone = await decryptEncryption({ciphertext:user.phone});

    return successResponse({res,data:{user}});
});