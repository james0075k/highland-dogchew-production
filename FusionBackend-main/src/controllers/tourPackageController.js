import TourPackage from '../models/tourPackageModel.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/sucessHandler.js';
import { getFileUrl } from '../middlewares/MulterMiddleware/multerMiddleware.js';
import { deleteFile, __dirname } from '../utils/fileHelpers.js';
import destinationModel from '../models/destinationModel.js';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';


import tourCategoryModel from '../models/tourCategoryModel.js';
import PDFDocument from "pdfkit";

// ✅ Helper function to parse JSON safely
const safeJsonParse = (str, defaultValue = null) => {
  try {
    return str ? JSON.parse(str) : defaultValue;
  } catch (error) {
    console.error('JSON Parse Error:', error);
    return defaultValue;
  }
};

// ✅ Helper function to validate ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ✅ Create Tour Package
export const createTourPackage = async (req, res, next) => {
  try {
    const {
      title = "",
      description = "",
      overview = "",
      location,
      duration,
      basePrice = 0,
      currency = "USD",
      itinerary,
      inclusions,
      exclusions,
      cancellation,
      highlights,
      quickfacts,
      type = "",
      tag = "",
      rating = 0,
      feature,
      destination,
      fixedDepartures,
      activitiescategory,
    } = req.body;

    const parsedLocation = safeJsonParse(location, {});
    const parsedDuration = safeJsonParse(duration, {});
    const parsedItinerary = safeJsonParse(itinerary, []);
    const parsedInclusions = safeJsonParse(inclusions, []);
    const parsedExclusions = safeJsonParse(exclusions, []);
    const parsedcancellation = safeJsonParse(cancellation, []);
    const parsedHighlights = safeJsonParse(highlights, []);
    const parsedQuickFacts = safeJsonParse(quickfacts, []);
    const parsedFixedDepartures = safeJsonParse(fixedDepartures, []);
    const parsedFeature = safeJsonParse(feature, {});

    let foundDestination = null;
    if (destination) {
      if (isValidObjectId(destination)) {
        foundDestination = await destinationModel.findById(destination);
      } else {
        foundDestination = await destinationModel.findOne({ title: destination });
      }

      if (!foundDestination) {
        return next(handleError(404, `Destination "${destination}" not found.`));
      }
    }

   let foundCategory = null;
if (activitiescategory) {
  if (isValidObjectId(activitiescategory)) {
    foundCategory = await tourCategoryModel.findById(activitiescategory);
  } else {
    foundCategory = await tourCategoryModel.findOne({ title: activitiescategory });
  }

  if (!foundCategory) {
    return next(handleError(404, `Activities Category "${activitiescategory}" not found.`));
  }
}


  let gallery = [];
if (req.files?.gallery) {
  gallery = req.files.gallery.map(file =>
    `${req.protocol}://${req.get('host')}${getFileUrl(file.filename)}`
  );
}

// ✅ Google Map Image
let googleMapImageUrl = '';
if (req.files?.googleMapImage?.[0]) {
  googleMapImageUrl = `${req.protocol}://${req.get('host')}${getFileUrl(req.files.googleMapImage[0].filename)}`;
}

// ✅ Attach images to itinerary steps
let itineraryWithImages = [];
if (req.files?.itineraryImages && Array.isArray(req.files.itineraryImages)) {
  itineraryWithImages = parsedItinerary.map((item, index) => {
    let imageUrl = '';
    if (req.files.itineraryImages[index]) {
      imageUrl = `${req.protocol}://${req.get('host')}${getFileUrl(req.files.itineraryImages[index].filename)}`;
    }
    return {
      ...item,
      image: imageUrl,
    };
  });
} else {
  itineraryWithImages = parsedItinerary;
}

    const tour = new TourPackage({
      title,
      description,
      overview,
      location: parsedLocation,
      duration: parsedDuration,
      basePrice: Number(basePrice),
      currency,
      itinerary: itineraryWithImages,
      inclusions: parsedInclusions,
      exclusions: parsedExclusions,
      cancellation: parsedcancellation,
      highlights: parsedHighlights,
      quickfacts: parsedQuickFacts,
      type,
      tag,
      rating: Number(rating),
      feature: parsedFeature,
      gallery,
      googleMapUrl: googleMapImageUrl,
      destination: foundDestination?._id,
      fixedDepartures: parsedFixedDepartures,
      activitiescategory: foundCategory?._id,
      createdBy: req.user?._id,
    });

    const savedTour = await tour.save();
    return handleSuccess(res, 201, "Tour package created successfully", savedTour);
  } catch (error) {
    return next(handleError(500, `Failed to create tour package: ${error.message}`));
  }
};

