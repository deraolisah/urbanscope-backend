import cloudinary from "../config/cloudinary.js";
import Property from "../models/Property.js";
import { 
  // uploadImagesToCloudinary, 
  deletePropertyImages, 
  // parseAmenities 
} from "../utils/cloudinaryUtils.js";

// Add New Property
export const addProperty = async (req, res) => {
  try {
    const imageFiles = req.files; // array of uploaded images
    const imageUrls = [];

    // Upload images to Cloudinary sequentially
    for (const file of imageFiles) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "niarobi-properties" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(file.buffer);
      });
      imageUrls.push(result.secure_url);
    }

    // Parse amenities if it's a string (common when sending from frontend)
    const amenities = Array.isArray(req.body.amenities) 
      ? req.body.amenities 
      : JSON.parse(req.body.amenities || '[]');

    const newProperty = new Property({
      ...req.body,
      amenities,
      images: imageUrls,
    });

    const savedProperty = await newProperty.save();
    res.status(201).json(savedProperty);
  } catch (error) {
    res.status(500).json({ message: "Failed to add property", error });
  }
};


// Update Property
export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    const imageFiles = req.files;

    // Handle image uploads if new images are provided
    if (imageFiles && imageFiles.length > 0) {
      const imageUrls = [];
      
      for (const file of imageFiles) {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: "niarobi-properties" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(file.buffer);
        });
        imageUrls.push(result.secure_url);
      }

      // Get existing property to preserve old images if needed
      const existingProperty = await Property.findById(id);
      const existingImages = existingProperty ? existingProperty.images : [];
      
      updateData.images = [...existingImages, ...imageUrls];
    }

    // Parse amenities if needed
    if (req.body.amenities && typeof req.body.amenities === 'string') {
      updateData.amenities = JSON.parse(req.body.amenities);
    }

    const updated = await Property.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true 
    });
    
    if (!updated) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    res.status(200).json(updated);
  } catch (error) {
    console.error("Update property error:", error);
    res.status(500).json({ message: "Failed to update property", error: error.message });
  }
};


// Delete Property
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Delete images from Cloudinary
    if (property.images && property.images.length > 0) {
      await deletePropertyImages(property.images);
    }

    await Property.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Delete property error:", error);
    res.status(500).json({ message: "Failed to delete property", error: error.message });
  }
};

// Get All Properties
export const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find();
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch properties", error });
  }
};

// Get A Single Property
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch property", error });
  }
};


// Get Featured Properties
export const getFeaturedProperties = async (req, res) => {
  try {
    const featured = await Property.find({ featured: true });
    res.json(featured);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch featured properties", error });
  }
};