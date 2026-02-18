import HeroBanner from "../models/heroBannerModel.js";
import handleError from "../utils/errorHandler.js";
import handleSuccess from "../utils/sucessHandler.js";
import { getFileUrl } from "../middlewares/MulterMiddleware/multerMiddleware.js";
import fs from "fs";
import path from "path";
import { deleteFile, __dirname } from "../utils/fileHelpers.js";

// Create Hero Banner
export const createHeroBanner = async (req, res, next) => {
  try {
   const { page, title, subTitle, description, buttonText, buttonLink, height, width } = req.body;


    if (!req.file) {
      return next(handleError(400, "Banner image is required"))
    }

    // Generate image URL
    const relativeUrl = getFileUrl(req.file.filename)
    const fullImageUrl = `${req.protocol}://${req.get("host")}${relativeUrl}`

    // Remove existing banner for the same page
    const existingBanner = await HeroBanner.findOne({ page })
    if (existingBanner) {
      const imageName = existingBanner.bannerImage?.split("/uploads/")[1]
      const imagePath = path.join(__dirname, "../../uploads", imageName)

      if (fs.existsSync(imagePath)) {
        await deleteFile(imagePath)
        console.log("Old banner image deleted:", imagePath)
      }

      await HeroBanner.deleteOne({ _id: existingBanner._id })
    }

 const newBanner = new HeroBanner({
  page,
  title,
  subTitle,
  description,
  buttonText,
  buttonLink,
  bannerImage: fullImageUrl,
  height,
  width
});


    const savedBanner = await newBanner.save()
    return handleSuccess(res, 201, "Successfully created new banner", savedBanner)
  } catch (err) {
    console.error(err)
    return next(handleError(500, "Failed to create banner"))
  }
}

// Read Banner by Page
export const readBannerByPage = async (req, res, next) => {
  try {
    const { page } = req.params;
    const banner = await HeroBanner.findOne({ page });

    if (!banner) return next(handleError(404, "Banner not found for this page"));

    return handleSuccess(res, 200, "Banner fetched", banner);
  } catch (err) {
    return next(handleError(500, "Failed to fetch banner"));
  }
};

// Update Banner (text only)
// Add this to your controller
  export const updateHeroBanner = async (req, res, next) => {
    try {
      const { page } = req.params;
const { title, subTitle, description, buttonText, buttonLink, height, width } = req.body;

      const banner = await HeroBanner.findOne({ page });
   

    banner.title = title || banner.title;
banner.subTitle = subTitle || banner.subTitle;
banner.description = description || banner.description;
banner.buttonText = buttonText || banner.buttonText;
banner.buttonLink = buttonLink || banner.buttonLink;
banner.height = height || banner.height;
banner.width = width || banner.width;

      // Handle image
      if (req.file) {
        const oldImageName = banner.bannerImage?.split("/uploads/")[1];
        const oldImagePath = path.join(__dirname, "../../uploads", oldImageName);
        if (fs.existsSync(oldImagePath)) await deleteFile(oldImagePath);
        banner.bannerImage = `${req.protocol}://${req.get("host")}${getFileUrl(req.file.filename)}`;
      }

      const updated = await banner.save();
      return handleSuccess(res, 200, "Hero banner updated", updated);
    } catch (err) {
      console.error(err);
      return next(handleError(500, "Update failed"));
    }
  };



// Delete Banner (with image)
export const deleteHeroBanner = async (req, res, next) => {
  try {
    const banner = await HeroBanner.findByIdAndDelete(req.params.id);
    if (!banner) return next(handleError(404, "Banner not found"));

    const imageName = banner.bannerImage?.split("/uploads/")[1];
    const imagePath = path.join(__dirname, "../../uploads", imageName);

    if (fs.existsSync(imagePath)) {
      await deleteFile(imagePath);
      console.log("Banner image deleted:", imagePath);
    } else {
      console.log("Image file not found:", imagePath);
    }

    return handleSuccess(res, 200, "Banner and image deleted successfully", banner);
  } catch (err) {
    return next(handleError(500, "Unable to delete banner"));
  }
};
