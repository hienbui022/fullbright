import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    VStack,
    HStack,
    Heading,
    Text,
    Button,
    Progress,
    useToast,
    IconButton,
    Divider,
    Badge,
    Flex,
    Spinner,
    useColorModeValue,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    AspectRatio,
    Image,
    Grid,
    GridItem,
    List,
    ListItem,
    Icon,
    useDisclosure,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    Radio,
    RadioGroup,
    Stack,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Card,
    CardHeader,
    CardBody,
    CardFooter
} from '@chakra-ui/react';
import {
    FiChevronLeft,
    FiChevronRight,
    FiMoreVertical,
    FiCheck,
    FiClock,
    FiBookOpen,
    FiList,
    FiVideo,
    FiFileText,
    FiImage,
    FiMusic,
    FiLock,
    FiCheckCircle,
    FiCircle,
    FiMenu,
    FiEdit3,
    FiAward
} from 'react-icons/fi';
import LessonService from '../../apis/lesson.service';
import CourseService from '../../apis/course.service';
import ExerciseService from '../../apis/exercise.service';

const LoadingState = () => {
    const bgColor = useColorModeValue('gray.50', 'gray.900');
    
    return (
        <Box minH="100vh" bg={bgColor}>
            <Container maxW="container.xl" py={8}>
                <Flex justify="center" align="center" minH="60vh">
                    <Spinner
                        thickness="4px"
                        speed="0.65s"
                        emptyColor="gray.200"
                        color="blue.500"
                        size="xl"
                    />
                </Flex>
            </Container>
        </Box>
    );
};

const ContentTypeIcon = ({ type }) => {
    switch (type) {
        case 'video':
            return <Icon as={FiVideo} />;
        case 'audio':
            return <Icon as={FiMusic} />;
        case 'image':
            return <Icon as={FiImage} />;
        default:
            return <Icon as={FiFileText} />;
    }
};

// Helper function to decode HTML entities
const decodeHtmlEntities = (text) => {
    if (!text) return '';
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
};

const LessonContent = ({ lesson, borderColor }) => {
    const descriptionColor = useColorModeValue('gray.600', 'gray.400');
    const metadataColor = useColorModeValue('gray.500', 'gray.400');

    if (!lesson) return null;

    const renderContent = () => {
        switch (lesson.contentType) {
            case 'video':
                if (lesson.content) {
                    const decodedContent = decodeHtmlEntities(lesson.content);
                    if (decodedContent.includes('<iframe')) {
                        // Return AspectRatio directly
                        return (
                            <AspectRatio ratio={16 / 9} width="100%">
                                <Box
                                    dangerouslySetInnerHTML={{ __html: decodedContent }}
                                    position="absolute"
                                    top="0"
                                    left="0"
                                    width="100%"
                                    height="100%"
                                    sx={{
                                        '& iframe': {
                                            width: '100%',
                                            height: '100%',
                                            border: 'none'
                                        }
                                    }}
                                />
                            </AspectRatio>
                        );
                    } else {
                         // If content exists but not iframe, show as text (no VStack needed here directly)
                        return (
                            <Text whiteSpace="pre-wrap">
                                {decodedContent}
                            </Text>
                        );
                    }
                }
                return (
                    <Text color="gray.500">Video content is not available for this lesson.</Text>
                );

            case 'audio':
                if (lesson.audioUrl) {
                    return (
                        <VStack spacing={4} align="stretch">
                            <Box>
                                <audio controls style={{ width: '100%' }}>
                                    <source src={lesson.audioUrl} type="audio/mpeg" />
                                    Your browser does not support audio playback.
                                </audio>
                            </Box>
                            <Text whiteSpace="pre-wrap">
                                {decodeHtmlEntities(lesson.content)}
                            </Text>
                        </VStack>
                    );
                }
                return (
                    <VStack spacing={4} align="stretch">
                        <Text whiteSpace="pre-wrap">
                            {decodeHtmlEntities(lesson.content)}
                        </Text>
                    </VStack>
                );

            case 'image':
                return (
                    <VStack spacing={4} align="stretch">
                        {lesson.imageUrl && (
                            <Image
                                src={lesson.imageUrl}
                                alt={lesson.title}
                                maxH="500px"
                                objectFit="contain"
                                mx="auto" // Center image
                            />
                        )}
                        <Text whiteSpace="pre-wrap">
                           {decodeHtmlEntities(lesson.content)}
                        </Text>
                    </VStack>
                );

            default: // Treat as text/html content
                const decodedDefaultContent = decodeHtmlEntities(lesson.content);
                return (
                     /* Render content as HTML if it contains tags after decoding */
                    decodedDefaultContent && decodedDefaultContent.includes('<') ? (
                         <Box dangerouslySetInnerHTML={{ __html: decodedDefaultContent }} />
                    ) : (
                        <Text whiteSpace="pre-wrap">
                            {decodedDefaultContent}
                        </Text>
                    )
                );
        }
    };

    // Metadata rendering moved outside renderContent
    return (
        <Box>
            {renderContent()}
            <VStack mt={6} pt={6} borderTopWidth="1px" borderColor={borderColor} spacing={4} align="stretch">
                <HStack spacing={4} color={metadataColor}>
                    <Icon as={FiClock} />
                    <Text>{lesson.duration} minutes</Text>
                    <ContentTypeIcon type={lesson.contentType} />
                    <Text>{lesson.contentType === 'video' ? 'Video' : 
                          lesson.contentType === 'audio' ? 'Audio' : 
                          lesson.contentType === 'image' ? 'Image' : 'Reading'}</Text>
                </HStack>
                {lesson.description && (
                    /* Render description as HTML if it contains tags after decoding */
                    (() => {
                        const decodedDescription = decodeHtmlEntities(lesson.description);
                        // Use the descriptionColor variable defined at the top
                        return decodedDescription.includes('<') ? (
                            <Box color={descriptionColor} dangerouslySetInnerHTML={{ __html: decodedDescription }} />
                        ) : (
                            <Text color={descriptionColor}>
                               {decodedDescription}
                            </Text>
                        );
                    })()
                )}
            </VStack>
        </Box>
    );
};

