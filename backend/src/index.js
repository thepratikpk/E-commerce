import 'dotenv/config'
import connectDB from './db/dbjs'
import { app } from './app.js'

connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log("Error: ",error)
        throw error
    })

    app.listen(process.env.process || 5001,()=>{
        console.log(`Serever is Up:${process.env.PORT}`)
    })

})
.catch((err)=>{
    console.log("MongoDB connection failed",err)
})