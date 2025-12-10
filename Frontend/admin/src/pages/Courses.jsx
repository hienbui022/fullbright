import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaImage, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import Table from '../components/Common/Table';
import Button from '../components/Common/Button';
import Card from '../components/Common/Card';
import Modal from '../components/Common/Modal';
import Alert from '../components/Common/Alert';
import { CourseService } from '../services';
import { UploadService } from '../services/upload.service';
import { Editor } from '@tinymce/tinymce-react';

// Component Table tùy chỉnh cho trang Courses
const CourseTable = ({
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

// Tạo CategoryService tạm thời
const CategoryService = {
  getAllCategories: async () => {
    try {
      // Trả về danh sách categories mẫu
      return {
        data: {
          categories: [
            { id: 1, name: 'Tiếng Anh cơ bản' },
            { id: 2, name: 'Tiếng Anh giao tiếp' },
            { id: 3, name: 'Tiếng Anh thương mại' },
            { id: 4, name: 'Tiếng Anh học thuật' },
            { id: 1, name: 'Basic English' },
            { id: 2, name: 'Conversational English' },
            { id: 3, name: 'Business English' },
            { id: 4, name: 'Academic English' }
          ]
        }
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
};

const Courses = () => {
  // State for courses data
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage] = useState(10);
  
  // State for modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // State for form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    level: 'beginner',
    duration: 0,
    category: '',
    isPublished: false,
    skills: [],
    topics: [],
    thumbnail: ''
  });
  
  // State for alerts
  const [alert, setAlert] = useState({
    show: false,
    type: '',
    message: ''
  });
  
  // State for categories
  const [categories, setCategories] = useState([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  
  // State for errors
  const [errors, setErrors] = useState({});
  
  // State for search debounce
  const [searchTimeout, setSearchTimeout] = useState(null);
  
  // Add state for image upload
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Table columns configuration
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
    { 
      key: 'title', 
      label: 'Course Name', 
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{row.title}</span>
          <span className="text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: row.description.length > 100 ? row.description.substring(0, 100) + '...' : row.description }}></span>
        </div>
      )
    },
    { 
      key: 'creator', 
      label: 'Creator', 
      sortable: true,
      render: (row) => row.creator ? row.creator.fullName : 'Unknown'
    },
    { 
      key: 'level', 
      label: 'Level', 
      sortable: true,
      render: (row) => {
        const levelMap = {
          'beginner': 'Beginner',
          'intermediate': 'Intermediate',
          'advanced': 'Advanced'
        };
        return levelMap[row.level] || row.level;
      }
    },
    { 
      key: 'price', 
      label: 'Price (VND)', 
      sortable: true, 
      render: (row) => row.price.toLocaleString('en-US') 
    },
    { 
      key: 'duration', 
      label: 'Duration (hours)', 
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

  // Load courses and categories
  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, [currentPage]);

  // Fetch courses with search and pagination
  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await CourseService.getAllCourses({
        page: currentPage,
        limit: itemsPerPage
      });
      
      setCourses(response.data.courses);
      setFilteredCourses(response.data.courses);
      setTotalItems(response.data.pagination.total);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Unable to load courses list'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setIsCategoriesLoading(true);
      const response = await CategoryService.getAllCategories();
      setCategories(response.data.categories);
      setIsCategoriesLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Unable to load categories. Please try again later.'
      });
      setIsCategoriesLoading(false);
    }
  };

  // Handle search with local filtering
  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);
    
    if (!searchValue.trim()) {
      setFilteredCourses(courses);
      return;
    }

    const filtered = courses.filter(course => 
      course.title.toLowerCase().includes(searchValue) ||
      course.description.toLowerCase().includes(searchValue) ||
      course.level.toLowerCase().includes(searchValue) ||
      (course.skills && course.skills.some(skill => skill.toLowerCase().includes(searchValue))) ||
      (course.topics && course.topics.some(topic => topic.toLowerCase().includes(searchValue))) ||
      (course.creator && course.creator.fullName.toLowerCase().includes(searchValue))
    );

    setFilteredCourses(filtered);
    setCurrentPage(1);
  };

  // Calculate paginated data
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Update total pages based on filtered data
  useEffect(() => {
    setTotalPages(Math.ceil(filteredCourses.length / itemsPerPage));
    setTotalItems(filteredCourses.length);
  }, [filteredCourses, itemsPerPage]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCreateCourse = () => {
    setSelectedCourse(null);
    setFormData({
      title: '',
      description: '',
      price: 0,
      level: 'beginner',
      duration: 0,
      category: '',
      isPublished: false,
      skills: [],
      topics: [],
      thumbnail: ''
    });
    setIsFormModalOpen(true);
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      price: course.price,
      level: course.level,
      duration: course.duration,
      category: course.category,
      isPublished: course.isPublished,
      skills: course.skills || [],
      topics: course.topics || [],
      thumbnail: course.thumbnail || ''
    });
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (course) => {
    setSelectedCourse(course);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCourse = async () => {
    try {
      setIsLoading(true);
      await CourseService.deleteCourse(selectedCourse.id);
      
      setAlert({
        show: true,
        type: 'success',
        message: 'Course deleted successfully!'
      });
      
      setIsDeleteModalOpen(false);
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'An error occurred while deleting the course. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePublish = async (course) => {
    try {
      setIsLoading(true);
      await CourseService.publishCourse(course.id, !course.isPublished);
      
      setAlert({
        show: true,
        type: 'success',
        message: `Course has been ${course.isPublished ? 'unpublished' : 'published'} successfully!`
      });
      
      fetchCourses();
    } catch (error) {
      console.error('Error toggling course publish status:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Unable to change course status. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Handle skills and topics change
  const handleArrayInputChange = (e, field) => {
    const value = e.target.value;
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    
    setFormData({
      ...formData,
      [field]: items
    });
    
    // Clear error when field is edited
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
      newErrors.title = 'Course name cannot be empty';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description cannot be empty';
    }
    
    if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }
    
    if (formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }
    
    if (formData.skills.length === 0) {
      newErrors.skills = 'Skills cannot be empty';
    }
    
    if (formData.topics.length === 0) {
      newErrors.topics = 'Topics cannot be empty';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle thumbnail change
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setAlert({
          show: true,
          type: 'error',
          message: 'Image size cannot exceed 2MB'
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

  // Thêm hàm xử lý thay đổi nội dung từ editor
  const handleEditorChange = (content, editor) => {
    setFormData({
      ...formData,
      description: content
    });
    
    // Xóa lỗi khi người dùng nhập
    if (errors.description) {
      setErrors({
        ...errors,
        description: ''
      });
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Upload thumbnail if there's a new file
      let thumbnailUrl = formData.thumbnail;
      if (thumbnailFile) {
        setIsUploading(true);
        const uploadResult = await UploadService.uploadCourseThumbnail(
          selectedCourse?.id || 'new',
          thumbnailFile
        );
        thumbnailUrl = uploadResult.url;
        setIsUploading(false);
      }
      
      const courseData = {
        ...formData,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        thumbnail: thumbnailUrl
      };
      
      let response;
      
      if (selectedCourse) {
        response = await CourseService.updateCourse(selectedCourse.id, courseData);
      } else {
        response = await CourseService.createCourse(courseData);
      }
      
      if (response.success) {
        setAlert({
          show: true,
          type: 'success',
          message: 'Course updated successfully!'
        });
        
        // Reset thumbnail state
        setThumbnailFile(null);
        setThumbnailPreview('');
        
        // Refresh courses
        fetchCourses();
        setIsFormModalOpen(false);
      } else {
        setAlert({
          show: true,
          type: 'error',
          message: 'Unable to save course'
        });
      }
    } catch (error) {
      console.error('Error saving course:', error);
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Unable to save course'
      });
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  // Table actions
  const actions = (row) => [
    {
      icon: <FaEdit className="text-blue-500" />,
      label: 'Edit',
      onClick: () => handleEditCourse(row)
    },
    {
      icon: <FaTrash className="text-red-500" />,
      label: 'Delete',
      onClick: () => handleDeleteClick(row)
    },
    {
      icon: row.isPublished ? <FaToggleOff className="text-red-500" /> : <FaToggleOn className="text-green-500" />,
      label: row.isPublished ? 'Unpublish' : 'Publish',
      onClick: () => handleTogglePublish(row)
    }
  ];

  // Render course form
  const renderCourseForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Course Name</label>
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
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Price (VND)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
          {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
          {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
        </div>
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
          </select>
        </div>
        
        <div>
        <label className="block text-sm font-medium text-gray-700">Skills (comma separated)</label>
          <input
            type="text"
          value={formData.skills.join(', ')}
          onChange={(e) => handleArrayInputChange(e, 'skills')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="listening, speaking, reading, writing, grammar, vocabulary, pronunciation, communication"
            required
          />
        <p className="mt-1 text-xs text-gray-500">Example: listening, speaking, reading, writing</p>
        {errors.skills && <p className="mt-1 text-sm text-red-600">{errors.skills}</p>}
        </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Topics (comma separated)</label>
        <input
          type="text"
          value={formData.topics.join(', ')}
          onChange={(e) => handleArrayInputChange(e, 'topics')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="travel, business, academic, daily_communication"
          required
        />
        <p className="mt-1 text-xs text-gray-500">Example: travel, business, academic, daily_communication</p>
        {errors.topics && <p className="mt-1 text-sm text-red-600">{errors.topics}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Course Thumbnail</label>
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
            <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF tối đa 2MB</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setThumbnailFile(null);
            setThumbnailPreview('');
            setIsFormModalOpen(false);
          }}
          disabled={isLoading || isUploading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading || isUploading}
        >
          {isLoading || isUploading ? 'Saving...' : (selectedCourse ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
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
        title="Course Management"
        subtitle="View and manage all courses in the system"
        headerAction={
          <Button
            variant="primary"
            icon={<FaPlus />}
            onClick={handleCreateCourse}
          >
            Add Course
          </Button>
        }
      >
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <CourseTable
          columns={columns}
          data={paginatedCourses}
          actions={actions}
          isLoading={isLoading}
          emptyMessage="No courses available"
          pagination={{
            currentPage,
            totalPages,
            totalItems,
            itemsPerPage
          }}
          onPageChange={handlePageChange}
        />
      </Card>
      
      {/* Course Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedCourse ? 'Edit Course' : 'Add New Course'}
        size="lg"
      >
        {renderCourseForm()}
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="p-4">
          <p className="mb-4">Are you sure you want to delete the course "{selectedCourse?.title}"?</p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteCourse}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Courses; 