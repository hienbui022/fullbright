import { useState, useEffect } from 'react';
import { NewsService } from '../services';
import { UploadService } from '../services/upload.service';
import Button from '../components/Common/Button';
import Card from '../components/Common/Card';
import Modal from '../components/Common/Modal';
import Alert from '../components/Common/Alert';
import { FaPlus, FaEdit, FaTrash, FaImage, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { Editor } from '@tinymce/tinymce-react';

// Custom Table component for News page
const NewsTable = ({
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

const News = () => {
  const { user } = useAuth(); // Get current user information
  // State for news data
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  
  // State for form
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: '',
    tags: [],
    imageUrl: '',
    isPublished: false
  });
  
  // State for image upload
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // State for notifications
  const [alert, setAlert] = useState({
    show: false,
    type: '',
    message: ''
  });
  
  // State for form errors
  const [errors, setErrors] = useState({});
  
  // Column configuration for table
  const columns = [
    { 
      key: 'imageUrl', 
      label: 'Image', 
      render: (row) => (
        <div className="w-16 h-16 relative">
          {row.imageUrl ? (
            <img
              src={row.imageUrl}
              alt={row.title}
              className="w-full h-full object-cover rounded"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/150?text=No+Image';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded">
              <FaImage className="text-gray-400" />
            </div>
          )}
        </div>
      )
    },
    { key: 'title', label: 'Title', sortable: true },
    { 
      key: 'category', 
      label: 'Category', 
      sortable: true,
      render: (row) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
          {row.category}
        </span>
      )
    },
    { 
      key: 'createdAt', 
      label: 'Created Date', 
      sortable: true,
      render: (row) => new Date(row.createdAt).toLocaleDateString('en-US')
    },
    { 
      key: 'viewCount', 
      label: 'Views', 
      sortable: true,
      render: (row) => row.viewCount || 0
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

  // Update useEffect to use pagination from API
  useEffect(() => {
    fetchNews();
  }, [currentPage, searchTerm]); // Add searchTerm to dependencies

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle search
  const handleSearch = async (e) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);
    setCurrentPage(1); // Reset to page 1 when searching
  };

  // Get news list
  const fetchNews = async () => {
    try {
      setIsLoading(true);
      const response = await NewsService.getAllNews({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm
      });
      
      setNews(response.data.news);
      setFilteredNews(response.data.news);
      setTotalItems(response.data.pagination.total);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching news:', error);
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Unable to load news list. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle creating new news
  const handleCreateNews = () => {
    setSelectedNews(null);
    setFormData({
      title: '',
      content: '',
      summary: '',
      category: '',
      tags: [],
      imageUrl: '',
      isPublished: false
    });
    setErrors({});
    setIsFormModalOpen(true);
  };

  // Handle editing news
  const handleEditNews = (news) => {
    setSelectedNews(news);
    setFormData({
      title: news.title,
      content: news.content,
      summary: news.summary || '',
      category: news.category,
      tags: news.tags || [],
      imageUrl: news.imageUrl || '',
      isPublished: news.isPublished
    });
    setImagePreview(news.imageUrl || '');
    setErrors({});
    setIsFormModalOpen(true);
  };

  // Handle deleting news
  const handleDeleteClick = (news) => {
    setSelectedNews(news);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete news
  const handleDeleteNews = async () => {
    if (!selectedNews) return;
    
    try {
      setIsLoading(true);
      await NewsService.deleteNews(selectedNews.id);
      
      setAlert({
        show: true,
        type: 'success',
        message: 'News deleted successfully!'
      });
      
      setIsDeleteModalOpen(false);
      fetchNews();
    } catch (error) {
      console.error('Error deleting news:', error);
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Unable to delete news. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle toggle publish
  const handleTogglePublish = async (news) => {
    try {
      setIsLoading(true);
      const updatedData = {
        ...news,
        isPublished: !news.isPublished,
        publishedAt: !news.isPublished ? new Date().toISOString() : null,
        createdBy: news.createdBy || user.id // Ensure createdBy is preserved or use current user ID
      };
      
      await NewsService.updateNews(news.id, updatedData);
      
      setAlert({
        show: true,
        type: 'success',
        message: updatedData.isPublished ? 'News has been published!' : 'News has been unpublished!'
      });
      
      fetchNews();
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
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        setAlert({
          show: true,
          type: 'error',
          message: 'File size must not exceed 2MB'
        });
        return;
      }

      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Update function to handle content change from editor
  const handleEditorChange = (content, editor, field) => {
    setFormData({
      ...formData,
      [field]: content
    });
    
    // Clear error when user types
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
      newErrors.title = 'Title cannot be empty';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content cannot be empty';
    }
    
    if (!formData.summary.trim()) {
      newErrors.summary = 'Summary cannot be empty';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category cannot be empty';
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
      
      let imageUrl = formData.imageUrl;
      
      // Upload image if new file is selected
      if (imageFile) {
        setIsUploading(true);
        try {
          const path = `news/${Date.now()}-${imageFile.name}`;
          const uploadResponse = await UploadService.uploadFile(imageFile, path);
          imageUrl = uploadResponse.url;
        } catch (error) {
          console.error('Error uploading image:', error);
          setAlert({
            show: true,
            type: 'error',
            message: 'Unable to upload image. Please try again.'
          });
          return;
        } finally {
          setIsUploading(false);
        }
      }
      
      // Prepare data to submit
      const dataToSubmit = {
        ...formData,
        imageUrl,
        createdBy: user.id
      };
      
      // If publishing, add publishedAt
      if (dataToSubmit.isPublished) {
        dataToSubmit.publishedAt = new Date().toISOString();
      }
      
      if (selectedNews) {
        await NewsService.updateNews(selectedNews.id, dataToSubmit);
        setAlert({
          show: true,
          type: 'success',
          message: 'News updated successfully!'
        });
      } else {
        await NewsService.createNews(dataToSubmit);
        setAlert({
          show: true,
          type: 'success',
          message: 'News created successfully!'
        });
      }
      
      setIsFormModalOpen(false);
      setImageFile(null);
      setImagePreview('');
      fetchNews();
    } catch (error) {
      console.error('Error saving news:', error);
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Unable to save news. Please try again later.'
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
      onClick: () => handleEditNews(row)
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

  // Render news form
  const renderNewsForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Image upload section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Cover Image</label>
        <div className="flex justify-center">
          {imagePreview ? (
            <div className="relative group">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="h-48 w-auto object-cover rounded"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview('');
                    setFormData({...formData, imageUrl: ''});
                  }}
                  className="text-white p-2 rounded-full hover:bg-red-500"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ) : (
            <div className="h-48 w-full bg-gray-100 flex flex-col items-center justify-center rounded border-2 border-dashed border-gray-300">
              <FaImage className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">No image</span>
            </div>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="mt-1 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-indigo-50 file:text-indigo-700
            hover:file:bg-indigo-100"
        />
        <p className="text-xs text-gray-500">Supported formats: JPG, PNG. Max 2MB.</p>
      </div>

      {/* Other form fields */}
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
        <label className="block text-sm font-medium text-gray-700">Summary</label>
        <Editor
          apiKey="oducrvb3a7ndeljpciy4zm29ohdf7ynkgw0rfwm1ezlu44tq"
          value={formData.summary}
          init={{
            height: 150,
            menubar: false,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'charmap',
              'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'wordcount'
            ],
            toolbar: 'undo redo | blocks | ' +
              'bold italic | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist | ' +
              'removeformat',
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
          }}
          onEditorChange={(content, editor) => handleEditorChange(content, editor, 'summary')}
        />
        {errors.summary && <p className="mt-1 text-sm text-red-600">{errors.summary}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Content</label>
        <Editor
          apiKey="oducrvb3a7ndeljpciy4zm29ohdf7ynkgw0rfwm1ezlu44tq"
          value={formData.content}
          init={{
            height: 400,
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
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="">Select category</option>
          <option value="news">News</option>
          <option value="events">Events</option>
          <option value="announcements">Announcements</option>
          <option value="tutorials">Tutorials</option>
        </select>
        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
        <input
          type="text"
          name="tags"
          value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''}
          onChange={(e) => {
            const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
            setFormData({
              ...formData,
              tags: tagsArray
            });
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      
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
          onClick={() => {
            setIsFormModalOpen(false);
            setImageFile(null);
            setImagePreview('');
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
          {isLoading || isUploading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isUploading ? 'Uploading image...' : 'Saving...'}
            </>
          ) : (
            selectedNews ? 'Update' : 'Create'
          )}
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
        title="News Management"
        subtitle="View and manage all news in the system"
        headerAction={
          <Button
            variant="primary"
            icon={<FaPlus />}
            onClick={handleCreateNews}
          >
            Add News
          </Button>
        }
      >
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search news..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <NewsTable
          columns={columns}
          data={news}
          actions={actions}
          isLoading={isLoading}
          emptyMessage="No news found"
          pagination={{
            currentPage,
            totalPages,
            totalItems,
            itemsPerPage
          }}
          onPageChange={handlePageChange}
        />
      </Card>
      
      {/* News form modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setImageFile(null);
          setImagePreview('');
        }}
        title={selectedNews ? 'Edit News' : 'Add New News'}
        size="lg"
      >
        {renderNewsForm()}
      </Modal>
      
      {/* Delete confirmation modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this news?</p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteNews}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default News; 