const LessonListItem = ({ lesson, isActive, isCompleted, onClick }) => {
    const bgColor = useColorModeValue('gray.50', 'gray.700');
    const activeBgColor = useColorModeValue('blue.50', 'blue.900');
    const hoverBgColor = useColorModeValue('gray.100', 'gray.600');
    
    return (
        <ListItem
            p={3}
            cursor="pointer"
            bg={isActive ? activeBgColor : 'transparent'}
            _hover={{ bg: isActive ? activeBgColor : hoverBgColor }}
            borderRadius="md"
            onClick={onClick}
        >
            <HStack spacing={3}>
                <Icon
                    as={isCompleted ? FiCheckCircle : FiCircle}
                    color={isCompleted ? 'green.500' : 'gray.400'}
                />
                <VStack align="start" spacing={1} flex={1}>
                    <Text fontWeight={isActive ? "bold" : "normal"}>
                        {lesson.title}
                    </Text>
                    <HStack spacing={2} fontSize="sm" color="gray.500">
                        <ContentTypeIcon type={lesson.contentType} />
                        <Text>{lesson.duration} minutes</Text>
                    </HStack>
                </VStack>
            </HStack>
        </ListItem>
    );
};

const LessonList = ({ lessons = [], currentLessonId, onLessonClick }) => {
    return (
        <List spacing={2}>
            {lessons.map((lesson) => (
                <LessonListItem
                    key={lesson.id}
                    lesson={lesson}
                    isActive={lesson.id === parseInt(currentLessonId)}
                    isCompleted={lesson.isCompleted}
                    onClick={() => onLessonClick(lesson.id)}
                />
            ))}
        </List>
    );
};

