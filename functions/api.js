
import dotenv from "dotenv"
import connectDB from "../src/db/index.js";
import { app } from "../src/app.js";
import ServerlessHttp from "serverless-http";

dotenv.config({
    path : './.env'
})


connectDB()

const handler = ServerlessHttp(app);

module.exports.handler = async(event, context) =>{
    const result= await handler(event, context);
    return result
} 




