import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"

dotenv.config({
  path : './.env'
})


const app = express()

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))

app.use(express.json({
    limit : "16kb"
}))

app.use(express.urlencoded({
    extended : true,
    limit : "16kb"
}))


app.get("/", (req, res) =>
    res.json({
      message: "/",
      request: req.url,
      status: "Running smoothly :rocket:",
      timestamp: new Date().toLocaleString(),
      uptime: `${Math.floor(process.uptime() / 60)} minutes ${Math.floor(
        process.uptime() % 60
      )} seconds`,
    })
  );

app.use(express.static("public"))

app.use(cookieParser())


// routes import
import userRouter from "./routes/user.routes.js"
import { test } from "./controllers/user.controller.js"


// routes declaration
app.use("/api/v1/users", userRouter)


app.use("/.netlify/functions/api", test)


export default app