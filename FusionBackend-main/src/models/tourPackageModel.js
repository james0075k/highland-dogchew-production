import mongoose from 'mongoose';
import { type } from 'os';


const locationSchema = new mongoose.Schema({
  city: String,
  country: String,
}, { _id: false });

const durationSchema = new mongoose.Schema({
  days: Number,
  nights: Number,
}, { _id: false });




const fixedDepartureSchema = new mongoose.Schema({
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  }
}, { _id: false });



const featureSchema = new mongoose.Schema({
  groupSize: {
    min: { type: Number,  }
  },
  tripDuration: {
    type: String, // e.g. "14 Days"
    
  },
  tripDifficulty: {
    type: String,
    enum: ['Easy', 'Moderate', 'Difficult'],
   
  },
  meals: {
    type: [String], // e.g. ['Breakfast']
    default: []
  },
  activities: {

    type: [String], // e.g. ['Trekking', 'Walking']
    default: []
  },
  accommodation: {
    type: [String], // e.g. ['Hotel', 'Guesthouse']
    default: []
  },
  
  maxAltitude: {
    type: String, // e.g. "4,130 meters"
    
  },
  bestSeason: {
    type: [String], // e.g. ['Mar – May', 'Sep – Dec']
    default: []
  },
  startEndPoint: {
    type: String, // e.g. "Kathmandu"
    
  }
}, { _id: false });

const itinerarySchema = new mongoose.Schema({
  day: { type: Number },
  title: { type: String, },
  altitude: { type: Number },
  description: { type: String},
  activities: [String], // e.g., ['Trekking', 'Walking']
  image: { type: String }, // e.g., a URL to the day’s photo
 
}, { _id: false });

const tourPackageSchema = new mongoose.Schema({
  title: { type: String,  index: 'text' },
  description: { type: String,  index: 'text' },
  overview: { type: String,  index: 'text' },

  location: {
    type: locationSchema,
    index: true,
  },

  duration: {
    type: durationSchema,
    index: true,
  },

  basePrice: { type: Number,  index: true },
  currency: { type: String,  },

  gallery: [String],

  googleMapUrl:{type: String},

  itinerary: [itinerarySchema],

  inclusions: [String],
  exclusions: [String],
  cancellation: [String],

  highlights: [String],
  
  quickfacts: [String],

  fixedDepartures: {
    type: [fixedDepartureSchema],
  },



  feature: {
    type: featureSchema,
    
  },

  type: {
    type: String,
    enum: ['trek', 'tour', 'hike', 'adventure'],
    
  },



  tag: {
    type: String,
   
  },



  rating: {
    type: Number,
    default: 0,
  },


  destination: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Destination',
},


activitiescategory: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'TourCategory',
},



}, {
  timestamps: true,
});




tourPackageSchema.index({
  'duration.days': 1,
  basePrice: 1,
  'location.city': 1,
  rating: -1,
});



export default mongoose.model('TourPackage', tourPackageSchema);