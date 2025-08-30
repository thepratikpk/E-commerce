import express from 'express'
import cors from 'cors'
import cookieparser from 'cookie-parser'

const app=express();

const allowedOrigin =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_ORIGIN
    : process.env.DEV_ORIGIN;

app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));

app.use(express.json())
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))

app.use(cookieparser());

// API endpoints
import userRouter from './routes/user.routes.js'
import productRouter from './routes/product.routes.js'
app.use('/api/v1/user',userRouter)
app.use('/api/v1/product',productRouter)


export {app}