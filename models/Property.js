import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
  propertyType: { 
    type: String,
    enum: ["Apartment", "Land", "House"],
    required: true,
  },
  propertyTransaction: {
    type: String,
    enum: ["Sale", "Rent"],
  },
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  location: { 
    type: String, 
    required: true,
    trim: true
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  size: { 
    type: String,
    trim: true
  },
  bedrooms: { 
    type: Number,
    min: 0
  },
  bathrooms: { 
    type: Number,
    min: 0
  },
  floor: { 
    type: Number,
    min: 0
  },
  // agent: { 
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User',
  //   // required: true
  // },
  agentName: {
    type: String,
    // required: true
  },
  agentNumber: {
    type: String,
    // bio: String,
  },
  amenities: [{ 
    type: String, 
    enum: [ 
      "Equipped kitchen",
      "Wi-Fi",
      "Lake view",
      "Free parking",
      "Swimming pool",
      "Light",
      "Air conditioning",
      "Gym",
      "Fully Fitted Kitchen",
      "Balcony",
      "Water Heater", 
      "CCTV",
    ]
  }],
  description: { 
    type: String,
    trim: true,
    maxlength: 1000
  },
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'sold', 'rented'],
    default: 'active'
  },
  images: [{
    type: String,
    validate: {
      validator: function(url) {
        return url.startsWith('http');
      },
      message: 'Image URL must be a valid URL'
    }
  }],
  // Add video URL field
  videoUrl: {
    type: String,
    validate: {
      validator: function(url) {
        if (!url) return true; // Optional field
        return url.startsWith('http');
      },
      message: 'Video URL must be a valid URL'
    }
  },
}, { 
  timestamps: true 
});

// Index for better query performance
propertySchema.index({ propertyType: 1, price: 1 });
propertySchema.index({ featured: 1, createdAt: -1 });
propertySchema.index({ agent: 1 });
propertySchema.index({ status: 1 });

const Property = mongoose.model('Property', propertySchema);

export default Property;