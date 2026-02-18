import Joi from 'joi';
import mongoose from 'mongoose';


export const objectIdValidation = (value, helpers) => {
  if (!value) return value; // Allow empty/undefined/null if optional

  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message('"category" must be a valid ObjectId');
  }
  return value;
};

export const blogValidationSchema = Joi.object({
  title: Joi.string().optional(),
  subtitle: Joi.string().optional(),
  description: Joi.string().optional(),
  imageUrl: Joi.string().uri().optional(),
  date: Joi.date().optional(),
  category: Joi.string()
    .optional()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }, 'ObjectId Validation'),
  isFeatured: Joi.boolean().optional(),
  slug: Joi.string().optional(),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional(),
  __v: Joi.number().optional(),
});


export const activityValidationSchema = Joi.object({
  title: Joi.string().optional(),
  slug: Joi.string().optional(), // Optional because it's auto-generated from title
  subtitle: Joi.string().optional(),
  description: Joi.string().optional(),
  image: Joi.string().uri().optional(),
  isFeatured: Joi.boolean().optional(),
  category: Joi.string().allow(null, '').custom(objectIdValidation).optional(), 
  createdAt: Joi.date().optional(), // Will be set automatically by default
});






export const tourPackageValidationSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  overview: Joi.string().optional(),

  location: Joi.object({
    city: Joi.string().optional(),
    country: Joi.string().optional(),
  }).optional(),

  duration: Joi.object({
    days: Joi.number().min(1).optional(),
    nights: Joi.number().min(0).optional(),
  }).optional(),

  basePrice: Joi.number().min(0).optional(),
  currency: Joi.string().optional(),

  discount: Joi.object({
    amount: Joi.number().min(0),
    validUntil: Joi.date(),
  }).optional(),

  gallery: Joi.array().items(Joi.string().uri()).optional(),

  googleMapUrl: Joi.string().uri().optional(),

  itinerary: Joi.array().items(
    Joi.object({
      day: Joi.number().optional(),
      title: Joi.string().optional(),
      altitude: Joi.number().optional(),
      description: Joi.string().optional(),
      activities: Joi.array().items(Joi.string()).optional(),
      image: Joi.string().uri().optional(),
    })
  ).optional(),

  inclusions: Joi.array().items(Joi.string()).optional(),
  exclusions: Joi.array().items(Joi.string()).optional(),
  highlights: Joi.array().items(Joi.string()).optional(),
   quickfacts: Joi.array().items(Joi.string()).optional(),

  availability: Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    maxGroupSize: Joi.number().optional(),
    availableSlots: Joi.number().optional(),
  }).optional(),

  feature: Joi.object({
    groupSize: Joi.object({
      min: Joi.number().optional()
    }).optional(),
    tripDuration: Joi.string().optional(),
    tripDifficulty: Joi.string().valid('Easy', 'Moderate', 'Difficult').optional(),
    meals: Joi.array().items(Joi.string()).optional(),
    activities: Joi.array().items(Joi.string()).optional(),
    accommodation: Joi.array().items(Joi.string()).optional(),
    maxAltitude: Joi.string().optional(),
    bestSeason: Joi.array().items(Joi.string()).optional(),
    startEndPoint: Joi.string().optional(),
  }).optional(),

  type: Joi.string().valid('trek', 'tour', 'hike', 'adventure').optional(),

  tag: Joi.string().optional(),

  visibility: Joi.string().valid('public', 'draft').default('draft'),

  rating: Joi.number().min(0).optional(),

  destination: Joi.string().optional(),
 activitiescategory: Joi.string().optional(),


 fixedDepartures: Joi.array().items(
    Joi.object({
      startDate: Joi.date().optional(),
      endDate: Joi.date().optional(),
    })
  ),

  
});




export const bookingValidationSchema = Joi.object({
  name: Joi.string().trim().optional  ().messages({
    'string.base': 'Name must be a string',
    'string.empty': 'Name is optional ',
    'any.optional ': 'Name is optional '
  }),
  email: Joi.string().email().optional  ().messages({
    'string.email': 'Invalid email format',
    'string.empty': 'Email is optional  ',
    'any.optional ': 'Email is optional  '
  }),
  phone: Joi.string().trim().optional ().messages({
    'string.empty': 'Phone number is optional ',
    'any.optional ': 'Phone number is optional '
  }),
  country: Joi.string().trim().optional ().messages({
    'string.empty': 'Country is optional  ',
    'any.optional ': 'Country is optional  '
  }),
  travelDate: Joi.date().iso().optional ().messages({
    'date.base': 'Travel date must be a valid date',
    'date.empty': 'Travel date is optional  ',
    'any.optional ': 'Travel date is optional  '
  }),
  totalPeople: Joi.number().min(1).optional ().messages({
    'number.base': 'Total people must be a number',
    'number.min': 'There must be at least one traveler',
    'any.optional ': 'Total people is optional '
  }),
  specialRequests: Joi.string().allow('').optional(),
  tourPackageId: Joi.string().optional  ().custom(objectIdValidation, 'ObjectId validation').messages({
    'any.invalid': 'Invalid Tour Package ID',
    'any.optional ': 'Tour Package ID is optional  '
  })
});



export const contactValidationSchema = Joi.object({
  guestInfo: Joi.object({
    name: Joi.string().optional().messages({
      'any.optional': 'Name is optional',
    }),
    email: Joi.string().email().optional().messages({
      'string.email': 'Email must be valid',
      'any.optional': 'Email is optional',
    }),
    phoneNumber: Joi.string().optional().messages({
      'any.optional': 'Phone number is optional',
    }),
    country: Joi.string().allow('', null).optional(), // Optional
  }).optional(),

  message: Joi.string().optional().messages({
    'any.': 'Message is optional',
  }),

  status: Joi.string().valid('open', 'resolved', 'closed').optional().messages({
    'any.only': 'Status must be one of open, resolved, or closed',
  }),
});




export const privateTripValidationSchema = Joi.object({
  guestInfo: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().required(),
    country: Joi.string().optional()
  }).required(),
  preferredDestination: Joi.string().optional(),
  tripLength: Joi.string().optional(),
  desiredMonth: Joi.string().optional(),
  activities: Joi.string().optional(),
  additionalNotes: Joi.string().optional(),
  status: Joi.string().valid('open', 'planned', 'cancelled', 'completed').optional()
});
