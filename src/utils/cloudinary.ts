import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const deleteLocalFile = (filePath: string) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (unlinkError) {
      console.error("Failed to delete local file:", unlinkError);
    }
  }
};

export const uploadFile = async (localFilePath: string): Promise<string> => {
  try {
    if (!localFilePath) {
      throw new Error("File path is required");
    }

    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    return uploadResult.secure_url;
  } catch (error: any) {
    console.log("========== CLOUDINARY ERROR ==========");
    console.log(error);
    console.log("Message:", error.message);
    console.log("======================================");

    console.error("Cloudinary upload failed:", error);
    throw new Error("Failed to upload file to Cloudinary");
  } finally {
    deleteLocalFile(localFilePath);
  }
};

export const deleteFile = async (filePath: string): Promise<boolean> => {
  try {
    if (!filePath) {
      throw new Error("File path is required");
    }

    await cloudinary.uploader.destroy(filePath);
    return true;
  } catch (error: any) {
    console.error("Failed to delete file from Cloudinary:", error);
    throw new Error("Failed to delete file from Cloudinary");
  }
};

export default { uploadFile, deleteFile };