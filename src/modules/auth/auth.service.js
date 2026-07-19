import { providerEnum, UserModel } from "../../db/models/User.model.js";
import { asyncHandler, successResponse } from "../../utils/response.js";
import * as DBService from "../../db/service/db.service.js";
import { compareHash, generateHash } from "../../utils/security/hash.security.js";
import { generateEncryption } from "../../utils/security/encryption.security.js";
import { generateLoginCredentials, generateToken, getSignatures, signatureLevelEnum, verifyToken } from "../../utils/security/token.security.js";
import mongoose from "mongoose";
import { OAuth2Client } from "google-auth-library";

export const signUp = asyncHandler(async (req,res,next) => {
    
    const {fullName,email,password,phone,picture} = req.body;

    if(await DBService.findOne({model:UserModel,filter:{email}}))
    {
        return next(new Error("Email exists",{cause:409}));
    }

    const hashPassword = await generateHash({plaintext:password});
    const encPhone = await generateEncryption({plaintext:phone});

    const user = await DBService.create({
        model: UserModel,
        data: [{fullName,email,password:hashPassword,phone:encPhone,picture}]
    });

    return successResponse({res,status:201,data:{user}});
    
})

export const login = asyncHandler(async (req,res,next) => {

    const {email,password} = req.body;
    
    const user = await DBService.findOne({
        model:UserModel,
        filter:{ email, provider: providerEnum.system }
    });

    if(!user)
    {
        return next(new Error("Invalid Login data",{cause:404}));
    }
    
    if(!await compareHash({plaintext:password,hashValue:user.password}))
    {
        return next(new Error("Invalid Login data",{cause:404}));
    }

    const credentials = await generateLoginCredentials({user});

    return successResponse({res,data:{credentials}});
})

// export const refreshAccess = asyncHandler(async (req,res,next) => {

//     const { authorization } = req.headers;

//     const refreshVerified = await verifyToken({
//         token: authorization,
//         signature: process.env.REFRESH_TOKEN_SIGNATURE
//     });

//     if(!refreshVerified)
//     {
//         return next(new Error("Refresh token verification failed",{cause:400}));
//     }

//     const access_token = await generateToken(
//     {
//         payload: {_id:refreshVerified._id},
//     });

//     return successResponse({res,data:{access_token}});
// })

export const updatePassword = asyncHandler(async (req,res,next) => {

    const {oldPassword,newPassword} = req.body;

    if(!await compareHash({plaintext:oldPassword,hashValue:req.user.password}))
    {
        return next(new Error("Password Incorrect",{cause:404}));
    }

    const hashPassword = await generateHash({plaintext:newPassword});

    const user = await DBService.updateOne({
        model: UserModel,
        filter: {
            _id: new mongoose.Types.ObjectId(req.user._id)
        },
        update: {
            password: hashPassword
        }
    });

    const access_token = await generateToken(
    {
        payload: {_id:user._id},
    });

    return successResponse({res,data:{user,access_token}});
});


async function verifyGoogleAccount({idToken}={})
{
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.WEB_CLIENT_IDS.split(",")
    });
    const payload = ticket.getPayload();
    return payload;
    
}

export const signUpWithGmail = asyncHandler(async (req,res,next) => {
    
    const {idToken} = req.body;
    const {picture,name,email,email_verified,phoneNumber} = await verifyGoogleAccount({idToken});
    if(!email_verified)
    {
        return next(new Error("account not verified",{cause:400}))
    }

    const user = await DBService.findOne({
        model: UserModel,
        filter: {email}
    });

    if(user)
    {
        if(user.provider === providerEnum.google)
        {
            return await loginWithGmail(req,res,next);
        }
        return next(new Error("Email exists",{cause:409}));
    }

    const [newUser] = await DBService.create({
        model: UserModel,
        data: [{
            fullName:name,
            email,
            picture: {
                pictureData: picture,
                pictureType: "link"
            },
            confirmEmail: Date.now(),
            provider: providerEnum.google,
            phone: await generateEncryption({plaintext:phoneNumber})
        }]
    })

    const credentials = await generateLoginCredentials({user:newUser});
    return successResponse({res,status:201,data:{credentials}});    
})

export const loginWithGmail = asyncHandler(async (req,res,next) => {
    
    const {idToken} = req.body;
    const {email,email_verified} = await verifyGoogleAccount({idToken});
    if(!email_verified)
    {
        return next(new Error("account not verified",{cause:400}))
    }

    const user = await DBService.findOne({
        model: UserModel,
        filter: {email,provider:providerEnum.google}
    });

    if(!user)
    {
        return next(new Error("Invalid login data or invalid provider",{cause:404}));
    }

    const credentials = await generateLoginCredentials({user});
    return successResponse({res,status:201,data:{credentials}});
})
