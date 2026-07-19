import mongoose from "mongoose";
import multer from "multer";
import {GridFsStorage} from "multer-gridfs-storage";
import Grid from "gridfs-stream";
import crypto from "node:crypto";
import path from "node:path";

export let gfs;
export let gfsBucket;
let upload;

import dns from "node:dns/promises";
console.log(await dns.getServers());




async function connectDB()
{
    if(process.env.MODE === "DEV")
    {
        dns.setServers(["1.1.1.1"]);
    }
    try {
        console.log(process.env.DB_URI)
        const result = await mongoose.connect(process.env.DB_URI);
        console.log(result.models);
        console.log("Database connected");

        // mongoose.connection.once("open",()=>{
        //     console.log(gfs);
        // });
        gfs = Grid(mongoose.connection.db,mongoose.mongo);
        gfs.collection("uploads");

        gfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: 'uploads',
        });

        const storage = new GridFsStorage({
            url: process.env.DB_URI,
            file: (req,file) => {
                return new Promise((resolve,reject)=>{
                    crypto.randomBytes(16,(err,buf)=>{
                        if(err) return reject(err);

                        const filename = buf.toString("hex") + path.extname(file.originalname);
                        const fileInfo = {
                            filename,
                            bucketName: "uploads"
                        };

                        resolve(fileInfo);
                    })
                })
            }
        });

        upload = multer({storage}); 

    } catch (error) {
        console.log("Failed to connect to Database:",error);
    }
}

export function uploadSingle(fieldName)
{
    return async (req,res,next) => {

        const mw = upload.single(fieldName);

        mw(req, res, (err) => {
            if (err) return next(err); 
            next();
        });
    }
}


export default connectDB;