// ✅ Get All Tour Packages
export const getAllTourPackages = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tours = await TourPackage.find()
      .populate('destination', 'title slug') // Only populate needed fields
      .populate('activitiescategory', 'name image slug') // Fixed: changed from 'activitescategory' to 'activitiescategory'
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await TourPackage.countDocuments();
    
    console.log(`✅ Fetched ${tours.length} tour packages (page ${page})`);

    return handleSuccess(res, 200, 'Tour packages fetched successfully', {
      tours,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error("🔥 GetAllTourPackages Error:", err);
    return next(handleError(500, 'Unable to fetch tour packages'));
  }
};

// ✅ Get Single Tour by ID
export const getTourPackageById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // ✅ Validate ObjectId first
    if (!isValidObjectId(id)) {
      return next(handleError(400, 'Invalid tour package ID format'));
    }

    const tour = await TourPackage.findById(id)
      .populate('destination')
      .populate('activitiescategory'); // Fixed: changed from 'activitescategory' to 'activitiescategory'

    if (!tour) {
      return next(handleError(404, 'Tour package not found'));
    }

    console.log("✅ Tour package fetched:", tour._id);
    return handleSuccess(res, 200, 'Tour package fetched successfully', tour);
    
  } catch (err) {
    console.error("🔥 GetTourPackageById Error:", err);
    return next(handleError(500, 'Unable to fetch tour package'));
  }
};

// ✅ Update Tour Package
export const updateTourPackage = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return next(handleError(400, 'Invalid tour package ID format'));
    }

    const {
      title, description, overview, location, duration, basePrice,
      currency, itinerary, inclusions, exclusions, cancellation,
      highlights, quickfacts, type, tag, rating,
      feature, destination, fixedDepartures, activitiescategory
    } = req.body;

    // ✅ Parse JSON fields safely
    const parsedLocation = safeJsonParse(location);
    const parsedDuration = safeJsonParse(duration);
    const parsedItinerary = safeJsonParse(itinerary, []);
    const parsedInclusions = safeJsonParse(inclusions, []);
    const parsedExclusions = safeJsonParse(exclusions, []);
    const parsedcancellation = safeJsonParse(cancellation, []);
    const parsedHighlights = safeJsonParse(highlights, []);
    const parsedQuickFacts = safeJsonParse(quickfacts, []);
    const parsedFixedDepartures = safeJsonParse(fixedDepartures, []);
    const parsedFeature = safeJsonParse(feature);

    // ✅ Get gallery images (if new)
    let gallery = [];
    if (req.files?.gallery) {
      gallery = req.files.gallery.map(file =>
        `${req.protocol}://${req.get('host')}${getFileUrl(file.filename)}`
      );
    }

    // ✅ Google Map Image
    let googleMapImageUrl = '';
    if (req.files?.googleMapImage?.[0]) {
      googleMapImageUrl = `${req.protocol}://${req.get('host')}${getFileUrl(req.files.googleMapImage[0].filename)}`;
    }

    // ✅ Itinerary Images
    const itineraryWithImages = parsedItinerary.map((item, index) => {
      let imageUrl = item?.image || null;
      if (req.files?.itineraryImages && req.files.itineraryImages[index]) {
        imageUrl = `${req.protocol}://${req.get('host')}${getFileUrl(req.files.itineraryImages[index].filename)}`;
      }
      return {
        ...item,
        image: imageUrl,
      };
    });

    // ✅ Destination ID Resolution
    let foundDestination = null;
    if (destination) {
      foundDestination = isValidObjectId(destination)
        ? await destinationModel.findById(destination)
        : await destinationModel.findOne({ title: destination });

      if (!foundDestination) {
        return next(handleError(404, `Destination "${destination}" not found`));
      }
    }

    // ✅ Activities Category Resolution
    let foundCategory = null;
    if (activitiescategory) {
      foundCategory = isValidObjectId(activitiescategory)
        ? await tourCategoryModel.findById(activitiescategory)
        : await tourCategoryModel.findOne({ name: activitiescategory });

      if (!foundCategory) {
        return next(handleError(404, `Tour category "${activitiescategory}" not found`));
      }
    }

    // ✅ Build final update object
    const updateData = {
      ...(title && { title }),
      ...(description && { description }),
      ...(overview && { overview }),
      ...(parsedLocation && { location: parsedLocation }),
      ...(parsedDuration && { duration: parsedDuration }),
      ...(basePrice && { basePrice: Number(basePrice) }),
      ...(currency && { currency }),
      ...(parsedInclusions && { inclusions: parsedInclusions }),
      ...(parsedExclusions && { exclusions: parsedExclusions }),
      ...(parsedcancellation && { cancellation: parsedcancellation }),
      ...(parsedHighlights && { highlights: parsedHighlights }),
      ...(parsedQuickFacts && { quickfacts: parsedQuickFacts }),
      ...(parsedFeature && { feature: parsedFeature }),
      ...(parsedFixedDepartures && { fixedDepartures: parsedFixedDepartures }),
      ...(type && { type }),
      ...(tag && { tag }),
      ...(rating && { rating: Number(rating) }),
      ...(gallery.length > 0 && { gallery }),
      ...(googleMapImageUrl && { googleMapUrl: googleMapImageUrl }),
      ...(parsedItinerary.length > 0 && { itinerary: itineraryWithImages }),
      ...(foundDestination && { destination: foundDestination._id }),
      ...(foundCategory && { activitiescategory: foundCategory._id }),
    };

    const updated = await TourPackage.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate('destination').populate('activitiescategory');

    if (!updated) {
      return next(handleError(404, 'Tour package not found'));
    }

    console.log("✅ Tour package updated:", updated._id);
    return handleSuccess(res, 200, 'Tour package updated successfully', updated);

  } catch (err) {
    console.error("🔥 UpdateTourPackage Error:", err);
    return next(handleError(500, `Failed to update tour package: ${err.message}`));
  }
};


