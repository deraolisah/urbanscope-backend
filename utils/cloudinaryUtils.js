import cloudinary from "../config/cloudinary.js";

// Upload multiple images to Cloudinary
// export const uploadImagesToCloudinary = async (imageFiles) => {
//   try {
//     const imageUrls = [];

//     for (const file of imageFiles) {
//       const result = await new Promise((resolve, reject) => {
//         cloudinary.uploader.upload_stream(
//           { folder: "niarobi-properties" },
//           (error, result) => {
//             if (error) reject(error);
//             else resolve(result);
//           }
//         ).end(file.buffer);
//       });
//       imageUrls.push(result.secure_url);
//     }


//     return imageUrls;
//   } catch (error) {
//     console.error("Error uploading images to Cloudinary:", error);
//     throw new Error("Failed to upload images");
//   }
// };

// Delete images from Cloudinary when property is deleted
export const deletePropertyImages = async (imageUrls) => {
  try {
    const deletePromises = imageUrls.map(async (imageUrl) => {
      // Extract public_id from Cloudinary URL
      const publicId = imageUrl.split('/').pop().split('.')[0];
      const fullPublicId = `urban-scope/${publicId}`;
      
      return cloudinary.uploader.destroy(fullPublicId);
    });

    await Promise.all(deletePromises);
    console.log(`Successfully deleted ${imageUrls.length} images from Cloudinary`);
  } catch (error) {
    console.error('Error deleting images from Cloudinary:', error);
    throw error;
  }
};

// Parse amenities from request body
// export const parseAmenities = (amenities) => {
//   if (Array.isArray(amenities)) {
//     return amenities;
//   }
  
//   if (typeof amenities === 'string') {
//     try {
//       return JSON.parse(amenities);
//     } catch (error) {
//       // If it's a comma-separated string, split it
//       return amenities.split(',').map(item => item.trim());
//     }
//   }
  
//   return [];
// };