import jwt from "jsonwebtoken";
import { UserModel } from "../../db/models/User.model.js";
import * as DBService from "../../db/service/db.service.js";

export const signatureLevelEnum = {bearer:"Bearer",system:"System"};
export const tokenTypeEnum = {access:"access",refresh:"refresh"};

export const generateToken = async({payload={}, signature=process.env.ACCESS_USER_TOKEN_SIGNATURE, options={expiresIn:Number(process.env.ACCESS_TOKEN_EXPIRES_IN)}}={}) => {
    return jwt.sign(payload,signature,options);
}

export const verifyToken = async({token="", signature=process.env.ACCESS_USER_TOKEN_SIGNATURE}={}) => {
    try {
        return jwt.verify(token,signature);
    } catch (error) {
        return undefined;
    }
}

export const getSignatures = async ({signatureLevel=signatureLevelEnum.bearer}={}) => {
    let signatures = {accessSignature: undefined, refreshSignature: undefined};
    switch(signatureLevel)
    {
        case signatureLevelEnum.system:
            signatures.accessSignature = process.env.ACCESS_SYSTEM_TOKEN_SIGNATURE;
            signatures.refreshSignature = process.env.REFRESH_SYSTEM_TOKEN_SIGNATURE
            break;
        default:
            signatures.accessSignature = process.env.ACCESS_USER_TOKEN_SIGNATURE;
            signatures.refreshSignature = process.env.REFRESH_USER_TOKEN_SIGNATURE
            break;
    }

    return signatures;
}

export const decodedToken = async({authorization="",next,tokenType=tokenTypeEnum.access}={}) => {

    const [bearer,token] = authorization?.split(" ") || [];
    if(!bearer || !token)
    {
        return next(new Error("missing token parts",{ cause:401 }));
    }

    let signatures = await getSignatures({signatureLevel:bearer});
        
    const decoded = await verifyToken({
        token,
        signature: tokenType === tokenTypeEnum.access ? signatures.accessSignature : signatures.refreshSignature
    });

    if(!decoded?._id)
    {
        return next(new Error("Invalid token",{cause:400}));
    }

    const user = await DBService.findById({
        model: UserModel,
        id: decoded._id
    });

    if(!user)
    {
        return next(new Error("Not registered account",{cause:404}));
    }

    return user;

}

export const generateLoginCredentials = async({user}={}) => {
    let signatures = await getSignatures({signatureLevel:signatureLevelEnum.bearer});

    const access_token = await generateToken(
    {
        payload: {_id:user._id},
        signature: signatures.accessSignature
    });

    const refresh_token = await generateToken(
    {
        payload: {_id:user._id},
        signature: signatures.refreshSignature,
        options: {
            expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN)
        }
    });

    return {access_token,refresh_token};
}