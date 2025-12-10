// frontend/admin/src/pages/FlashcardsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash, FaImage, FaPlayCircle } from 'react-icons/fa'; // Using react-icons
import FlashcardService from '../services/flashcard.service';
import CourseService from '../services/course.service'; // Import CourseService
import LessonService from '../services/lesson.service'; // Import LessonService
import { UploadService } from '../services/upload.service'; // Import UploadService
import Table from '../components/Common/Table'; // Common Table component
import Button from '../components/Common/Button'; // Common Button component
import Card from '../components/Common/Card';   // Common Card component
import Modal from '../components/Common/Modal';   // Common Modal component
import Alert from '../components/Common/Alert';   // Common Alert component

const FlashcardsPage = () => {
    // --- States ---
    const [flashcards, setFlashcards] = useState([]);
    const [filteredFlashcards, setFilteredFlashcards] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage] = useState(10); // Can be taken from config or state
    const [searchTerm, setSearchTerm] = useState('');

    // State for select options
    const [coursesList, setCoursesList] = useState([]);
    const [lessonsList, setLessonsList] = useState([]);
    const [isCoursesLoading, setIsCoursesLoading] = useState(false);
    const [isLessonsLoading, setIsLessonsLoading] = useState(false);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedFlashcard, setSelectedFlashcard] = useState(null); // Flashcard currently selected for edit/delete

    const [formData, setFormData] = useState({
        term: '',
        definition: '',
        example: '',
        category: '',
        difficulty: '',
        courseId: '',
        lessonId: '',
        imageUrl: '', // Only store URL, file will be handled separately
        audioUrl: ''  // Only store URL, file will be handled separately
    });
    const [imageFile, setImageFile] = useState(null);
    const [audioFile, setAudioFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    const [alert, setAlert] = useState({ show: false, type: '', message: '' });
    const [errors, setErrors] = useState({});

    // --- Table Columns ---
    const columns = [
        {
            key: 'imageUrl',
            label: 'Image',
            render: (row) => (
                <div className="w-16 h-16 relative">
                    {row.imageUrl ? (
                        <img
                            src={row.imageUrl} // Ensure this URL is accessible
                            alt={row.term}
                            className="w-full h-full object-cover rounded-lg shadow-sm"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                            <FaImage className="w-8 h-8 text-gray-400" />
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'term',
            label: 'Term',
            sortable: true,
            render: (row) => <span className="font-medium text-gray-900">{row.term}</span>
        },
        {
            key: 'definition',
            label: 'Definition',
            sortable: true,
            render: (row) => <span className="text-sm text-gray-500 truncate max-w-xs">{row.definition}</span>
        },
        {
            key: 'category',
            label: 'Category',
            sortable: true,
            render: (row) => row.category || '-'
        },
        {
            key: 'difficulty',
            label: 'Difficulty',
            sortable: true,
            render: (row) => {
                const difficultyMap = { 'easy': 'Easy', 'medium': 'Medium', 'hard': 'Hard' };
                return difficultyMap[row.difficulty] || row.difficulty || '-';
            }
        },
        {
            key: 'audioUrl',
            label: 'Audio',
            render: (row) => row.audioUrl ? (
                <audio controls className="w-40 h-8">
                    <source src={row.audioUrl} type="audio/mpeg" />
                    <source src={row.audioUrl} type="audio/wav" />
                    <source src={row.audioUrl} type="audio/ogg" />
                    Browser does not support audio tag.
                </audio>
            ) : '-'
        },
         {
            key: 'createdAt',
            label: 'Created Date',
            sortable: true,
            render: (row) => new Date(row.createdAt).toLocaleDateString('en-US')
        }
    ];

    // --- Fetch Data ---
    const fetchFlashcards = useCallback(async (page = currentPage) => {
        setIsLoading(true);
        try {
            const response = await FlashcardService.getAllFlashcards({ page, limit: itemsPerPage });
            if (response.success && response.data) {
                setFlashcards(response.data.flashcards);
                setFilteredFlashcards(response.data.flashcards); // Update filtered list as well
                setTotalItems(response.data.pagination.total);
                setTotalPages(response.data.pagination.totalPages);
                setCurrentPage(response.data.pagination.page); // Update current page from response
            } else {
                setAlert({ show: true, type: 'error', message: response.message || 'Unable to load flashcards.' });
            }
        } catch (error) {
            const errMsg = error.response?.data?.message || error.message || 'An error occurred while loading flashcards.';
            setAlert({ show: true, type: 'error', message: errMsg });
            console.error("Fetch flashcards error:", error);
        } finally {
            setIsLoading(false);
        }
    }, [itemsPerPage, currentPage]); // Only depend on itemsPerPage and initial currentPage

    // Fetch Courses and Lessons for Selects
    const fetchSelectOptions = useCallback(async () => {
        setIsCoursesLoading(true);
        setIsLessonsLoading(true);
        try {
            const [coursesData, lessonsData] = await Promise.all([
                CourseService.getAllCoursesForSelect(),
                LessonService.getAllLessonsForSelect() // Get all lessons initially
            ]);
            setCoursesList(coursesData || []);
            setLessonsList(lessonsData || []);
        } catch (error) {
            setAlert({ show: true, type: 'error', message: 'Error loading data for dropdowns.' });
            console.error("Error fetching select options:", error);
        } finally {
            setIsCoursesLoading(false);
            setIsLessonsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFlashcards(1); // Fetch first page when component mounts
        fetchSelectOptions(); // Fetch data for dropdowns
    }, [fetchSelectOptions]); // Run when fetchSelectOptions changes (only once)

     // --- Search & Filter ---
     const handleSearch = (e) => {
        const searchValue = e.target.value.toLowerCase();
        setSearchTerm(searchValue);

        if (!searchValue.trim()) {
            setFilteredFlashcards(flashcards); // If search box is empty, show all
            setTotalPages(Math.ceil(flashcards.length / itemsPerPage));
            setCurrentPage(1); // Reset to first page
            return;
        }

        const filtered = flashcards.filter(card =>
            card.term.toLowerCase().includes(searchValue) ||
            card.definition.toLowerCase().includes(searchValue) ||
            (card.category && card.category.toLowerCase().includes(searchValue)) ||
            (card.example && card.example.toLowerCase().includes(searchValue))
        );

        setFilteredFlashcards(filtered);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage)); // Update total pages based on filtered results
        setCurrentPage(1); // Reset to first page when searching
    };

    // --- Pagination ---
    const handlePageChange = (page) => {
        // If search term exists, paginate on filtered data
        if (searchTerm) {
            setCurrentPage(page);
        } else {
            // If no search term, fetch data from server
            fetchFlashcards(page);
        }
    };

     // Calculate data to display for current page (for both search and non-search cases)
    const paginatedFlashcards = filteredFlashcards.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // --- Modal Handlers ---
    const handleOpenCreateModal = () => {
        setSelectedFlashcard(null);
        setFormData({
            term: '', definition: '', example: '', category: '', difficulty: '',
            courseId: '', lessonId: '', imageUrl: '', audioUrl: ''
        });
        setImageFile(null);
        setAudioFile(null);
        setImagePreview('');
        setErrors({});
        setIsFormModalOpen(true);
    };

    const handleOpenEditModal = (flashcard) => {
        setSelectedFlashcard(flashcard);
        setFormData({
            term: flashcard.term || '',
            definition: flashcard.definition || '',
            example: flashcard.example || '',
            category: flashcard.category || '',
            difficulty: flashcard.difficulty || '',
            courseId: flashcard.courseId || '',
            lessonId: flashcard.lessonId || '',
            imageUrl: flashcard.imageUrl || '',
            audioUrl: flashcard.audioUrl || ''
        });
        setImageFile(null); // Reset file input
        setAudioFile(null); // Reset file input
        setImagePreview(flashcard.imageUrl || ''); // Show existing image
        setErrors({});
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setSelectedFlashcard(null);
    };

    const handleDeleteClick = (flashcard) => {
        setSelectedFlashcard(flashcard);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedFlashcard(null);
    };

    // --- Form Handling ---
     const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        // Optional: If course is selected, filter lessons list?
        // if (name === 'courseId') {
        //     fetchLessonsForCourse(value); // This function needs to be created if you want to filter lessons by course
        // }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
             if (file.size > 2 * 1024 * 1024) { // 2MB limit
                setAlert({ show: true, type: 'error', message: 'Image size must not exceed 2MB.' });
                e.target.value = null; // Clear the input
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
             setErrors(prev => ({ ...prev, image: '' })); // Clear error
        } else {
             setImageFile(null);
             setImagePreview(selectedFlashcard?.imageUrl || ''); // Revert to existing or empty
        }
    };

    const handleAudioChange = (e) => {
        const file = e.target.files[0];
         if (file) {
             if (file.size > 5 * 1024 * 1024) { // 5MB limit
                 setAlert({ show: true, type: 'error', message: 'Audio size must not exceed 5MB.' });
                 e.target.value = null; // Clear the input
                 return;
             }
             setAudioFile(file);
              setErrors(prev => ({ ...prev, audio: '' })); // Clear error
        } else {
            setAudioFile(null);
        }
    };

    // --- Validation ---
     const validateForm = () => {
        const newErrors = {};
        if (!formData.term.trim()) newErrors.term = 'Term cannot be empty.';
        if (!formData.definition.trim()) newErrors.definition = 'Definition cannot be empty.';
        // Add other validations if needed (e.g.: category, difficulty)
         // if (!imageFile && !selectedFlashcard?.imageUrl) newErrors.image = 'Image cannot be empty.'; // Example image validation

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    // --- CRUD Operations ---
    const handleSave = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true); // Start loading
        let finalImageUrl = selectedFlashcard?.imageUrl || formData.imageUrl || '';
        let finalAudioUrl = selectedFlashcard?.audioUrl || formData.audioUrl || '';
        const flashcardIdForUpload = selectedFlashcard?.id || 'new'; // ID for upload path

        try {
            // Step 1: Upload new image if exists
            if (imageFile) {
                try {
                    const imgUploadResult = await UploadService.uploadFlashcardImage(flashcardIdForUpload, imageFile);
                    finalImageUrl = imgUploadResult.url; // Get URL from upload service
                    // Optional: Delete old image from storage here if needed and possible
                    // await UploadService.deleteFile(selectedFlashcard?.imageUrl); // Assuming deleteFile exists
                    setAlert({ show: true, type: 'info', message: 'Image uploaded successfully.' });
                } catch (uploadError) {
                    console.error("Image upload error:", uploadError);
                    setAlert({ show: true, type: 'error', message: `Image upload error: ${uploadError.message}` });
                    setIsLoading(false);
                    return; // Stop saving process if upload fails
                }
            }

            // Step 2: Upload new audio if exists
            if (audioFile) {
                try {
                    const audioUploadResult = await UploadService.uploadFlashcardAudio(flashcardIdForUpload, audioFile);
                    finalAudioUrl = audioUploadResult.url; // Get URL from upload service
                    // Optional: Delete old audio
                    // await UploadService.deleteFile(selectedFlashcard?.audioUrl);
                    setAlert({ show: true, type: 'info', message: 'Audio uploaded successfully.' });
                } catch (uploadError) {
                    console.error("Audio upload error:", uploadError);
                    setAlert({ show: true, type: 'error', message: `Audio upload error: ${uploadError.message}` });
                    setIsLoading(false);
                    return; // Stop saving process if upload fails
                }
            }

            // Step 3: Prepare data with final URLs
            const flashcardDataPayload = {
                term: formData.term,
                definition: formData.definition,
                example: formData.example,
                category: formData.category,
                difficulty: formData.difficulty,
                courseId: formData.courseId || null,
                lessonId: formData.lessonId || null,
                imageUrl: finalImageUrl, // Send the final URL
                audioUrl: finalAudioUrl  // Send the final URL
            };

            // Step 4: Create or Update Flashcard text data + URLs
            if (selectedFlashcard) {
                // Update
                await FlashcardService.updateFlashcard(selectedFlashcard.id, flashcardDataPayload);
                 setAlert({ show: true, type: 'success', message: 'Flashcard updated successfully!' });
            } else {
                 // Create
                await FlashcardService.createFlashcard(flashcardDataPayload);
                 setAlert({ show: true, type: 'success', message: 'Flashcard created successfully!' });
            }

            // Step 5: Close modal and refresh list
            handleCloseFormModal();
            fetchFlashcards(currentPage); // Fetch current page

        } catch (error) {
            // Handle errors from create/update API call
             const errMsg = error.response?.data?.message || error.message || 'Failed to save flashcard.';
             setAlert({ show: true, type: 'error', message: errMsg });
             console.error("Save flashcard error:", error);
        } finally {
            setIsLoading(false); // End loading
            // Reset file states after successful save or error
            setImageFile(null);
            setAudioFile(null);
            // Keep preview if needed or reset based on logic
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedFlashcard) return;
        setIsLoading(true);
        try {
            await FlashcardService.deleteFlashcard(selectedFlashcard.id);
            setAlert({ show: true, type: 'success', message: 'Flashcard deleted successfully!' });
            handleCloseDeleteModal();
            fetchFlashcards(); // Fetch from page 1 after deletion
        } catch (error) {
             const errMsg = error.response?.data?.message || error.message || 'Failed to delete flashcard.';
             setAlert({ show: true, type: 'error', message: errMsg });
             console.error("Delete flashcard error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Table Actions ---
    const tableActions = (row) => [
        {
            icon: <FaEdit className="text-blue-500" />,
            label: 'Edit',
            onClick: () => handleOpenEditModal(row)
        },
        {
            icon: <FaTrash className="text-red-500" />,
            label: 'Delete',
            onClick: () => handleDeleteClick(row)
        }
        // Add other actions if needed
    ];

    // --- Render Form ---
    const renderFlashcardForm = () => (
        <form onSubmit={handleSave} className="space-y-4">
            {/* Term Input */}
            <div>
                <label htmlFor="term" className="block text-sm font-medium text-gray-700">Term (*)</label>
                <input
                    type="text" id="term" name="term"
                    value={formData.term} onChange={handleInputChange} required
                    className={`mt-1 block w-full px-3 py-2 border ${errors.term ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                 />
                {errors.term && <p className="mt-1 text-sm text-red-600">{errors.term}</p>}
            </div>

            {/* Definition Input */}
            <div>
                <label htmlFor="definition" className="block text-sm font-medium text-gray-700">Definition (*)</label>
                <textarea
                    id="definition" name="definition" value={formData.definition}
                    onChange={handleInputChange} required rows="3"
                     className={`mt-1 block w-full px-3 py-2 border ${errors.definition ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                ></textarea>
                 {errors.definition && <p className="mt-1 text-sm text-red-600">{errors.definition}</p>}
            </div>

             {/* Example Input */}
             <div>
                <label htmlFor="example" className="block text-sm font-medium text-gray-700">Example</label>
                <textarea
                    id="example" name="example" value={formData.example}
                    onChange={handleInputChange} rows="2"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                ></textarea>
            </div>

            {/* Category & Difficulty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                    <input
                         type="text" id="category" name="category"
                        value={formData.category} onChange={handleInputChange}
                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                 <div>
                    <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">Difficulty</label>
                    <select
                         id="difficulty" name="difficulty" value={formData.difficulty}
                        onChange={handleInputChange}
                         className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                     >
                        <option value="">Select difficulty</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>
            </div>

            {/* Course & Lesson ID (Optional) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="courseId" className="block text-sm font-medium text-gray-700">Course (Optional)</label>
                    <select
                        id="courseId" name="courseId"
                        value={formData.courseId} onChange={handleInputChange}
                        disabled={isCoursesLoading}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                    >
                        <option value="">{isCoursesLoading ? 'Loading...' : '-- Select Course --'}</option>
                        {coursesList.map(course => (
                            <option key={course.id} value={course.id}>{course.title}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="lessonId" className="block text-sm font-medium text-gray-700">Lesson (Optional)</label>
                     <select
                        id="lessonId" name="lessonId"
                        value={formData.lessonId} onChange={handleInputChange}
                        disabled={isLessonsLoading}
                         className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                     >
                         <option value="">{isLessonsLoading ? 'Loading...' : '-- Select Lesson --'}</option>
                         {lessonsList
                            // Optional: Filter lessons based on selected courseId
                            // .filter(lesson => !formData.courseId || lesson.courseId === parseInt(formData.courseId))
                            .map(lesson => (
                                <option key={lesson.id} value={lesson.id}>{lesson.title} {lesson.courseId ? `(Course: ${coursesList.find(c=>c.id===lesson.courseId)?.title || lesson.courseId})` : ''}</option>
                         ))}
                     </select>
                     {/* Optional: Add a note if you want to filter lessons by course */} 
                     {/* <p className="mt-1 text-xs text-gray-500">Only show lessons belonging to selected course.</p> */} 
                 </div>
            </div>

            {/* Image Upload */}
             <div>
                 <label className="block text-sm font-medium text-gray-700">Illustration Image</label>
                <div className="mt-2 flex items-center space-x-4">
                    <div className={`w-24 h-24 relative rounded-lg overflow-hidden border ${errors.image ? 'border-red-500' : 'border-gray-300'}`}>
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover"/>
                        ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <FaImage className="w-8 h-8 text-gray-400" />
                            </div>
                        )}
                    </div>
                     <div>
                         <input
                            type="file" accept="image/*" onChange={handleImageChange}
                            className="hidden" id="image-upload"
                        />
                         <label
                            htmlFor="image-upload"
                             className={`cursor-pointer py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                         >
                            {selectedFlashcard?.imageUrl || imagePreview ? 'Change Image' : 'Choose Image'}
                         </label>
                        <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF max 2MB.</p>
                         {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
                     </div>
                 </div>
            </div>

             {/* Audio Upload */}
            <div>
                <label htmlFor="audio-upload" className="block text-sm font-medium text-gray-700">Audio File (Pronunciation)</label>
                 <input
                    type="file" id="audio-upload" name="audio" accept="audio/*"
                     onChange={handleAudioChange}
                     className={`mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100`}
                />
                 <p className="mt-1 text-xs text-gray-500">MP3, WAV, OGG max 5MB.</p>
                 {formData.audioUrl && !audioFile && (
                     <div className="mt-2">
                         <span className="text-sm text-gray-600 mr-2">Current audio:</span>
                         <audio controls src={formData.audioUrl} className="inline-block h-8">
                            Browser does not support audio.
                        </audio>
                     </div>
                 )}
                 {errors.audio && <p className="mt-1 text-sm text-red-600">{errors.audio}</p>}
             </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
                <Button
                     type="button" variant="secondary"
                     onClick={handleCloseFormModal}
                     disabled={isLoading}
                 >
                    Cancel
                </Button>
                <Button
                    type="submit" variant="primary"
                    disabled={isLoading}
                >
                    {isLoading ? 'Saving...' : (selectedFlashcard ? 'Update' : 'Create')}
                 </Button>
             </div>
        </form>
    );

    // --- Render ---
    return (
         <div className="container mx-auto px-4 py-8">
            {alert.show && (
                 <Alert
                    type={alert.type}
                    message={alert.message}
                     onClose={() => setAlert({ ...alert, show: false })}
                    autoClose={5000} // Auto close after 5s
                />
            )}

            <Card
                title="Flashcard Management"
                 subtitle="View, add, edit, delete flashcards in the system."
                 headerAction={
                    <Button variant="primary" icon={<FaPlus />} onClick={handleOpenCreateModal}>
                        Add Flashcard
                    </Button>
                }
            >
                 {/* Search Input */}
                 <div className="mb-4">
                     <input
                        type="text"
                        placeholder="Search terms, definitions, categories..."
                        value={searchTerm}
                         onChange={handleSearch}
                         className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                 </div>

                 {/* Flashcards Table */}
                <Table
                     columns={columns}
                     data={paginatedFlashcards} // Use paginated data
                     actions={tableActions}
                     isLoading={isLoading && !isFormModalOpen && !isDeleteModalOpen} // Only show table loading when not opening modal
                     emptyMessage="No flashcards found."
                     pagination={{
                         currentPage: currentPage,
                         totalPages: totalPages,
                         totalItems: searchTerm ? filteredFlashcards.length : totalItems // Update totalItems when searching
                     }}
                     onPageChange={handlePageChange}
                 />
            </Card>

             {/* Form Modal */}
             <Modal
                isOpen={isFormModalOpen}
                 onClose={handleCloseFormModal}
                 title={selectedFlashcard ? 'Edit Flashcard' : 'Add New Flashcard'}
                 size="xl"
             >
                 {renderFlashcardForm()}
            </Modal>

             {/* Delete Confirmation Modal */}
            <Modal
                 isOpen={isDeleteModalOpen}
                 onClose={handleCloseDeleteModal}
                title="Confirm Delete Flashcard"
                 size="sm"
             >
                 <div className="p-4">
                     <p className="mb-4 text-center">Are you sure you want to delete flashcard <br/> <strong className="text-red-600">{selectedFlashcard?.term}</strong>?</p>
                    <div className="flex justify-center space-x-3">
                         <Button variant="secondary" onClick={handleCloseDeleteModal}>
                             Cancel
                         </Button>
                         <Button variant="danger" onClick={handleConfirmDelete} disabled={isLoading}>
                             {isLoading ? 'Deleting...' : 'Confirm Delete'}
                        </Button>
                     </div>
                 </div>
             </Modal>
         </div>
    );
};

export default FlashcardsPage;
