import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"


const app = express()

//Below is a middleware connected, done to configure CORS (Cross Origin Resource Sharing) with our app ........
app.use(cors({
    origin: process.env.CORS_ORIGIN ,
    credentials: true,
}))

//Below is a middleware that allows data in json format with custom limit to it to be passed to the backend.
app.use(express.json({
    limit: "20kb",
}))

//Below is a middleware that allows url data to reach our backend by parsing it
app.use(express.urlencoded({
    extended: true,
    limit: "20kb",
}))

//Below is middleware that allows backend to store certain files/images, public asset
app.use(express.static("public"))

// This is another middleware for cookieParser
app.use(cookieParser());


// Routes import
import userRouter from "./routes/user.route.js"

// routes declaration
app.use("/api/v1/users" , userRouter )

export { app }