// Exercise Question Component
const ExerciseQuestion = ({ question, selectedAnswers, setSelectedAnswers, isSubmitted, showCorrectAnswer }) => {
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    
    const handleAnswerChange = (value) => {
        const newAnswers = { ...selectedAnswers };
        
        // If exercise is submitted, don't allow changing answers
        if (isSubmitted) return;
        
        // Update selected answer
        question.options.forEach((option, index) => {
            if (index === parseInt(value)) {
                newAnswers[question.id] = {
                    optionIndex: index,
                    isCorrect: option.isCorrect
                };
            }
        });
        
        setSelectedAnswers(newAnswers);
    };
    
    // Determine if answer is correct (only show when submitted)
    const isAnswerCorrect = () => {
        if (!isSubmitted || !selectedAnswers[question.id]) return null;
        return selectedAnswers[question.id].isCorrect;
    };
    
    const getSelectedOptionIndex = () => {
        return selectedAnswers[question.id]?.optionIndex?.toString() || '';
    };
    
    return (
        <Card mb={6} shadow="sm" borderWidth="1px" borderColor={borderColor}>
            <CardHeader pb={2}>
                <Heading size="md">{question.content}</Heading>
            </CardHeader>
            
            <CardBody pt={0}>
                <RadioGroup value={getSelectedOptionIndex()} onChange={handleAnswerChange}>
                    <Stack spacing={3}>
                        {question.options?.map((option, index) => (
                            <Radio 
                                key={index} 
                                value={index.toString()}
                                isDisabled={isSubmitted}
                                colorScheme={
                                    isSubmitted && showCorrectAnswer && option.isCorrect ? "green" : 
                                    isSubmitted && getSelectedOptionIndex() === index.toString() && !option.isCorrect ? "red" : 
                                    "blue"
                                }
                            >
                                <Box position="relative">
                                    {option.text}
                                    
                                    {/* Correct/incorrect indicator when submitted */}
                                    {isSubmitted && showCorrectAnswer && option.isCorrect && (
                                        <Icon 
                                            as={FiCheck} 
                                            color="green.500" 
                                            position="absolute" 
                                            right="-20px" 
                                            top="50%" 
                                            transform="translateY(-50%)" 
                                        />
                                    )}
                                </Box>
                            </Radio>
                        ))}
                    </Stack>
                </RadioGroup>
                
                {/* Show explanation when submitted */}
                {isSubmitted && showCorrectAnswer && question.explanation && (
                    <Alert status="info" mt={4}>
                        <AlertIcon />
                        <Box>
                            <AlertTitle>Explanation:</AlertTitle>
                            <AlertDescription>{question.explanation}</AlertDescription>
                        </Box>
                    </Alert>
                )}
            </CardBody>
        </Card>
    );
};

