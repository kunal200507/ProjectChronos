import dotenv from "dotenv"
import app from "./app.js"

dotenv.config(
    {
        path:"./.env",
    }
)
import {connectDB} from './config/prisma.js'
connectDB()
.then(()=>{
    const port = process.env.PORT||8000;
    app.listen(port,()=>{
        console.log(`app is running on port: ${port}`)
    })
})
.catch((error)=>{
    console.log(`DB CONNECTION ERROR: ${error}`);
})