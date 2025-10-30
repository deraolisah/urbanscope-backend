import cloudinary from "../config/cloudinary.js";
import Property from "../models/Property.js";
import User from "../models/User.js";
import { deletePropertyImages } from "../utils/cloudinaryUtils.js";

// Add New Property (Admin only)
export const addProperty = async (req, res) => {
  try {
    const imageFiles = req.files;
    const admin = await User.findById(req.user.id);
    
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: "Only admins can add properties" });
    }

    // Validate required fields
    const requiredFields = ['propertyType', 'propertyTransaction', 'title', 'location', 'price'];
    for (let field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    // Validate images
    if (!imageFiles || imageFiles.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    const imageUrls = [];

    // Upload images to Cloudinary
    for (const file of imageFiles) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "urban-scope" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(file.buffer);
      });
      imageUrls.push(result.secure_url);
    }

    // Parse amenities
    // const amenities = Array.isArray(req.body.amenities) 
    //   ? req.body.amenities 
    //   : JSON.parse(req.body.amenities || '[]');

    // In both addProperty and updateProperty controllers
    // Replace the amenities parsing with:
    const amenities = typeof req.body.amenities === 'string' 
      ? JSON.parse(req.body.amenities)
      : req.body.amenities || [];

    // Make sure it's always an array
    const amenitiesArray = Array.isArray(amenities) ? amenities : [];

    const newProperty = new Property({
      ...req.body,
      amenities: amenitiesArray,
      images: imageUrls,
      price: parseFloat(req.body.price),
      bedrooms: req.body.bedrooms ? parseInt(req.body.bedrooms) : undefined,
      bathrooms: req.body.bathrooms ? parseInt(req.body.bathrooms) : undefined,
      floor: req.body.floor ? parseInt(req.body.floor) : undefined,
    });

    const savedProperty = await newProperty.save();
    res.status(201).json(savedProperty);
  } catch (error) {
    console.error("Add property error:", error);
    res.status(500).json({ message: "Failed to add property", error: error.message });
  }
};


// Update Property (Admin)
export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Only admins can update properties" });
    }

    console.log("=== UPDATE PROPERTY REQUEST ===");
    console.log("Request body:", req.body);
    console.log("Files:", req.files ? req.files.length : 0);
    
    const body = req.body || {};
    console.log("Current images:", body.currentImages);
    console.log("Images to delete:", body.imagesToDelete);
    console.log("===============================");

    const updateData = {};
    const imageFiles = req.files;

    // Handle images to delete
    if (body.imagesToDelete) {
      try {
        const imagesToDelete = typeof body.imagesToDelete === 'string' 
          ? JSON.parse(body.imagesToDelete)
          : body.imagesToDelete;

        if (Array.isArray(imagesToDelete) && imagesToDelete.length > 0) {
          // Delete images from Cloudinary
          await deletePropertyImages(imagesToDelete);
          console.log(`Deleted ${imagesToDelete.length} images from Cloudinary`);
        }
      } catch (error) {
        console.error("Error processing images to delete:", error);
      }
    }

    // Handle current images (remaining images after deletions)
    if (body.currentImages) {
      try {
        const currentImages = typeof body.currentImages === 'string'
          ? JSON.parse(body.currentImages)
          : body.currentImages;
        
        if (Array.isArray(currentImages)) {
          updateData.images = currentImages;
        }
      } catch (error) {
        console.error("Error processing current images:", error);
        // If there's an error, keep existing images
        updateData.images = property.images || [];
      }
    } else {
      // If no current images provided, keep existing ones
      updateData.images = property.images || [];
    }

    // Handle new image uploads
    if (imageFiles && imageFiles.length > 0) {
      const imageUrls = [];
      
      for (const file of imageFiles) {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: "urban-scope" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(file.buffer);
        });
        imageUrls.push(result.secure_url);
      }

      // Combine current images with new ones
      updateData.images = [...(updateData.images || []), ...imageUrls];
    }

    // Handle other fields (your existing code)
    const fieldsToUpdate = [
      'propertyType', 'propertyTransaction', 'title', 'location', 
      'price', 'size', 'bedrooms', 'bathrooms', 'floor', 'amenities',
      'agentName', 'agentNumber', 'description', 'status', 'videoUrl'
    ];

    fieldsToUpdate.forEach(field => {
      if (body[field] !== undefined && body[field] !== null && body[field] !== '') {
        updateData[field] = body[field];
      }
    });

    // Handle numeric fields
    if (body.price !== undefined && body.price !== '') {
      updateData.price = parseFloat(body.price) || 0;
    }
    if (body.bedrooms !== undefined && body.bedrooms !== '') {
      updateData.bedrooms = parseInt(body.bedrooms) || 0;
    }
    if (body.bathrooms !== undefined && body.bathrooms !== '') {
      updateData.bathrooms = parseInt(body.bathrooms) || 0;
    }
    if (body.floor !== undefined && body.floor !== '') {
      updateData.floor = parseInt(body.floor) || 0;
    }

    // Handle boolean field
    if (body.featured !== undefined) {
      updateData.featured = body.featured === 'true' || body.featured === true;
    }

    // Handle amenities
    if (body.amenities !== undefined && body.amenities !== null && body.amenities !== '') {
      try {
        if (Array.isArray(body.amenities)) {
          updateData.amenities = body.amenities;
        } else if (typeof body.amenities === 'string') {
          const parsedAmenities = JSON.parse(body.amenities);
          updateData.amenities = Array.isArray(parsedAmenities) ? parsedAmenities : [];
        } else {
          updateData.amenities = [];
        }
      } catch (parseError) {
        console.error("Error parsing amenities:", parseError);
        updateData.amenities = property.amenities || [];
      }
    } else {
      updateData.amenities = property.amenities || [];
    }

    console.log("Final update data:", updateData);

    const updated = await Property.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true 
    });
    
    res.status(200).json(updated);
  } catch (error) {
    console.error("Update property error:", error);
    res.status(500).json({ message: "Failed to update property", error: error.message });
  }
};


// Delete Property (Admin)
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if user can delete this property
    if (req.user.role === 'admin' && (!property.agent || property.agent.toString() !== req.user.id)) {
      return res.status(403).json({ message: "Not authorized to delete this property" });
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
// Get All Properties (with agent population)
// export const getAllProperties = async (req, res) => {
//   try {
//     const properties = await Property.find({ status: 'active' })
//       .populate('agent', 'username profile')
//       .sort({ createdAt: -1 });
//     res.status(200).json(properties);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch properties", error });
//   }
// };

// Get Agent's Properties
export const getAgentProperties = async (req, res) => {
  try {
    const properties = await Property.find({ agent: req.user.id })
      .sort({ createdAt: -1 });
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch properties", error });
  }
};


// Get All Properties
export const getAllProperties = async (req, res) => {
  // const status = req.query.status || 'active' || "sold" || "rented";


  try {
    const properties = await Property.find();
    // const properties = await Property.find({ status });
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