// Exercise Section Component
const ExerciseSection = ({ lessonId }) => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentExercise, setCurrentExercise] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [exerciseResult, setExerciseResult] = useState(null);
    const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
    
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    
    useEffect(() => {
        fetchExercises();
    }, [lessonId]);
    
    const fetchExercises = async () => {
        if (!lessonId) return;
        
        try {
            setLoading(true);
            const response = await ExerciseService.getAllExercises({ lessonId });
            if (response.data && response.data.exercises) {
                setExercises(response.data.exercises);
            }
        } catch (error) {
            console.error('Error fetching exercises:', error);
            toast({
                title: 'Error',
                description: 'Unable to load exercises list',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };
    
    const handleOpenExercise = async (exercise) => {
        setCurrentExercise(exercise);
        setSelectedAnswers({});
        setIsSubmitted(false);
        setExerciseResult(null);
        setShowCorrectAnswers(false);
        onOpen();
        
        try {
            setLoadingQuestions(true);
            const response = await ExerciseService.getQuestionsByExerciseId(exercise.id);
            if (response.data && response.data.questions) {
                setQuestions(response.data.questions);
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
            toast({
                title: 'Error',
                description: 'Unable to load exercise questions',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoadingQuestions(false);
        }
    };
    
    const handleSubmitExercise = async () => {
        // Check if all questions are answered
        const answeredCount = Object.keys(selectedAnswers).length;
        if (answeredCount < questions.length) {
            toast({
                title: 'Incomplete',
                description: `You have answered ${answeredCount}/${questions.length} questions. Please answer all questions.`,
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        
        try {
            // Calculate score and compile results
            let correctCount = 0;
            
            // Check each answer
            questions.forEach(question => {
                const userAnswer = selectedAnswers[question.id];
                if (userAnswer && userAnswer.isCorrect) {
                    correctCount++;
                }
            });
            
            const score = (correctCount / questions.length) * 100;
            const passed = score >= (currentExercise.passingScore || 70);
            
            // Display results
            setExerciseResult({
                score,
                correctCount,
                totalCount: questions.length,
                passed
            });
            
            setIsSubmitted(true);
            setShowCorrectAnswers(true);
            
            toast({
                title: passed ? 'Congratulations!' : 'Results',
                description: passed 
                    ? `You passed the exercise with ${correctCount}/${questions.length} correct answers!` 
                    : `You got ${correctCount}/${questions.length} correct answers. Try again!`,
                status: passed ? 'success' : 'info',
                duration: 5000,
                isClosable: true,
            });
            
        } catch (error) {
            console.error('Error checking exercise result:', error);
            toast({
                title: 'Error',
                description: 'Unable to check exercise results',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };
    
    const handleTryAgain = () => {
        setSelectedAnswers({});
        setIsSubmitted(false);
        setExerciseResult(null);
        setShowCorrectAnswers(false);
    };
    
    if (loading) {
        return (
            <Box textAlign="center" py={6}>
                <Spinner size="md" />
                <Text mt={2}>Loading exercises...</Text>
            </Box>
        );
    }
    
            if (exercises.length === 0) {
            return null; // Don't display anything if no exercises
        }
    
    return (
        <>
            <Box mt={8} borderTopWidth="1px" borderColor={borderColor} pt={8}>
                <Heading size="md" mb={6}>
                    <HStack>
                        <Icon as={FiEdit3} />
                        <Text>Related Exercises</Text>
                    </HStack>
                </Heading>
                
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                    {exercises.map(exercise => (
                        <Card 
                            key={exercise.id} 
                            borderWidth="1px" 
                            borderColor={borderColor}
                            cursor="pointer"
                            _hover={{ 
                                shadow: 'md', 
                                transform: 'translateY(-2px)',
                                transition: 'all 0.2s' 
                            }}
                            onClick={() => handleOpenExercise(exercise)}
                        >
                            <CardBody>
                                <VStack align="start" spacing={3}>
                                    <Heading size="md">{exercise.title}</Heading>
                                    <Text color="gray.600" noOfLines={2}>{exercise.description}</Text>
                                    
                                    <HStack spacing={4} mt={2}>
                                        <Badge colorScheme={
                                            exercise.difficulty === 'easy' ? 'green' : 
                                            exercise.difficulty === 'medium' ? 'yellow' : 
                                            'red'
                                        }>
                                            {exercise.difficulty === 'easy' ? 'Easy' : 
                                             exercise.difficulty === 'medium' ? 'Medium' : 
                                             'Hard'}
                                        </Badge>
                                        
                                        <HStack color="gray.500" fontSize="sm">
                                            <Icon as={FiClock} />
                                            <Text>{exercise.timeLimit || 'No limit'} minutes</Text>
                                        </HStack>
                                    </HStack>
                                </VStack>
                            </CardBody>
                            <CardFooter pt={0} borderTopWidth="1px" borderColor={borderColor}>
                                <Button colorScheme="blue" size="sm" width="full">
                                    Start Exercise
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </Grid>
            </Box>
            
            {/* Exercise Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        {currentExercise?.title}
                        <Text fontSize="sm" fontWeight="normal" color="gray.500" mt={1}>
                            {isSubmitted ? `Result: ${exerciseResult?.correctCount}/${exerciseResult?.totalCount} correct (${Math.round(exerciseResult?.score || 0)}%)` : 
                             `${questions.length} questions • ${currentExercise?.timeLimit || 'No limit'} minutes`}
                        </Text>
                    </ModalHeader>
                    <ModalCloseButton />
                    
                    <ModalBody>
                        {loadingQuestions ? (
                            <Flex justify="center" align="center" minH="200px">
                                <Spinner />
                            </Flex>
                        ) : (
                            <>
                                {isSubmitted && exerciseResult && (
                                    <Alert
                                        status={exerciseResult.passed ? 'success' : 'warning'}
                                        mb={6}
                                        borderRadius="md"
                                    >
                                        <AlertIcon />
                                        <Box>
                                            <AlertTitle>
                                                {exerciseResult.passed ? 'Congratulations!' : 'Requirements not met'}
                                            </AlertTitle>
                                            <AlertDescription>
                                                {exerciseResult.passed
                                                    ? `You completed the exercise with ${exerciseResult.correctCount}/${exerciseResult.totalCount} correct answers (${Math.round(exerciseResult.score)}%).`
                                                    : `You got ${exerciseResult.correctCount}/${exerciseResult.totalCount} correct answers (${Math.round(exerciseResult.score)}%). Passing score is ${currentExercise?.passingScore || 70}%.`}
                                            </AlertDescription>
                                        </Box>
                                    </Alert>
                                )}
                                
                                {questions.map((question) => (
                                    <ExerciseQuestion
                                        key={question.id}
                                        question={question}
                                        selectedAnswers={selectedAnswers}
                                        setSelectedAnswers={setSelectedAnswers}
                                        isSubmitted={isSubmitted}
                                        showCorrectAnswer={showCorrectAnswers}
                                    />
                                ))}
                            </>
                        )}
                    </ModalBody>
                    
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Close
                        </Button>
                        {isSubmitted ? (
                            <Button colorScheme="blue" onClick={handleTryAgain}>
                                Try Again
                            </Button>
                        ) : (
                            <Button 
                                colorScheme="blue" 
                                onClick={handleSubmitExercise} 
                                isDisabled={loadingQuestions || Object.keys(selectedAnswers).length < questions.length}
                            >
                                Submit
                            </Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

const LearnPage = () => {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [lesson, setLesson] = useState(null);
    const [lessonList, setLessonList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [markingComplete, setMarkingComplete] = useState(false);
    const [progress, setProgress] = useState(0);
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Color mode values
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const textColor = useColorModeValue('gray.600', 'gray.400');
    const pageBgColor = useColorModeValue('gray.50', 'gray.900');
    const sidebarBgColor = useColorModeValue('white', 'gray.800');

    const fetchLesson = async () => {
        try {
            setLoading(true);
            const response = await LessonService.getLessonById(lessonId);
            setLesson({ ...response.data.lesson, isCompleted: response.data.isCompleted });
            setProgress(response.data.userProgress || 0);
            
            // Call fetchLessonList immediately after getting courseId
            if (response.data.lesson?.courseId) {
                await fetchLessonList(response.data.lesson.courseId);
            }
        } catch (error) {
            console.error('Error fetching lesson:', error);
            toast({
                title: 'Error',
                description: error.message || 'Unable to load lesson',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchLessonList = async (courseId) => {
        try {
            console.log('Fetching lessons for course:', courseId);
            const response = await CourseService.getLessonsByCourse(courseId);
            console.log('Lesson list response:', response);
            if (response.data.lessons) {
                // Sort lessons by order
                const sortedLessons = response.data.lessons.sort((a, b) => a.order - b.order);
                setLessonList(sortedLessons);
            }
        } catch (error) {
            console.error('Error fetching lesson list:', error);
            toast({
                title: 'Error',
                description: 'Unable to load lesson list',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    useEffect(() => {
        fetchLesson();
    }, [lessonId]);

    const handleMarkComplete = async () => {
        if (!lesson || lesson.isCompleted) return;
        
        setMarkingComplete(true);
        try {
            await LessonService.markLessonComplete(lesson.id);
            
            setLesson(prev => ({ ...prev, isCompleted: true }));
            setLessonList(prevList => prevList.map(l => 
                l.id === lesson.id ? { ...l, isCompleted: true } : l
            ));
            
            toast({
                title: 'Completed!',
                description: `Lesson "${lesson.title}" has been marked as completed.`, 
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

        } catch (error) {
            toast({
                title: 'Error',
                description: 'Unable to mark lesson as completed.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setMarkingComplete(false);
        }
    };

    const handleLessonClick = (newLessonId) => {
        navigate(`/learn/${newLessonId}`);
        onClose(); // Close drawer on mobile if open
    };

    const handlePreviousLesson = () => {
        const currentIndex = lessonList.findIndex(l => l.id === parseInt(lessonId));
        if (currentIndex > 0) {
            navigate(`/learn/${lessonList[currentIndex - 1].id}`);
        }
    };

    const handleNextLesson = () => {
        const currentIndex = lessonList.findIndex(l => l.id === parseInt(lessonId));
        if (currentIndex < lessonList.length - 1) {
            navigate(`/learn/${lessonList[currentIndex + 1].id}`);
        }
    };

    const handleBackToCourse = () => {
        if (lesson?.courseId) {
            navigate(`/courses/${lesson.courseId}`);
        }
    };

    if (loading) {
        return <LoadingState />;
    }

    return (
        <Box minH="100vh" bg={pageBgColor}>
            {/* Top Navigation Bar */}
            <Box
                position="sticky"
                top="0"
                bg={bgColor}
                borderBottom="1px"
                borderColor={borderColor}
                py={4}
                px={4}
            >
                <Container maxW="container.xl">
                    <HStack justify="space-between" align="center">
                        <HStack spacing={4}>
                            <Button
                                leftIcon={<FiList />}
                                variant="ghost"
                                onClick={handleBackToCourse}
                            >
                                {lesson?.course?.title || 'Course Content'}
                            </Button>
                            <Divider orientation="vertical" h="20px" />
                            <Badge colorScheme="blue" px={2} py={1} borderRadius="full">
                                <HStack spacing={2}>
                                    <ContentTypeIcon type={lesson?.contentType} />
                                    <Text>{lesson?.course?.level?.toUpperCase()}</Text>
                                </HStack>
                            </Badge>
                        </HStack>

                        <HStack spacing={4}>
                            <IconButton
                                icon={<FiMenu />}
                                variant="ghost"
                                display={{ base: 'flex', lg: 'none' }}
                                onClick={onOpen}
                                aria-label="Open lesson list"
                            />
                            <HStack color={textColor}>
                                <FiClock />
                                <Text>{lesson?.duration || 0} minutes</Text>
                            </HStack>
                            <Progress
                                value={progress}
                                size="sm"
                                width="200px"
                                borderRadius="full"
                                colorScheme="blue"
                            />
                            <Menu>
                                <MenuButton
                                    as={IconButton}
                                    icon={<FiMoreVertical />}
                                    variant="ghost"
                                    aria-label="Lesson Options"
                                />
                                <MenuList>
                                    <MenuItem 
                                        icon={lesson?.isCompleted ? <FiCheck /> : <FiBookOpen />} 
                                        onClick={handleMarkComplete}
                                        isDisabled={lesson?.isCompleted || markingComplete}
                                    >
                                        {markingComplete 
                                            ? "Processing..." 
                                            : lesson?.isCompleted 
                                                ? "Completed" 
                                                : "Mark as Completed"
                                        }
                                    </MenuItem>
                                </MenuList>
                            </Menu>
                        </HStack>
                    </HStack>
                </Container>
            </Box>

            {/* Main Content with Sidebar */}
            <Container maxW="container.xl" py={8}>
                <Grid templateColumns={{ base: '1fr', lg: '1fr 350px' }} gap={8}>
                    {/* Main Content */}
                    <GridItem>
                        <VStack spacing={8} align="stretch">
                            <Heading size="lg" mb={0}>
                                {lesson?.title}
                            </Heading>

                            {/* Content Box */}
                            <Box
                                bg={lesson?.contentType === 'video' ? 'black' : bgColor}
                                p={lesson?.contentType === 'video' ? 0 : 8}
                                borderRadius="xl"
                                borderWidth="1px"
                                borderColor={borderColor}
                                overflow="hidden"
                            >
                                <LessonContent lesson={lesson} borderColor={borderColor} />
                            </Box>

                            {/* Add ExerciseSection here */}
                            {lesson && <ExerciseSection lessonId={lesson.id} />}

                            {/* Navigation Buttons */}
                            <HStack justify="space-between" pt={4}>
                                <Button
                                    leftIcon={<FiChevronLeft />}
                                    onClick={handlePreviousLesson}
                                    isDisabled={!lessonList.length || lessonList.findIndex(l => l.id === parseInt(lessonId)) === 0}
                                >
                                    Previous Lesson
                                </Button>
                                <Button
                                    rightIcon={<FiChevronRight />}
                                    colorScheme="blue"
                                    onClick={handleNextLesson}
                                    isDisabled={!lessonList.length || lessonList.findIndex(l => l.id === parseInt(lessonId)) === lessonList.length - 1}
                                >
                                    Next Lesson
                                </Button>
                            </HStack>
                        </VStack>
                    </GridItem>

                    {/* Lesson List Sidebar - Desktop */}
                    <GridItem
                        display={{ base: 'none', lg: 'block' }}
                        bg={sidebarBgColor}
                        p={4}
                        borderRadius="xl"
                        borderWidth="1px"
                        borderColor={borderColor}
                        position="sticky"
                        top="100px"
                        maxH="calc(100vh - 120px)"
                        overflowY="auto"
                    >
                        <VStack spacing={4} align="stretch">
                            <Heading size="md">Lesson List</Heading>
                            <LessonList
                                lessons={lessonList}
                                currentLessonId={lessonId}
                                onLessonClick={handleLessonClick}
                            />
                        </VStack>
                    </GridItem>
                </Grid>
            </Container>

            {/* Mobile Drawer for Lesson List */}
            <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>Lesson List</DrawerHeader>
                    <DrawerBody>
                        <LessonList
                            lessons={lessonList}
                            currentLessonId={lessonId}
                            onLessonClick={handleLessonClick}
                        />
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Box>
    );
};

export default LearnPage; 