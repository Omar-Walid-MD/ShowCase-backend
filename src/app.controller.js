import path from "node:path";
import * as dotenv from "dotenv";
import * as fs from "fs";

// const envFile =
//     process.env.NODE_ENV === "production"
//         ? "./src/config/env.prod"
//         : "./src/config/env.dev";

// if (fs.existsSync(envFile)) {
//     dotenv.config({ path: envFile });
// }
dotenv.config();


import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import connectDB from "./db/connection.db.js";
import authController from "./modules/auth/auth.controller.js";
import usersController from "./modules/users/users.controller.js";
import worksController from "./modules/works/works.controller.js";
import portfolioController from "./modules/portfolio/portfolio.controller.js"
import storageController from "./modules/storage/storage.controller.js";
import { globalErrorHandling } from "./utils/response.js";

async function bootstrap()
{
    const app = express();
    app.use(express.json());
    app.use(bodyParser.json());
    app.use(cors());
    app.use(methodOverride("_method"));

    await connectDB();

    app.get("/",(req,res,next)=>res.json({message:"Welcome to the app"}));

    app.use("/auth",authController);
    app.use("/user",usersController);
    app.use("/work",worksController);
    app.use("/storage",storageController);
    app.use("/portfolio",portfolioController);

    app.all("{/*dummy}",(req,res,next)=>res.json({message:"Invalid routing"}));

    app.use(globalErrorHandling);

    const port = process.env.PORT;
    app.listen(port,()=>console.log(`Server listening at port: ${port}`));
}

export default bootstrap;