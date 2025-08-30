import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            return null
        }
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: "images",
            secure: true
        })

        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        console.log("File uploaded on Cloudinary")
        return response;
    } catch (err) {
        console.log("Cloudinary upload error: ", err)
        // remove locally saved temp files
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath)
        }
        return null
    }
}


const getPublicIdFromUrl = (url) => {
    try {
        if (!url) return null;

        const parts = url.split("/");
        const fileWithExtension = parts.at(-1); // image.jpg
        const fileName = fileWithExtension.split(".")[0];
        const folder = parts.at(-2); // images

        return `${folder}/${fileName}`;
    } catch (error) {
        console.log("Error on extrancting public id :", error)
        return null
    }
};

const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) {
            return null
        }

        const response = await cloudinary.uploader.destroy(publicId)
        console.log("File is deleted from cloudinary")
        return response
    } catch (err) {
        console.log("Cloudinary deleting error:", err)
        return null
    }
}


export {
    uploadOnCloudinary,
    getPublicIdFromUrl,
    deleteFromCloudinary
}