# API Integration Guide

This document provides instructions on how to use the API integration in the admin frontend.

## Environment Configuration

The API URL is configured in the `.env` file. By default, it points to `http://localhost:5000/api`. You can change this value to point to a different API endpoint if needed.

```
VITE_API_URL=http://localhost:5000/api
```

## Available Services

The following API services are available:

- `AuthService`: Authentication-related operations (login, logout, register, etc.)
- `UserService`: User management operations
- `CourseService`: Course management operations
- `LessonService`: Lesson management operations
- `LearningPathService`: Learning path management operations
- `NewsService`: News management operations
- `CommunityService`: Community management operations
- `LearningToolService`: Learning tool management operations
- `FlashcardService`: Flashcard management operations

## How to Use

1. Import the service you need:

```jsx
import { CourseService } from '../services';
```

2. Use the service methods:

```jsx
// Example: Get all courses
const fetchCourses = async () => {
  try {
    const response = await CourseService.getAllCourses();
    setCourses(response.data);
  } catch (error) {
    console.error('Error fetching courses:', error);
  }
};
```

## File Upload

For endpoints that require file uploads, the services automatically handle the conversion to FormData. Just pass the file as part of the data object:

```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const courseData = {
    title: 'New Course',
    description: 'Course description',
    thumbnail: fileInputRef.current.files[0] // File object
  };
  
  try {
    await CourseService.createCourse(courseData);
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

## Authentication

The API client automatically adds the authentication token to requests if the user is logged in. You don't need to manually add the token to each request.

## Error Handling

All service methods throw errors if the API request fails. Make sure to wrap your API calls in try-catch blocks to handle errors properly. 