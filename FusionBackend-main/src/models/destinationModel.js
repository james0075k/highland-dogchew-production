import mongoose from 'mongoose';
import slugify from 'slugify';


const destinationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,


    },
    subtitle: {
      type: String,
      required: true,
    },
    
    description: {
      type: String,
      
    },

    imageUrls: {
      type: [String],
      required: true,
    },


    tag: {
     type:String,
     required: true,

    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
      unique: true,
    },
    
    totalTrips: {
      type: Number,
      default: 0, 
    },

    availableFrom: Date,  

    availableTo: Date  
  },

  
  {
    timestamps: true,
  }
);

destinationSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});


const destinationModel = mongoose.model('Destination', destinationSchema)

export default destinationModel;
