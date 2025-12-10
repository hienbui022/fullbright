import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaArrowLeft } from 'react-icons/fa';
import Table from '../components/Common/Table';
import Button from '../components/Common/Button';
import Card from '../components/Common/Card';
import Modal from '../components/Common/Modal';
import Alert from '../components/Common/Alert';
import { CourseService, LessonService } from '../services';
import { Editor } from '@tinymce/tinymce-react';

// Custom Table component for Lessons page
const LessonTable = ({
  columns,
  data,
  actions,
  isLoading,
  emptyMessage,
  pagination,
  onPageChange
}) => {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc',
  });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = () => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
        </svg>
      );
    }
    
    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
      </svg>
    ) : (
      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    );
  };

  const renderPagination = () => {
    if (!pagination) return null;
    
    const { currentPage, totalPages } = pagination;
    
    return (
      <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Page <span className="font-medium">{currentPage}</span> / <span className="font-medium">{totalPages}</span>
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                &laquo; Previous
              </button>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Next &raquo;
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                  {column.sortable && renderSortIcon(column.key)}
                </div>
              </th>
            ))}
            {actions && <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-4 text-center">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
                <p className="text-gray-500 mt-2">Loading data...</p>
              </td>
            </tr>
          ) : sortedData().length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-4 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData().map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className="hover:bg-gray-50"
              >
                {columns.map((column) => (
                  <td key={`${row.id || rowIndex}-${column.key}`} className="px-6 py-4 whitespace-nowrap">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                      {actions(row).map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          onClick={action.onClick}
                          className="p-1 rounded hover:bg-gray-100"
                          title={action.label}
                        >
                          {action.icon}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {renderPagination()}
    </div>
  );
};

const Lessons = () => {
  // State for lessons data
  const [lessons, setLessons] = useState([]);
  const [filteredLessons, setFilteredLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage] = useState(10);
  
  // State for courses data (for dropdown)
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  
  // State for modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  
  // State for form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    courseId: '',
    order: 0,
    duration: 0,
    isPublished: false,
    contentType: 'text'
  });
  
  // State for alerts
  const [alert, setAlert] = useState({
    show: false,
    type: '',
    message: ''
  });
  
  // State for errors
  const [errors, setErrors] = useState({});
  
  // Table columns configuration
  const columns = [
    { key: 'title', label: 'Lesson Name', sortable: true },
    { 
      key: 'course', 
      label: 'Course', 
      sortable: true,
      render: (row) => row.course ? row.course.title : 'Uncategorized'
    },
    { 
      key: 'contentType', 
      label: 'Content Type', 
      sortable: true,
      render: (row) => {
        const contentTypeMap = {
          'text': 'Text',
          'video': 'Video',
          'document': 'Document',
        };
        return contentTypeMap[row.contentType] || 'Unknown';
      }
    },
    { 
      key: 'order', 
      label: 'Order', 
      sortable: true 
    },
    { 
      key: 'duration', 
      label: 'Duration (min)', 
      sortable: true 
    },
    { 
      key: 'isPublished', 
      label: 'Status', 
      sortable: true,
      render: (row) => row.isPublished ? 
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Published</span> : 
        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Draft</span> 
    },
    { 
      key: 'createdAt', 
      label: 'Created Date', 
      sortable: true,
      render: (row) => new Date(row.createdAt).toLocaleDateString('en-US') 
    }
  ];
  
  // Load courses and lessons
  useEffect(() => {
    fetchCourses();
    fetchLessons();
  }, [currentPage, searchTerm, selectedCourseId]);
  
  // Fetch courses for dropdown
  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await CourseService.getAllCourses();
      
      // Check data structure returned
      const coursesData = response.data?.courses || response.data || [];
      
      // Ensure data is an array
      const coursesArray = Array.isArray(coursesData) ? coursesData : [];
      
      setCourses(coursesArray);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Display error message
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Unable to load courses list. Please try again later.'
      });
      // Set empty data to avoid display errors
      setCourses([]);
      setIsLoading(false);
    }
  };
  
  // Fetch lessons with search and pagination
  const fetchLessons = async () => {
    try {
      setIsLoading(true);
      const response = await LessonService.getAllLessons({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        courseId: selectedCourseId || undefined
      });
      
      setLessons(response.data.lessons);
      setFilteredLessons(response.data.lessons);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Unable to load lessons list'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle search input change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  
  // Handle course filter change
  const handleCourseFilterChange = (e) => {
    setSelectedCourseId(e.target.value);
    setCurrentPage(1);
  };
  
  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  // Handle create new lesson
  const handleCreateLesson = () => {
    setSelectedLesson(null);
    setFormData({
      title: '',
      description: '',
      content: '',
      courseId: '',
      order: 0,
      duration: 0,
      isPublished: false,
      contentType: 'text'
    });
    setErrors({});
    setIsFormModalOpen(true);
  };
  
  // Handle edit lesson
  const handleEditLesson = (lesson) => {
    setSelectedLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || '',
      content: lesson.content || '',
      courseId: lesson.courseId || '',
      order: lesson.order || 0,
      duration: lesson.duration || 0,
      isPublished: lesson.isPublished || false,
      contentType: lesson.contentType || 'text'
    });
    setErrors({});
    setIsFormModalOpen(true);
  };
  
  // Handle delete lesson
  const handleDeleteLesson = (lesson) => {
    setSelectedLesson(lesson);
    setIsDeleteModalOpen(true);
  };
  
  // Confirm delete lesson
  const confirmDeleteLesson = async () => {
    if (!selectedLesson) return;
    
    try {
      setIsLoading(true);
      await LessonService.deleteLesson(selectedLesson.id);
      
      setAlert({
        show: true,
        type: 'success',
        message: 'Lesson deleted successfully!'
      });
      
      setIsDeleteModalOpen(false);
      fetchLessons();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Unable to delete lesson. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle preview lesson
  const handlePreviewLesson = (lesson) => {
    setSelectedLesson(lesson);
    setIsPreviewModalOpen(true);
  };
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Add handler for content change from editor
  const handleEditorChange = (content, editor, field) => {
    setFormData({
      ...formData,
      [field]: content
    });
    
    // Clear errors when user inputs
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Lesson name cannot be empty';
    }
    
    if (!formData.courseId) {
      newErrors.courseId = 'Please select a course';
    }
    
    if (formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Lesson content cannot be empty';
    }
    
    if (!formData.contentType) {
      newErrors.contentType = 'Content type cannot be empty';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Prepare data to send
      const lessonData = {
        ...formData,
        // Ensure number fields are converted correctly
        duration: Number(formData.duration),
        order: Number(formData.order)
      };
      
      if (selectedLesson) {
        // Update existing lesson
        await LessonService.updateLesson(selectedLesson.id, lessonData);
        setAlert({
          show: true,
          type: 'success',
          message: 'Lesson updated successfully!'
        });
      } else {
        // Create new lesson
        await LessonService.createLesson(lessonData);
        setAlert({
          show: true,
          type: 'success',
          message: 'New lesson created successfully!'
        });
      }
      
      setIsFormModalOpen(false);
      fetchLessons();
    } catch (error) {
      console.error('Error saving lesson:', error);
      
      // Handle detailed error messages
      let errorMessage = 'Unable to save lesson. Please try again later.';
      
      if (error.response) {
        if (error.response.data && error.response.data.errors) {
          // Handle validation errors from server
          const serverErrors = error.response.data.errors;
          const errorMessages = serverErrors.map(err => `${err.msg} (${err.path})`).join(', ');
          errorMessage = `Error: ${errorMessages}`;
        } else if (error.response.data && error.response.data.message) {
          // Get error message from server
          errorMessage = error.response.data.message;
        }
      }
      
      setAlert({
        show: true,
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Table actions
  const actions = (row) => [
    {
      icon: <FaEye className="text-blue-500" />,
      label: 'Preview',
      onClick: () => handlePreviewLesson(row)
    },
    {
      icon: <FaEdit className="text-green-500" />,
      label: 'Edit',
      onClick: () => handleEditLesson(row)
    },
    {
      icon: <FaTrash className="text-red-500" />,
      label: 'Delete',
      onClick: () => handleDeleteLesson(row)
    }
  ];
  
  // Render lesson form
  const renderLessonForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Lesson Name</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.title ? 'border-red-500' : ''}`}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Course</label>
        <select
          name="courseId"
          value={formData.courseId}
          onChange={handleInputChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.courseId ? 'border-red-500' : ''}`}
        >
          <option value="">-- Select Course --</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>{course.title}</option>
          ))}
        </select>
        {errors.courseId && <p className="mt-1 text-sm text-red-600">{errors.courseId}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Order</label>
          <input
            type="number"
            name="order"
            value={formData.order}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.duration ? 'border-red-500' : ''}`}
          />
          {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Content Type</label>
          <select
            name="contentType"
            value={formData.contentType}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.contentType ? 'border-red-500' : ''}`}
          >
            <option value="text">Text</option>
            <option value="video">Video</option>
            <option value="document">Document</option>
          </select>
          {errors.contentType && <p className="mt-1 text-sm text-red-600">{errors.contentType}</p>}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <Editor
          apiKey="oducrvb3a7ndeljpciy4zm29ohdf7ynkgw0rfwm1ezlu44tq"
          value={formData.description}
          init={{
            height: 200,
            menubar: false,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'charmap',
              'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'wordcount'
            ],
            toolbar: 'undo redo | blocks | ' +
              'bold italic | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist | ' +
              'removeformat',
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
          }}
          onEditorChange={(content, editor) => handleEditorChange(content, editor, 'description')}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Content</label>
        <Editor
          apiKey="oducrvb3a7ndeljpciy4zm29ohdf7ynkgw0rfwm1ezlu44tq"
          value={formData.content}
          init={{
            height: 500,
            menubar: true,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | blocks | ' +
              'bold italic forecolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | help',
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
          }}
          onEditorChange={(content, editor) => handleEditorChange(content, editor, 'content')}
        />
        {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          name="isPublished"
          checked={formData.isPublished}
          onChange={handleInputChange}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-900">
          Publish immediately
        </label>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button
          variant="secondary"
          onClick={() => setIsFormModalOpen(false)}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : (selectedLesson ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  );
  
  // Render preview modal
  const renderPreviewModal = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{selectedLesson?.title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded">
        <div>
          <h3 className="font-medium mb-1 text-sm text-gray-500">Course</h3>
          <p>{selectedLesson?.course?.title || 'Uncategorized'}</p>
        </div>
        <div>
          <h3 className="font-medium mb-1 text-sm text-gray-500">Duration</h3>
          <p>{selectedLesson?.duration || 0} minutes</p>
        </div>
        <div>
          <h3 className="font-medium mb-1 text-sm text-gray-500">Content Type</h3>
          <p>{selectedLesson?.contentType === 'text' ? 'Text' : 
              selectedLesson?.contentType === 'video' ? 'Video' : 
              selectedLesson?.contentType === 'audio' ? 'Audio' : 
              selectedLesson?.contentType === 'document' ? 'Document' : 
              selectedLesson?.contentType === 'quiz' ? 'Quiz' : 
              'Unknown'}</p>
        </div>
      </div>
      
      {selectedLesson?.description && (
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-medium mb-2">Description:</h3>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedLesson.description }}></div>
        </div>
      )}
      
      <div className="border-t pt-4">
        <h3 className="font-medium mb-2">Content:</h3>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedLesson?.content }}></div>
      </div>
      
      <div className="flex justify-end">
        <Button
          variant="secondary"
          onClick={() => setIsPreviewModalOpen(false)}
        >
          Close
        </Button>
      </div>
    </div>
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      {alert.show && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ ...alert, show: false })}
          autoClose={true}
        />
      )}
      
      <Card
        title="Lesson Management"
        subtitle="View and manage all lessons in the system"
        headerAction={
          <Button
            variant="primary"
            icon={<FaPlus />}
            onClick={handleCreateLesson}
          >
            Add Lesson
          </Button>
        }
      >
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <select
              value={selectedCourseId}
              onChange={handleCourseFilterChange}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>
        </div>
        
        <LessonTable
          columns={columns}
          data={filteredLessons}
          actions={actions}
          isLoading={isLoading}
          emptyMessage="No lessons found"
          pagination={{
            currentPage,
            totalPages
          }}
          onPageChange={handlePageChange}
        />
      </Card>
      
      {/* Lesson Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedLesson ? 'Edit Lesson' : 'Add New Lesson'}
        size="lg"
      >
        {renderLessonForm()}
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="p-4">
          <p className="mb-4">Are you sure you want to delete lesson "{selectedLesson?.title}"?</p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDeleteLesson}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="Lesson Preview"
        size="lg"
      >
        {renderPreviewModal()}
      </Modal>
    </div>
  );
};

export default Lessons; 