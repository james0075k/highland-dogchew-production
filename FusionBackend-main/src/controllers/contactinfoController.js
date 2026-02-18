import ContactInfo from '../models/contactinfoModel.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/sucessHandler.js';

// Create or Update Contact Info (singleton)

export const saveContactInfo = async (req, res, next) => {
  try {
    const { address, phones, email, whatsappNumber, socialLinks } = req.body;

    let info = await ContactInfo.findOne();

    if (info) {
      info.address = address;
      info.phones = phones;
      info.email = email;
      info.whatsappNumber = whatsappNumber;
      info.socialLinks = socialLinks;
    } else {
      info = new ContactInfo({
        address,
        phones,
        email,
        whatsappNumber,
        socialLinks,
      });
    }

    const saved = await info.save();
    return handleSuccess(res, 200, 'Contact info saved successfully', saved);
  } catch (error) {
    next(error);
  }
};

// Get Contact Info
export const getContactInfo = async (req, res, next) => {
  try {
    const info = await ContactInfo.findOne();
    if (!info) {
      return next(handleError(404, 'Contact info not found'));
    }
    return handleSuccess(res, 200, 'Contact info fetched successfully', info);
  } catch (error) {
    next(error);
  }
};

// Delete Contact Info
export const deleteContactInfo = async (req, res, next) => {
  try {
    const info = await ContactInfo.findOne();
    if (!info) {
      return next(handleError(404, 'No contact info to delete'));
    }
    await ContactInfo.findByIdAndDelete(info._id);
    return handleSuccess(res, 200, 'Contact info deleted successfully');
  } catch (error) {
    next(error);
  }
};
