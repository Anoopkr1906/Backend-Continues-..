// require('dotenv').config({path: "./env"})

import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: "./env"
})


connectDB()
.then(() => {
    // TODO : Assignment done of adding app on error 
    app.on("error" , (error) => {
        console.log("Error in opening app: ", error);
    })

    app.listen(process.env.PORT || 8000 , () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`)
    })
})
.catch((error) => {
    console.log("MongoDB connection failed !!" , error)
})






// a way to connect db in index.js only 

/*
import express from "express"
const app = express()

( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        app.on("error" , (error) => {
            console.log("Error: ", error);
            throw error
        })

        app.listen(process.env.PORT , ()=>{
            console.log(`App is running on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.error("Error : " , error)
        throw err
    }
} )()
*/