// ✅ Delete Tour Package
export const deleteTourPackage = async (req, res, next) => {
  try {
    const { id } = req.params;

    // ✅ Validate ObjectId
    if (!isValidObjectId(id)) {
      return next(handleError(400, 'Invalid tour package ID format'));
    }

    const tour = await TourPackage.findByIdAndDelete(id);
    if (!tour) {
      return next(handleError(404, 'Tour package not found'));
    }

    // ✅ Delete associated images
    const imagesToDelete = [];
    
    // Gallery images
    if (tour.gallery?.length) {
      tour.gallery.forEach(imageUrl => {
        const imageName = imageUrl?.split('/uploads/')[1];
        if (imageName) {
          imagesToDelete.push(path.join(__dirname, '../../uploads', imageName));
        }
      });
    }

    // Google Map image
    if (tour.googleMapUrl) {
      const mapImageName = tour.googleMapUrl?.split('/uploads/')[1];
      if (mapImageName) {
        imagesToDelete.push(path.join(__dirname, '../../uploads', mapImageName));
      }
    }

    // Itinerary images
    if (tour.itinerary?.length) {
      tour.itinerary.forEach(item => {
        const stepImageName = item?.image?.split('/uploads/')[1];
        if (stepImageName) {
          imagesToDelete.push(path.join(__dirname, '../../uploads', stepImageName));
        }
      });
    }

    // Delete all images
    for (const imagePath of imagesToDelete) {
      if (fs.existsSync(imagePath)) {
        await deleteFile(imagePath);
      }
    }

    console.log("✅ Tour package and images deleted:", tour._id);
    return handleSuccess(res, 200, 'Tour package and associated images deleted successfully');
    
  } catch (err) {
    console.error("🔥 DeleteTourPackage Error:", err);
    return next(handleError(500, 'Unable to delete tour package'));
  }
};

// ✅ Search Tour Packages
export const searchTourPackages = async (req, res, next) => {
  try {
    const { location, min, max, type, tag, priceMin, priceMax } = req.query;

    const query = {};

    // Duration filter
    if (min || max) {
      query['duration.days'] = {};
      if (min) query['duration.days'].$gte = Number(min);
      if (max) query['duration.days'].$lte = Number(max);
    }

    // Price filter
    if (priceMin || priceMax) {
      query.basePrice = {};
      if (priceMin) query.basePrice.$gte = Number(priceMin);
      if (priceMax) query.basePrice.$lte = Number(priceMax);
    }

    // Location filter
    if (location && location.trim()) {
      const regex = new RegExp(location.trim(), 'i');
      query['location.city'] = regex;
    }

    // Type filter
    if (type) {
      query.type = type;
    }

    // Tag filter
    if (tag) {
      query.tag = tag;
    }

    const results = await TourPackage.find(query)
      .populate('destination', 'title slug')
      .populate('activitiescategory')
      .sort({ createdAt: -1 });

    console.log(`✅ Search completed: ${results.length} results found`);
    return handleSuccess(res, 200, 'Search completed successfully', results);
    
  } catch (error) {
    console.error("🔥 SearchTourPackages Error:", error);
    return next(handleError(500, 'Unable to search tour packages'));
  }
};

