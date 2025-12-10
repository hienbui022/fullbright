import { storage } from '../config/FirebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const UploadService = {
  // Upload file to Firebase Storage
  uploadFile: async (file, path) => {
    try {
      // Create storage reference
      const storageRef = ref(storage, path);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        success: true,
        url: downloadURL
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  // Upload profile image
  uploadProfileImage: async (userId, file) => {
    try {
      const path = `profile-images/${userId}/${file.name}`;
      return await UploadService.uploadFile(file, path);
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  },

  // Upload course thumbnail
  uploadCourseThumbnail: async (courseId, file) => {
    try {
      const path = `course-thumbnails/${courseId}/${file.name}`;
      return await UploadService.uploadFile(file, path);
    } catch (error) {
      console.error('Error uploading course thumbnail:', error);
      throw error;
    }
  }
}; 