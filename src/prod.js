import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";
import ServerlessHttp from "serverless-http";

dotenv.config({
    path : './.env'
})

const port = process.env.PORT || 8000

connectDB()
.then(() => {
    
    app.on("error", (error) =>{
        console.log("Error to lesten: ", error );
        throw error
    })

    // app.listen(port, () =>{
    //     console.log(`Server is running at port: ${port}`);
    // })
})
.catch((err) => {
    console.log("Mongo Db Connection Failed !!! ");
})

export const handler = ServerlessHttp(app);



