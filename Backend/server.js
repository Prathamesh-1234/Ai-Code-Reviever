import app from "./src/app.js"
import dotenv from "dotenv"
dotenv.config()

const PORT=process.env.PORT
app.listen(PORT || 4000,()=>{
    console.log('server is running',PORT)
})