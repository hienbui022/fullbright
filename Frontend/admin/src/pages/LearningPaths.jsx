import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LearningPathService from '../services/learningPath.service';
import { UploadService } from '../services/upload.service';
import Button from '../components/Common/Button';
import Card from '../components/Common/Card';
import Modal from '../components/Common/Modal';
import Alert from '../components/Common/Alert';
import { FaPlus, FaEdit, FaTrash, FaImage, FaToggleOn, FaToggleOff, FaList } from 'react-icons/fa';
import { Editor } from '@tinymce/tinymce-react';

// Custom Table component for Learning Paths page
const LearningPathTable = ({
  columns,
  data,
  actions,
  isLoading,
  emptyMessage,
  pagination,
  onPageChange,
}) => {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  // Handle sorting when clicking header
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort data
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

  // Render sort icon
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <span className="text-gray-300 ml-1">↕</span>;
    }
    return sortConfig.direction === 'asc' 
      ? <span className="text-gray-700 ml-1">↑</span> 
      : <span className="text-gray-700 ml-1">↓</span>;
  };

  // Render pagination
  const renderPagination = () => {
    if (!pagination) return null;
    
    const { currentPage, totalPages, totalItems, itemsPerPage } = pagination;
    
    if (totalItems === 0) return null;
    
    return (
      <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
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
    <div className="overflow-x-auto">
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
                <div className="flex items-center">
                  {column.label}
                  {column.sortable && renderSortIcon(column.key)}
                </div>
              </th>
            ))}
            {actions && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>}
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

