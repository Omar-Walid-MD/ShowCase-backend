export const asyncHandler = (fn) => {
    return async (req,res,next) => {
        await fn(req,res,next).catch((error)=>{
            return next(error);
        })
    }
}

export const successResponse = ({res,message="Done",status=200,data={}}={}) => {
    return res.status(status).json({message,data});
}

export const globalErrorHandling = (error,req,res,next)=>{
    return res.status(error.cause || 404).json({
        error,
        message: error.message,
        stack: process.env.MODE === "DEV" ? error.stack : undefined
    });
}