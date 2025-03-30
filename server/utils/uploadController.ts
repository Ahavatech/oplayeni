import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
//import { v2 as cloudinary } from 'cloudinary';
import cloudinary from './cloudinaryConfig';
import { storage } from '../storage';

interface UploadOptions {
  folder: string;
  resource_type?: 'image' | 'raw' | 'video' | 'auto';
}

const uploadFile = async (filePath: string, folder: string) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, { folder });
        return result.secure_url;
    } catch (error) {
        throw new Error(error.message);
    }
};


export { uploadFile };

export const uploadMedia = async (req: any, res: any) => {
    try {
  
      //console.log(req)
      if (!req.file) {
        return res.status(400).json({ ok: false, message: "No file uploaded" });
      }
  
  
  
      const userId = req.user.userId; // Authenticated user ID
      const resourceType = req.file.mimetype.startsWith("video") ? "video" : "image";
  
      // Upload to Cloudinary
      const fileUrl = await uploadFile(req.file.path, `layeni-${resourceType}-uploads`, resourceType);


      const material = await storage.createMaterial({
        courseId: req.params.courseId,
        title: req.body.title,
        type: req.body.type,
        fileUrl,
        submissionDate: req.body.type === 'assignment' && req.body.submissionDate ? new Date(req.body.submissionDate) : undefined
      });
  
      
      /*const mediaData = {
        title: req.body.title,
        caption: req.body.caption || null,
        location: req.body.location || null,
        people: req.body.people || null, // 
        creatorId: userId, // 
      };*/
  
      //let savedMedia;
  
      /*if (resourceType === "image") {
        savedMedia = await prisma.image.create({ data: { ...mediaData, imageUrl: fileUrl } });
      } else {
        savedMedia = await prisma.video.create({ data: { ...mediaData, videoUrl: fileUrl } });
      }*/
  
        res.status(201).json(material);
    } catch (error) {
      console.log("Error uploading file:", error);
      res.status(201).json({ ok: false, message: "Failed to upload file" });
    }
  };