const LearningPaths = () => {
  const { user } = useAuth();
  
  // State for learning path data
  const [learningPaths, setLearningPaths] = useState([]);
  const [filteredPaths, setFilteredPaths] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCoursesModalOpen, setIsCoursesModalOpen] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);
  
  // State for form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'beginner',
    targetAudience: '',
    estimatedDuration: '',
    courses: [],
    isPublished: false,
    thumbnail: ''
  });
  
  // State for image upload
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // State for notifications
  const [alert, setAlert] = useState({
    show: false,
    type: '',
    message: ''
  });
  
  // State for form errors
  const [errors, setErrors] = useState({});
  
  // State for list of courses that can be added to learning path
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  
  // Column configuration for table
  const columns = [
    { 
      key: 'thumbnail', 
      label: 'Image',
      render: (row) => (
        <div className="w-16 h-16 relative">
          {row.thumbnail ? (
            <img
              src={row.thumbnail}
              alt={row.title}
              className="w-full h-full object-cover rounded-lg shadow-sm"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/150?text=No+Image';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      )
    },
    { key: 'title', label: 'Title', sortable: true },
    { 
      key: 'level', 
      label: 'Level', 
      sortable: true,
      render: (row) => {
        const levelMap = {
          beginner: 'Beginner',
          intermediate: 'Intermediate',
          advanced: 'Advanced',
          all: 'All'
        };
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            {levelMap[row.level]}
          </span>
        );
      }
    },
    {
      key: 'courses',
      label: 'Courses',
      sortable: true,
      render: (row) => (row.courses && Array.isArray(row.courses) ? row.courses.length : 0)
    },
    {
      key: 'estimatedDuration',
      label: 'Duration (days)',
      sortable: true,
      render: (row) => row.estimatedDuration || 'N/A'
    },
    { 
      key: 'isPublished', 
      label: 'Status', 
      sortable: true,
      render: (row) => row.isPublished ? 
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Published</span> : 
        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Draft</span>
    }
  ];

  // Load learning paths when component mount or when page/search changes
  useEffect(() => {
    fetchLearningPaths();
  }, [currentPage, searchTerm]);

  // Get learning paths list
  const fetchLearningPaths = async () => {
    try {
      setIsLoading(true);
      const response = await LearningPathService.getAllLearningPaths({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm
      });
      
      setLearningPaths(response.data.learningPaths);
      setFilteredPaths(response.data.learningPaths);
      setTotalItems(response.data.pagination.total);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching learning paths:', error);
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Unable to load learning paths list. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle creating new learning path
  const handleCreatePath = async () => {
    try {
      // Fetch available courses first
      const response = await LearningPathService.getCoursesForPath();
      setAvailableCourses(response.data.courses);
      
      setSelectedPath(null);
      setFormData({
        title: '',
        description: '',
        level: 'beginner',
        targetAudience: '',
        estimatedDuration: '',
        courses: [],
        isPublished: false,
        thumbnail: ''
      });
      setThumbnailFile(null);
      setThumbnailPreview('');
      setSelectedCourses([]);
      setErrors({});
      setIsFormModalOpen(true);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Unable to load courses list. Please try again later.'
      });
    }
  };

  // Handle editing learning path
  const handleEditPath = async (path) => {
    try {
      // Fetch available courses first
      const response = await LearningPathService.getCoursesForPath();
      setAvailableCourses(response.data.courses);
      
      setSelectedPath(path);
      setFormData({
        title: path.title,
        description: path.description,
        level: path.level,
        targetAudience: path.targetAudience || '',
        estimatedDuration: path.estimatedDuration || '',
        courses: path.courses || [],
        isPublished: path.isPublished,
        thumbnail: path.thumbnail || ''
      });
      setThumbnailFile(null);
      setThumbnailPreview('');
      setSelectedCourses(path.courses || []);
      setErrors({});
      setIsFormModalOpen(true);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Unable to load courses list. Please try again later.'
      });
    }
  };

  // Handle deleting learning path
  const handleDeleteClick = (path) => {
    setSelectedPath(path);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete learning path
  const handleDeletePath = async () => {
    if (!selectedPath) return;
    
    try {
      setIsLoading(true);
      await LearningPathService.deleteLearningPath(selectedPath.id);
      
      setAlert({
        show: true,
        type: 'success',
        message: 'Learning path deleted successfully!'
      });
      
      setIsDeleteModalOpen(false);
      fetchLearningPaths();
    } catch (error) {
      console.error('Error deleting learning path:', error);
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Unable to delete learning path. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle toggle publish
  const handleTogglePublish = async (path) => {
    try {
      setIsLoading(true);
      const updatedData = {
        ...path,
        isPublished: !path.isPublished
      };
      
      await LearningPathService.updateLearningPath(path.id, updatedData);
      
      setAlert({
        show: true,
        type: 'success',
        message: updatedData.isPublished ? 'Learning path has been published!' : 'Learning path has been unpublished!'
      });
      
      fetchLearningPaths();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Unable to change publish status. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image change
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setAlert({
          show: true,
          type: 'error',
          message: 'Image size must not exceed 2MB'
        });
        return;
      }
      
      setThumbnailFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : 
              name === 'estimatedDuration' ? parseInt(value) || '' : 
              value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Add function to handle content change from editor
  const handleEditorChange = (content, editor) => {
    setFormData({
      ...formData,
      description: content
    });
    
    // Clear error when user types
    if (errors.description) {
      setErrors({
        ...errors,
        description: ''
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title cannot be empty';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description cannot be empty';
    }
    
    if (!formData.level) {
      newErrors.level = 'Level cannot be empty';
    }

    if (formData.estimatedDuration && (!Number.isInteger(formData.estimatedDuration) || formData.estimatedDuration <= 0)) {
      newErrors.estimatedDuration = 'Estimated duration must be a positive integer';
    }

    if (!formData.courses || formData.courses.length === 0) {
      newErrors.courses = 'Please select at least one course';
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
      setIsUploading(true);
      
      // Upload thumbnail if there's a new file
      let thumbnailUrl = formData.thumbnail;
      if (thumbnailFile) {
        const uploadResult = await UploadService.uploadFile(
          thumbnailFile,
          `learning-paths/${selectedPath?.id || 'new'}/${thumbnailFile.name}`
        );
        thumbnailUrl = uploadResult.url;
      }
      
      // Prepare data for API
      const apiData = {
        title: formData.title,
        description: formData.description,
        level: formData.level,
        targetAudience: formData.targetAudience,
        estimatedDuration: parseInt(formData.estimatedDuration) || 0,
        courses: selectedCourses,
        isPublished: formData.isPublished,
        thumbnail: thumbnailUrl,
        createdBy: user.id
      };
      
      if (selectedPath) {
        await LearningPathService.updateLearningPath(selectedPath.id, apiData);
        setAlert({
          show: true,
          type: 'success',
          message: 'Learning path updated successfully!'
        });
      } else {
        await LearningPathService.createLearningPath(apiData);
        setAlert({
          show: true,
          type: 'success',
          message: 'Learning path created successfully!'
        });
      }
      
      setIsFormModalOpen(false);
      fetchLearningPaths();
    } catch (error) {
      console.error('Error saving learning path:', error);
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Unable to save learning path. Please try again later.'
      });
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  // Handle course checkbox change
  const handleCourseChange = (courseId, checked) => {
    const newSelectedCourses = checked 
      ? [...selectedCourses, courseId]
      : selectedCourses.filter(id => id !== courseId);
    
    setSelectedCourses(newSelectedCourses);
    setFormData(prev => ({
      ...prev,
      courses: newSelectedCourses
    }));
  };

  // Render course selection section in form
  const renderCourseSelection = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Select Courses</label>
      <div className="max-h-48 overflow-y-auto border rounded-md p-4">
        {availableCourses.map(course => (
          <div key={course.id} className="flex items-center space-x-3 py-2">
            <input
              type="checkbox"
              checked={selectedCourses.includes(course.id)}
              onChange={(e) => handleCourseChange(course.id, e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <h4 className="text-sm font-medium text-gray-900">{course.title}</h4>
              <p className="text-sm text-gray-500">{course.description}</p>
            </div>
          </div>
        ))}
      </div>
      {errors.courses && <p className="mt-1 text-sm text-red-600">{errors.courses}</p>}
    </div>
  );

  // Table actions
  const actions = (row) => [
    {
      icon: <FaEdit className="text-blue-500" />,
      label: 'Edit',
      onClick: () => handleEditPath(row)
    },
    {
      icon: <FaTrash className="text-red-500" />,
      label: 'Delete',
      onClick: () => handleDeleteClick(row)
    },
    {
      icon: <FaList className="text-green-500" />,
      label: 'Manage Courses',
      onClick: () => handleOpenCoursesModal(row)
    },
    {
      icon: row.isPublished ? <FaToggleOff className="text-red-500" /> : <FaToggleOn className="text-green-500" />,
      label: row.isPublished ? 'Unpublish' : 'Publish',
      onClick: () => handleTogglePublish(row)
    }
  ];

  // Handle opening courses management modal
  const handleOpenCoursesModal = async (path) => {
    try {
      setIsLoading(true);
      setSelectedPath(path);
      
      // Get list of courses that can be added to learning path
      const response = await LearningPathService.getCoursesForPath();
      setAvailableCourses(response.data.courses);
      
      // Set selected courses
      setSelectedCourses(path.courses || []);
      
      setIsCoursesModalOpen(true);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Unable to load courses list. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle saving courses list
  const handleSaveCourses = async () => {
    try {
      setIsLoading(true);
      
      await LearningPathService.updateLearningPath(selectedPath.id, {
        ...selectedPath,
        courses: selectedCourses
      });
      
      setAlert({
        show: true,
        type: 'success',
        message: 'Courses list updated successfully!'
      });
      
      setIsCoursesModalOpen(false);
      fetchLearningPaths();
    } catch (error) {
      console.error('Error saving courses:', error);
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Unable to save courses list. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render learning path form
  const renderPathForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Cover Image</label>
        <div className="mt-2 flex items-center space-x-4">
          <div className="w-32 h-32 relative rounded-lg overflow-hidden border border-gray-300">
            {(thumbnailPreview || formData.thumbnail) ? (
              <img
                src={thumbnailPreview || formData.thumbnail}
                alt="Thumbnail preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150?text=Invalid+URL';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="hidden"
              id="thumbnail-upload"
            />
            <label
              htmlFor="thumbnail-upload"
              className="cursor-pointer py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isUploading ? 'Uploading...' : 'Choose Image'}
            </label>
            <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF max 2MB</p>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <Editor
          apiKey="oducrvb3a7ndeljpciy4zm29ohdf7ynkgw0rfwm1ezlu44tq"
          value={formData.description}
          init={{
            height: 300,
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
          onEditorChange={handleEditorChange}
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Level</label>
        <select
          name="level"
          value={formData.level}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="all">All</option>
        </select>
        {errors.level && <p className="mt-1 text-sm text-red-600">{errors.level}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Target Audience</label>
        <input
          type="text"
          name="targetAudience"
          value={formData.targetAudience}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Estimated Duration (days)</label>
        <input
          type="number"
          name="estimatedDuration"
          value={formData.estimatedDuration}
          onChange={handleInputChange}
          min="1"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {renderCourseSelection()}
      
      <div className="flex items-center">
        <input
          type="checkbox"
          name="isPublished"
          checked={formData.isPublished}
          onChange={handleInputChange}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label className="ml-2 block text-sm text-gray-900">Publish immediately</label>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setIsFormModalOpen(false)}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : (selectedPath ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  );

  // Render courses management modal
  const renderCoursesModal = () => (
    <div className="space-y-4">
      <div className="max-h-96 overflow-y-auto">
        {availableCourses.map(course => (
          <div key={course.id} className="flex items-center space-x-3 py-2">
            <input
              type="checkbox"
              checked={selectedCourses.includes(course.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedCourses([...selectedCourses, course.id]);
                } else {
                  setSelectedCourses(selectedCourses.filter(id => id !== course.id));
                }
              }}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <h4 className="text-sm font-medium text-gray-900">{course.title}</h4>
              <p className="text-sm text-gray-500">{course.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          variant="secondary"
          onClick={() => setIsCoursesModalOpen(false)}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSaveCourses}
          disabled={isLoading}
        >
          Save Changes
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
        title="Learning Path Management"
        subtitle="View and manage all learning paths in the system"
        headerAction={
          <Button
            variant="primary"
            icon={<FaPlus />}
            onClick={handleCreatePath}
          >
            Add Learning Path
          </Button>
        }
      >
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search learning paths..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <LearningPathTable
          columns={columns}
          data={filteredPaths}
          actions={actions}
          isLoading={isLoading}
          emptyMessage="No learning paths found"
          pagination={{
            currentPage,
            totalPages,
            totalItems,
            itemsPerPage
          }}
          onPageChange={handlePageChange}
        />
      </Card>
      
      {/* Learning path form modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setThumbnailFile(null);
          setThumbnailPreview('');
        }}
        title={selectedPath ? 'Edit Learning Path' : 'Add New Learning Path'}
        size="lg"
      >
        {renderPathForm()}
      </Modal>
      
      {/* Delete confirmation modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this learning path?</p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeletePath}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Courses management modal */}
      <Modal
        isOpen={isCoursesModalOpen}
        onClose={() => setIsCoursesModalOpen(false)}
        title="Manage Courses in Learning Path"
        size="lg"
      >
        {renderCoursesModal()}
      </Modal>
    </div>
  );
};

export default LearningPaths;
