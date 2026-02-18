import teamModel from '../models/teamModel.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/sucessHandler.js';
import { getFileUrl } from '../middlewares/MulterMiddleware/multerMiddleware.js';
import fs from 'fs';
import path from 'path';
import { deleteFile, __dirname } from '../utils/fileHelpers.js';

// Create Team Member
export const createTeamMember = async (req, res, next) => {
  try {
    const {
      name,
      position,
      shortinfo,
      contactNumber,
      certifications,
      socialLinks,
    } = req.body;

 

    // Build main image URL
    const image = `${req.protocol}://${req.get('host')}${getFileUrl(req.files.image[0].filename)}`;

    // Parse certifications array (JSON string) or default to empty array
    const certs = certifications ? JSON.parse(certifications) : [];

    // Attach uploaded certification images URLs to certifications array items (by index)
    if (req.files.imageUrls && req.files.imageUrls.length) {
      req.files.imageUrls.forEach((file, idx) => {
        if (certs[idx]) {
          certs[idx].imageUrls = `${req.protocol}://${req.get('host')}${getFileUrl(file.filename)}`;
        }
      });
    }

    const newMember = new teamModel({
      name,
      position,
      image,
      shortinfo,
      contactNumber,
      certifications: certs,
      socialLinks: socialLinks ? JSON.parse(socialLinks) : {},
    });

    const saved = await newMember.save();
    return handleSuccess(res, 201, 'Team member created successfully', saved);
  } catch (error) {
    next(error);
  }
};


// Update Team Member
export const updateTeamMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      position,
      shortinfo,
      contactNumber,
      certifications,
      socialLinks,
    } = req.body;

    const member = await teamModel.findById(id);
    if (!member) {
      return next(handleError(404, 'Team member not found'));
    }

    // Update fields if provided
    if (name) member.name = name;
    if (position) member.position = position;
    if (shortinfo) member.shortinfo = shortinfo;
    if (contactNumber) member.contactNumber = contactNumber;

    // Parse certifications from JSON string if provided
    if (certifications) {
      member.certifications = JSON.parse(certifications);
    }

    // Parse socialLinks if provided
    if (socialLinks) {
      member.socialLinks = JSON.parse(socialLinks);
    }

    // Update main image if uploaded
    if (req.files?.image && req.files.image[0]) {
      // Delete old image file
      const oldImageName = member.image?.split('/uploads/')[1];
      if (oldImageName) {
        const oldImagePath = path.join(__dirname, '../../uploads', oldImageName);
        if (fs.existsSync(oldImagePath)) {
          await deleteFile(oldImagePath);
        }
      }
      // Set new image URL
      member.image = `${req.protocol}://${req.get('host')}${getFileUrl(req.files.image[0].filename)}`;
    }

    // Update certification images if uploaded, assign by index
    if (req.files.imageUrls && req.files.imageUrls.length) {
      req.files.imageUrls.forEach((file, idx) => {
        if (member.certifications[idx]) {
          member.certifications[idx].imageUrls = `${req.protocol}://${req.get('host')}${getFileUrl(file.filename)}`;
        }
      });
    }

    const updated = await member.save();
    return handleSuccess(res, 200, 'Team member updated successfully', updated);
  } catch (error) {
    next(error);
  }
};


// Get All Team Members
export const getAllTeamMembers = async (req, res, next) => {
  try {
    const members = await teamModel.find().sort({ createdAt: -1 });
    return handleSuccess(res, 200, 'Team members fetched successfully', members);
  } catch (error) {
    next(error);
  }
};


// Get Single Team Member
export const getTeamMemberById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const member = await teamModel.findById(id);
    if (!member) {
      return next(handleError(404, 'Team member not found'));
    }
    return handleSuccess(res, 200, 'Team member fetched successfully', member);
  } catch (error) {
    next(error);
  }
};


// Delete Team Member
export const deleteTeamMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const member = await teamModel.findByIdAndDelete(id);
    if (!member) {
      return next(handleError(404, 'Team member not found'));
    }

    // Delete main image file
    if (member.image) {
      const imageName = member.image.split('/uploads/')[1];
      if (imageName) {
        const imagePath = path.join(__dirname, '../../uploads', imageName);
        if (fs.existsSync(imagePath)) {
          await deleteFile(imagePath);
        }
      }
    }

    // Optionally delete certification images files here if you want (not implemented)

    return handleSuccess(res, 200, 'Team member and image deleted successfully');
  } catch (error) {
    next(error);
  }
};