// ✅ Get Tours by Activity Category
export const getToursByActivitySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Find category by slug
    const category = await tourCategoryModel.findOne({ slug });

    if (!category) {
      return next(handleError(404, 'Tour category not found'));
    }

    // Find tour packages with the matching category _id
    const packages = await TourPackage.find({ activitiescategory: category._id })
      .populate('destination', 'title slug')
      .populate('activitiescategory', 'name slug')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${packages.length} packages for category slug: ${slug}`);
    return handleSuccess(res, 200, 'Tour packages by category fetched successfully', packages);
    
  } catch (err) {
    console.error("🔥 GetToursByActivitySlug Error:", err);
    return next(handleError(500, 'Unable to fetch packages by activity slug'));
  }
};

// ✅ Get Tours by Tag
export const getTourPackagesByTag = async (req, res, next) => {
  try {
    const { tag } = req.params;

    if (!tag) {
      return next(handleError(400, 'Tag parameter is required'));
    }

    const packages = await TourPackage.find({ tag: tag.toLowerCase() })
      .populate('destination', 'title slug')
      .populate('activitiescategory', 'name slug')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${packages.length} packages with tag:`, tag);
    return handleSuccess(res, 200, `Tour packages with tag "${tag}" fetched successfully`, packages);
    
  } catch (err) {
    console.error("🔥 GetTourPackagesByTag Error:", err);
    return next(handleError(500, 'Failed to fetch tour packages by tag'));
  }
};

// ✅ Get Related Packages
export const getRelatedPackages = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return next(handleError(400, 'Invalid tour package ID format'));
    }

    const currentPackage = await TourPackage.findById(id);
    if (!currentPackage) {
      return next(handleError(404, 'Tour package not found'));
    }

    const relatedPackages = await TourPackage.find({
      _id: { $ne: id },
      $or: [
        { type: currentPackage.type },
        { activitiescategory: currentPackage.activitiescategory },
        { destination: currentPackage.destination }
      ]
    })
    .populate('destination', 'title slug')
    .populate('activitiescategory', 'name slug')
    .limit(6)
    .sort({ rating: -1 });

    console.log(`✅ Found ${relatedPackages.length} related packages`);
    return handleSuccess(res, 200, 'Related packages fetched successfully', relatedPackages);
    
  } catch (error) {
    console.error("🔥 GetRelatedPackages Error:", error);
    return next(handleError(500, 'Unable to fetch related packages'));
  }
};

// ✅ Filter by Duration
export const filterByDuration = async (req, res, next) => {
  try {
    const { min, max } = req.query;

    if (!min || !max) {
      return next(handleError(400, 'Duration min and max are required'));
    }

    const filteredPackages = await TourPackage.find({
      'duration.days': {
        $gte: Number(min),
        $lte: Number(max),
      },
    })
    .populate('destination', 'title slug')
    .populate('activitiescategory', 'name slug')
    .sort({ createdAt: -1 });

    console.log(`✅ Filtered ${filteredPackages.length} packages by duration`);
    return handleSuccess(res, 200, 'Packages filtered by duration successfully', filteredPackages);
    
  } catch (err) {
    console.error("🔥 FilterByDuration Error:", err);
    return next(handleError(500, 'Unable to filter by duration'));
  }
};




export const generateTourPDF = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tour = await TourPackage.findById(id)
      .populate("destination")
      .populate("activitiescategory");

    if (!tour) {
      return next(handleError(404, "Tour package not found"));
    }

    // Create a new PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${tour.title.replace(/\s+/g, "_")}.pdf"`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Title
    doc.fontSize(20).text(tour.title, { underline: true });

    // Basic Info
    doc
      .moveDown()
      .fontSize(12)
      .text(`Location: ${tour.location?.city || 'N/A'}`)
      .moveDown()
      .text(`Duration: ${tour.duration?.days || 0} Days / ${tour.duration?.nights || 0} Nights`)
      .moveDown()
      .text(`Base Price: ${tour.basePrice} ${tour.currency}`)
      .moveDown()
      .text(`Overview:\n${tour.overview || 'N/A'}`);

    // Highlights
    if (tour.highlights?.length) {
      doc.moveDown().fontSize(14).text("Highlights:", { underline: true });
      tour.highlights.forEach((item, i) => doc.text(`${i + 1}. ${item}`));
    }

    // Inclusions
    if (tour.inclusions?.length) {
      doc.addPage().fontSize(14).text("Cost Includes:", { underline: true });
      tour.inclusions.forEach((item, i) => doc.fontSize(12).text(`• ${item}`));
    }

    // Exclusions
    if (tour.exclusions?.length) {
      doc.addPage().fontSize(14).text("Cost Excludes:", { underline: true });
      tour.exclusions.forEach((item, i) => doc.fontSize(12).text(`• ${item}`));
    }

    // Itinerary
    if (tour.itinerary?.length) {
      doc.addPage().fontSize(14).text("Itinerary:", { underline: true });
      tour.itinerary.forEach((step, i) => {
        doc.moveDown().fontSize(13).text(`Day ${i + 1}: ${step.title}`);
        doc.fontSize(11).text(step.description);
      });
    }

    doc.end(); // Finalize PDF
  } catch (error) {
    console.error("🔥 PDF Generation Error:", error);
    return next(handleError(500, "Failed to generate PDF"));
  }
};