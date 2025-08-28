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



export {app}