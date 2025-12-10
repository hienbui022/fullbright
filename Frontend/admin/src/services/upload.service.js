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
  },

  // --- Add functions for Flashcards --- 
  uploadFlashcardImage: async (flashcardId, file) => {
    try {
      // Generate a unique path, e.g., flashcard-images/<flashcardId>/<timestamp>-<originalName>
      const uniquePath = `flashcard-images/${flashcardId || 'new'}/${Date.now()}-${file.name}`;
      return await UploadService.uploadFile(file, uniquePath);
    } catch (error) {
      console.error('Error uploading flashcard image:', error);
      throw error;
    }
  },

  uploadFlashcardAudio: async (flashcardId, file) => {
    try {
       // Generate a unique path
      const uniquePath = `flashcard-audio/${flashcardId || 'new'}/${Date.now()}-${file.name}`;
      return await UploadService.uploadFile(file, uniquePath);
    } catch (error) {
      console.error('Error uploading flashcard audio:', error);
      throw error;
    }
  }
}; 