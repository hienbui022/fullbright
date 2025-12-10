import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ExerciseService, LessonService } from '../services';
import Button from '../components/Common/Button';
import Card from '../components/Common/Card';
import Modal from '../components/Common/Modal';
import Alert from '../components/Common/Alert';
import { FaPlus, FaEdit, FaTrash, FaList, FaToggleOn, FaToggleOff } from 'react-icons/fa';

// Custom Table component for Exercises page
const ExerciseTable = ({
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

  // Handle sorting when clicking on header
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

const Exercises = () => {
  const { user } = useAuth();
  
  // State for exercise data
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  
  // State for modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  
  // State for form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'multiple_choice',
    difficulty: 'easy',
    timeLimit: 0,
    passingScore: 0,
    isPublished: false,
    lessonId: ''
  });
  
  // State for alerts
  const [alert, setAlert] = useState({
    show: false,
    type: '',
    message: ''
  });
  
  // State for form errors
  const [errors, setErrors] = useState({});
  
  // State for lessons list
  const [lessons, setLessons] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState('');

  // State for question management
  const [questions, setQuestions] = useState([]);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
  const [questionFormData, setQuestionFormData] = useState({
    content: '',
    type: 'multiple_choice',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    explanation: '',
    points: 1
  });
  const [questionErrors, setQuestionErrors] = useState({});

  // Table column configuration
  const columns = [
    { key: 'title', label: 'Title', sortable: true },
    { 
      key: 'lesson', 
      label: 'Lesson', 
      sortable: true,
      render: (row) => row.lesson ? row.lesson.title : 'Unassigned'
    },
    { 
      key: 'type', 
      label: 'Type', 
      sortable: true,
      render: (row) => {
        const typeMap = {
          'multiple_choice': 'Multiple Choice',
          'fill_in_blank': 'Fill in the Blank',
          'matching': 'Matching',
          'reorder': 'Reorder',
          'essay': 'Essay'
        };
        return typeMap[row.type] || row.type;
      }
    },
    { 
      key: 'difficulty', 
      label: 'Difficulty', 
      sortable: true,
      render: (row) => {
        const difficultyMap = {
          'easy': 'Easy',
          'medium': 'Medium',
          'hard': 'Hard'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs
            ${row.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
              row.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'}`}>
            {difficultyMap[row.difficulty]}
          </span>
        );
      }
    },
    { 
      key: 'timeLimit', 
      label: 'Time (minutes)', 
      sortable: true 
    },
    { 
      key: 'passingScore', 
      label: 'Passing Score (%)', 
      sortable: true 
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

  // Load exercises and lessons when component mount
  useEffect(() => {
    fetchLessons();
    fetchExercises();
  }, [currentPage]);

  // Fetch lessons list
  const fetchLessons = async () => {
    try {
      const response = await LessonService.getAllLessons({
        page: 1,
        limit: 100 // Get all lessons to display in dropdown
      });
      setLessons(response.data.lessons);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Unable to load lessons list'
      });
    }
  };

  // Fetch exercises list with search and pagination
  const fetchExercises = async () => {
    try {
      setIsLoading(true);
      const response = await ExerciseService.getAllExercises({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        lessonId: selectedLessonId || undefined
      });
      
      setExercises(response.data.exercises);
      setFilteredExercises(response.data.exercises);
      setTotalItems(response.data.pagination.total);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Unable to load exercises list'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search with debounce
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Reset to page 1 when searching
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    
    // Clear old timeout if exists
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout
    const timeout = setTimeout(() => {
      fetchExercises();
    }, 500); // Debounce 500ms
    
    setSearchTimeout(timeout);
  };

  // Handle lesson filter
  const handleLessonFilter = (e) => {
    setSelectedLessonId(e.target.value);
    setCurrentPage(1);
    // Fetch exercises list again with new lessonId
    fetchExercises();
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle create new exercise
  const handleCreateExercise = () => {
    setSelectedExercise(null);
    setFormData({
      title: '',
      description: '',
      type: 'multiple_choice',
      difficulty: 'easy',
      timeLimit: 0,
      passingScore: 0,
      isPublished: false,
      lessonId: ''
    });
    setErrors({});
    setIsFormModalOpen(true);
  };

  // Handle edit exercise
  const handleEditExercise = (exercise) => {
    setSelectedExercise(exercise);
    setFormData({
      title: exercise.title,
      description: exercise.description || '',
      type: exercise.type,
      difficulty: exercise.difficulty,
      timeLimit: exercise.timeLimit || 0,
      passingScore: exercise.passingScore || 0,
      isPublished: exercise.isPublished,
      lessonId: exercise.lessonId || ''
    });
    setErrors({});
    setIsFormModalOpen(true);
  };

  // Handle delete exercise
  const handleDeleteClick = (exercise) => {
    setSelectedExercise(exercise);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete exercise
  const handleDeleteExercise = async () => {
    if (!selectedExercise) return;
    
    try {
      setIsLoading(true);
      await ExerciseService.deleteExercise(selectedExercise.id);
      
      setAlert({
        show: true,
        type: 'success',
        message: 'Exercise deleted successfully!'
      });
      
      setIsDeleteModalOpen(false);
      fetchExercises();
    } catch (error) {
      console.error('Error deleting exercise:', error);
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Unable to delete exercise. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle toggle publish
  const handleTogglePublish = async (exercise) => {
    try {
      setIsLoading(true);
      const updatedData = {
        ...exercise,
        isPublished: !exercise.isPublished
      };
      
      await ExerciseService.updateExercise(exercise.id, updatedData);
      
      setAlert({
        show: true,
        type: 'success',
        message: updatedData.isPublished ? 'Exercise has been published!' : 'Exercise has been unpublished!'
      });
      
      fetchExercises();
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

  // Fetch questions list for exercise
  const fetchQuestions = async (exerciseId) => {
    try {
      setQuestionLoading(true);
      const response = await ExerciseService.getQuestionsByExerciseId(exerciseId);
      if (response.data && response.data.questions) {
        setQuestions(response.data.questions);
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
              setAlert({
          show: true,
          type: 'error',
          message: error.response?.data?.message || 'Unable to load questions list'
        });
    } finally {
      setQuestionLoading(false);
    }
  };

  // Handle open questions management modal
  const handleOpenQuestionsModal = (exercise) => {
    setSelectedExercise(exercise);
    setIsQuestionsModalOpen(true);
    fetchQuestions(exercise.id);
  };

  // Handle create new question
  const handleCreateQuestion = () => {
    setCurrentQuestion(null);
    // Initialize form based on exercise type
    const initialOptions = selectedExercise.type === 'matching' 
      ? Array(4).fill().map(() => ({ text: '', match: '' }))
      : Array(4).fill().map(() => ({ text: '', isCorrect: false }));
    
    setQuestionFormData({
      content: '',
      type: selectedExercise.type,
      options: initialOptions,
      explanation: '',
      points: 1
    });
    setQuestionErrors({});
    setIsQuestionFormOpen(true);
  };

  // Handle edit question
  const handleEditQuestion = (question) => {
    setCurrentQuestion(question);
    setQuestionFormData({
      content: question.content,
      type: question.type || selectedExercise.type,
      options: question.options || [],
      explanation: question.explanation || '',
      points: question.points || 1
    });
    setQuestionErrors({});
    setIsQuestionFormOpen(true);
  };

  // Handle delete question
  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        setQuestionLoading(true);
        await ExerciseService.deleteQuestion(selectedExercise.id, questionId);
                  setAlert({
            show: true,
            type: 'success',
            message: 'Question deleted successfully!'
          });
        fetchQuestions(selectedExercise.id);
      } catch (error) {
        console.error('Error deleting question:', error);
                  setAlert({
            show: true,
            type: 'error',
            message: error.response?.data?.message || 'Unable to delete question. Please try again later.'
          });
      } finally {
        setQuestionLoading(false);
      }
    }
  };

  // Handle input change in question form
  const handleQuestionInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuestionFormData({
      ...questionFormData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when user types
    if (questionErrors[name]) {
      setQuestionErrors({
        ...questionErrors,
        [name]: ''
      });
    }
  };

  // Handle changes for question options
  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...questionFormData.options];
    
    if (field === 'isCorrect') {
      // Reset all to false first
      updatedOptions.forEach(option => option.isCorrect = false);
      updatedOptions[index].isCorrect = value;
    } else {
      updatedOptions[index][field] = value;
    }
    
    setQuestionFormData({
      ...questionFormData,
      options: updatedOptions
    });
  };

  // Add/remove options
  const handleAddOption = () => {
    const newOption = questionFormData.type === 'matching' 
      ? { text: '', match: '' }
      : { text: '', isCorrect: false };
    
    setQuestionFormData({
      ...questionFormData,
      options: [...questionFormData.options, newOption]
    });
  };

  const handleRemoveOption = (index) => {
    if (questionFormData.options.length <= 2) {
      setAlert({
        show: true,
        type: 'error',
        message: 'At least 2 options are required for a question'
      });
      return;
    }
    
    const updatedOptions = questionFormData.options.filter((_, i) => i !== index);
    setQuestionFormData({
      ...questionFormData,
      options: updatedOptions
    });
  };

  // Validate question form
  const validateQuestionForm = () => {
    const newErrors = {};
    
    if (!questionFormData.content.trim()) {
      newErrors.content = 'Question content cannot be empty';
    }
    
    // Validate options
    let hasCorrectAnswer = false;
    
    questionFormData.options.forEach((option, index) => {
      if (!option.text.trim()) {
        newErrors[`option_${index}`] = 'Option cannot be empty';
      }
      
      if (questionFormData.type === 'matching' && !option.match.trim()) {
        newErrors[`match_${index}`] = 'Need to enter matching content';
      }
      
      if (option.isCorrect) {
        hasCorrectAnswer = true;
      }
    });
    
    // Check for at least one correct answer (except for matching and reordering)
    if (['multiple_choice', 'fill_in_blank'].includes(questionFormData.type) && !hasCorrectAnswer) {
      newErrors.options = 'Must have at least one correct answer';
    }
    
    if (questionFormData.points <= 0) {
      newErrors.points = 'Points must be greater than 0';
    }
    
    setQuestionErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle question form submit
  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateQuestionForm()) {
      return;
    }
    
    try {
      setQuestionLoading(true);
      
      if (currentQuestion) {
        await ExerciseService.updateQuestion(selectedExercise.id, currentQuestion.id, questionFormData);
        setAlert({
          show: true,
          type: 'success',
          message: 'Question updated successfully!'
        });
      } else {
        await ExerciseService.addQuestion(selectedExercise.id, questionFormData);
        setAlert({
          show: true,
          type: 'success',
          message: 'Question added successfully!'
        });
      }
      
      setIsQuestionFormOpen(false);
      fetchQuestions(selectedExercise.id);
    } catch (error) {
      console.error('Error saving question:', error);
              setAlert({
          show: true,
          type: 'error',
          message: error.response?.data?.message || 'Unable to save question. Please try again later.'
        });
    } finally {
      setQuestionLoading(false);
    }
  };

  // Handle reorder questions
  const handleReorderQuestions = async (questionsOrder) => {
    try {
      setQuestionLoading(true);
      await ExerciseService.reorderQuestions(selectedExercise.id, questionsOrder);
      setAlert({
        show: true,
        type: 'success',
        message: 'Question order updated successfully!'
      });
      fetchQuestions(selectedExercise.id);
    } catch (error) {
      console.error('Error reordering questions:', error);
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Unable to update question order. Please try again later.'
      });
    } finally {
      setQuestionLoading(false);
    }
  };

  // Actions for table
  const actions = (row) => [
    {
      icon: <FaEdit className="text-blue-500" />,
      label: 'Edit',
      onClick: () => handleEditExercise(row)
    },
    {
      icon: <FaTrash className="text-red-500" />,
      label: 'Delete',
      onClick: () => handleDeleteClick(row)
    },
    {
      icon: <FaList className="text-green-500" />,
      label: 'Manage Questions',
      onClick: () => handleOpenQuestionsModal(row)
    },
    {
      icon: row.isPublished ? <FaToggleOff className="text-red-500" /> : <FaToggleOn className="text-green-500" />,
      label: row.isPublished ? 'Unpublish' : 'Publish',
      onClick: () => handleTogglePublish(row)
    }
  ];

  // QuestionManager component for question management modal
  const QuestionManager = () => {
    // Display according to question type
    const renderQuestionTypeLabel = (type) => {
              const typeMap = {
          'multiple_choice': 'Multiple Choice',
          'fill_in_blank': 'Fill in the Blank',
          'matching': 'Matching',
          'reorder': 'Reorder',
          'essay': 'Essay'
        };
      return typeMap[type] || type;
    };
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Question List</h3>
          <Button
            variant="primary"
            icon={<FaPlus />}
            onClick={handleCreateQuestion}
          >
                          Add Question
          </Button>
        </div>
        
        {questionLoading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : questions.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No questions yet. Create a new question!
          </div>
        ) : (
          <ul className="space-y-3">
            {questions.map((question, index) => (
              <li key={question.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center">
                      <span className="font-semibold mr-2">Question {index + 1}:</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {renderQuestionTypeLabel(question.type)}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">{question.points} points</span>
                    </div>
                    <p className="text-gray-800">{question.content}</p>
                    
                    {/* Display options */}
                    {question.options && question.options.length > 0 && (
                      <div className="mt-2 pl-4 space-y-1">
                        {question.type === 'matching' ? (
                          <div className="grid grid-cols-2 gap-2">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center">
                                <span className="mr-2">{option.text}</span>
                                <span className="text-gray-400">→</span>
                                <span className="ml-2">{option.match}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          question.options.map((option, optIndex) => (
                            <div 
                              key={optIndex} 
                              className={`flex items-center ${option.isCorrect ? 'font-medium text-green-600' : ''}`}
                            >
                              {option.isCorrect && <span className="mr-1">✓</span>}
                              <span>{option.text}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                    
                    {/* Display explanation if any */}
                    {question.explanation && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Explanation:</span> {question.explanation}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditQuestion(question)}
                      className="p-1 rounded hover:bg-gray-100"
                      title="Edit"
                    >
                      <FaEdit className="text-blue-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="p-1 rounded hover:bg-gray-100"
                      title="Delete"
                    >
                      <FaTrash className="text-red-500" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  // Render create/edit question form
  const renderQuestionForm = () => {
    return (
      <form onSubmit={handleQuestionSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Question Content</label>
          <textarea
            name="content"
            value={questionFormData.content}
            onChange={handleQuestionInputChange}
            rows="3"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
          {questionErrors.content && <p className="mt-1 text-sm text-red-600">{questionErrors.content}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Points</label>
          <input
            type="number"
            name="points"
            value={questionFormData.points}
            onChange={handleQuestionInputChange}
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {questionErrors.points && <p className="mt-1 text-sm text-red-600">{questionErrors.points}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
          {questionErrors.options && <p className="mt-1 text-sm text-red-600 mb-2">{questionErrors.options}</p>}
          
          <div className="space-y-3">
            {questionFormData.options.map((option, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="pt-2">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={option.isCorrect}
                    onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  {questionErrors[`option_${index}`] && (
                    <p className="mt-1 text-sm text-red-600">{questionErrors[`option_${index}`]}</p>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <FaTrash className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={handleAddOption}
            className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FaPlus className="mr-2 h-3 w-3" /> Add Option
          </button>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Answer Explanation (optional)</label>
          <textarea
            name="explanation"
            value={questionFormData.explanation}
            onChange={handleQuestionInputChange}
            rows="2"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsQuestionFormOpen(false)}
            disabled={questionLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={questionLoading}
          >
            {questionLoading ? 'Saving...' : (currentQuestion ? 'Update' : 'Create')}
          </Button>
        </div>
      </form>
    );
  };

  // Xử lý thay đổi input trong form bài tập
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

  // Validate exercise form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title cannot be empty';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description cannot be empty';
    }
    
    if (!formData.lessonId) {
      newErrors.lessonId = 'Please select a lesson';
    }
    
    if (formData.timeLimit < 0) {
      newErrors.timeLimit = 'Time limit cannot be negative';
    }
    
    if (formData.passingScore < 0 || formData.passingScore > 100) {
      newErrors.passingScore = 'Passing score must be between 0 and 100';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle exercise form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (selectedExercise) {
        await ExerciseService.updateExercise(selectedExercise.id, formData);
        setAlert({
          show: true,
          type: 'success',
          message: 'Exercise updated successfully!'
        });
      } else {
        await ExerciseService.createExercise(formData);
        setAlert({
          show: true,
          type: 'success',
          message: 'New exercise created successfully!'
        });
      }
      
      setIsFormModalOpen(false);
      fetchExercises();
    } catch (error) {
      console.error('Error saving exercise:', error);
              setAlert({
          show: true,
          type: 'error',
          message: error.response?.data?.message || 'Unable to save exercise. Please try again later.'
        });
    } finally {
      setIsLoading(false);
    }
  };

  // Render exercise form
  const renderExerciseForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows="3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Lesson</label>
        <select
          name="lessonId"
          value={formData.lessonId}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="">Select lesson</option>
          {lessons.map(lesson => (
            <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
          ))}
        </select>
        {errors.lessonId && <p className="mt-1 text-sm text-red-600">{errors.lessonId}</p>}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Difficulty</label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Time Limit (minutes)</label>
          <input
            type="number"
            name="timeLimit"
            value={formData.timeLimit}
            onChange={handleInputChange}
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.timeLimit && <p className="mt-1 text-sm text-red-600">{errors.timeLimit}</p>}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Passing Score (%)</label>
        <input
          type="number"
          name="passingScore"
          value={formData.passingScore}
          onChange={handleInputChange}
          min="0"
          max="100"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.passingScore && <p className="mt-1 text-sm text-red-600">{errors.passingScore}</p>}
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
          {isLoading ? 'Saving...' : (selectedExercise ? 'Update' : 'Create')}
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
        title="Exercise Management"
        subtitle="View and manage all exercises in the system"
        headerAction={
          <Button
            variant="primary"
            icon={<FaPlus />}
            onClick={handleCreateExercise}
          >
            Add Exercise
          </Button>
        }
      >
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <select
              value={selectedLessonId}
              onChange={handleLessonFilter}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Lessons</option>
              {lessons.map(lesson => (
                <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
              ))}
            </select>
          </div>
        </div>
        
        <ExerciseTable
          columns={columns}
          data={filteredExercises}
          actions={actions}
          isLoading={isLoading}
          emptyMessage="No exercises available"
          pagination={{
            currentPage,
            totalPages,
            totalItems,
            itemsPerPage
          }}
          onPageChange={handlePageChange}
        />
      </Card>
      
      {/* Modal form bài tập */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedExercise ? 'Edit Exercise' : 'Add New Exercise'}
        size="lg"
      >
        {renderExerciseForm()}
      </Modal>
      
      {/* Delete confirmation modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this exercise?</p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
                              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteExercise}
            >
                              Delete
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Question management modal */}
      <Modal
        isOpen={isQuestionsModalOpen}
        onClose={() => setIsQuestionsModalOpen(false)}
        title={`Question Management - ${selectedExercise?.title}`}
        size="xl"
      >
        <div className="p-4">
          <QuestionManager />
        </div>
      </Modal>

      {/* Create/edit question modal */}
      <Modal
        isOpen={isQuestionFormOpen}
        onClose={() => setIsQuestionFormOpen(false)}
        title={currentQuestion ? 'Edit Question' : 'Add New Question'}
        size="lg"
      >
        {renderQuestionForm()}
      </Modal>
    </div>
  );
};

export default Exercises; 