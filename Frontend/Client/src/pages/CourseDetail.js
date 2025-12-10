import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Heading,
    Text,
    Image,
    VStack,
    HStack,
    Badge,
    Divider,
    SimpleGrid,
    Icon,
    Button,
    Spinner,
    useToast,
    Progress,
    Circle,
    Flex,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Tooltip,
    List,
    ListItem,
    ListIcon
} from '@chakra-ui/react';
import { FiClock, FiUser, FiCalendar, FiBookOpen, FiAward, FiBook, FiCheck, FiEdit, FiDollarSign, FiCheckCircle, FiCreditCard, FiPlay } from 'react-icons/fi';
import CourseService from '../apis/course.service';
import EnrollmentService from '../apis/enrollments.service';
import FlashcardService from '../apis/flashcard.service';
import { AuthContext } from '../context/AuthContext';

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isLoginModalOpen, onOpen: onLoginModalOpen, onClose: onLoginModalClose } = useDisclosure();
    const { isOpen: isEnrollModalOpen, onOpen: onEnrollModalOpen, onClose: onEnrollModalClose } = useDisclosure();
    const { isOpen: isFlashcardLearnModalOpen, onOpen: onFlashcardLearnModalOpen, onClose: onFlashcardLearnModalClose } = useDisclosure();
    const { user: contextUser } = useContext(AuthContext);
    const [user, setUser] = useState(null);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enrollmentStatus, setEnrollmentStatus] = useState(null);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [courseProgress, setCourseProgress] = useState(0);
    const [flashcards, setFlashcards] = useState([]);
    const [flashcardsLoading, setFlashcardsLoading] = useState(false);
    const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
    const [isCardFlipped, setIsCardFlipped] = useState(false);
    const toast = useToast();

    useEffect(() => {
        // Lấy user từ localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const userData = JSON.parse(userStr);
                setUser(userData);
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setFlashcardsLoading(true);
            setCourseProgress(0);
            setFlashcards([]);
            try {
                const courseResponse = await CourseService.getCourseById(id);
                const fetchedCourse = courseResponse.data.course;
                setCourse(fetchedCourse);

                if (user) {
                    try {
                        const statusResponse = await EnrollmentService.checkEnrollmentStatus(id);
                        const currentStatus = statusResponse.data.status;
                        setEnrollmentStatus(currentStatus);

                        if (currentStatus === 'active' || currentStatus === 'completed') {
                            try {
                                const lessonsResponse = await CourseService.getLessonsByCourse(id);
                                const lessons = lessonsResponse.data.lessons || [];
                                if (lessons.length > 0) {
                                    const completedLessons = lessons.filter(l => l.isCompleted).length;
                                    const calculatedProgress = Math.round((completedLessons / lessons.length) * 100);
                                    setCourseProgress(calculatedProgress);
                                } else {
                                    setCourseProgress(0);
                                }

                                // Fetch Flashcards for enrolled users
                                try {
                                    const flashcardResponse = await FlashcardService.getAllFlashcards({ courseId: id, limit: 50 });
                                    if (flashcardResponse.success && flashcardResponse.data?.flashcards) {
                                        setFlashcards(flashcardResponse.data.flashcards);
                                    } else {
                                        setFlashcards([]);
                                        console.warn("No flashcards found or error fetching:", flashcardResponse.message);
                                    }
                                } catch (fcError) {
                                    console.error('Error fetching flashcards:', fcError);
                                    setFlashcards([]);
                                }

                            } catch (lessonsError) {
                                console.error('Error fetching lessons for progress:', lessonsError);
                                setCourseProgress(0);
                            }
                        } else {
                            setCourseProgress(0);
                            setFlashcards([]);
                        }

                    } catch (statusError) {
                        console.error('Error fetching enrollment status:', statusError);
                        setEnrollmentStatus(null);
                        setCourseProgress(0);
                        setFlashcards([]);
                    }
                } else {
                    setEnrollmentStatus(null);
                    setCourseProgress(0);
                    setFlashcards([]);
                }

            } catch (error) {
                console.error('Error fetching course data:', error);
                setCourse(null);
                setEnrollmentStatus(null);
                setCourseProgress(0);
                setFlashcards([]);
                toast({
                    title: 'Error',
                    description: 'Failed to load course details',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            } finally {
                setLoading(false);
                setFlashcardsLoading(false);
            }
        };

        fetchData();
    }, [id, user, toast]);

    const isAuthor = user && course && user.id === course.creator?.id;

    const handleEnroll = async () => {
        if (!user) {
            onLoginModalOpen();
            return;
        }
        onEnrollModalOpen();
    };

    const confirmEnrollment = async () => {
        setIsEnrolling(true);
        try {
            await EnrollmentService.enroll(id);
            setEnrollmentStatus('active');
            setCourseProgress(0);
            toast({
                title: 'Success',
                description: 'Successfully enrolled in the course',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            onEnrollModalClose();
        } catch (error) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to enroll in the course',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsEnrolling(false);
        }
    };

    const getLevelColor = (level) => {
        switch(level?.toLowerCase()) {
            case 'beginner':
                return 'green';
            case 'intermediate':
                return 'blue';
            case 'advanced':
                return 'purple';
            default:
                return 'gray';
        }
    };

    const getEnrollmentButton = () => {
        if (isAuthor) {
            return (
                <Button
                    colorScheme="purple"
                    size="lg"
                    w="full"
                    h="16"
                    fontSize="lg"
                    leftIcon={<Icon as={FiEdit} boxSize={5} />}
                    boxShadow="lg"
                    _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: 'xl',
                    }}
                    transition="all 0.2s"
                    onClick={() => navigate(`/admin/courses/${id}/edit`)}
                >
                    Edit Course
                </Button>
            );
        }

        if (!user) {
            return (
                <Button
                    colorScheme="blue"
                    size="lg"
                    w="full"
                    h="16"
                    fontSize="lg"
                    leftIcon={<Icon as={FiAward} boxSize={5} />}
                    boxShadow="lg"
                    _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: 'xl',
                    }}
                    transition="all 0.2s"
                    onClick={onLoginModalOpen}
                >
                    Login to Enroll
                </Button>
            );
        }

        switch (enrollmentStatus) {
            case 'active':
            case 'completed':
                const firstLessonId = course?.lessons?.[0]?.id;
                return (
                    <Button
                        colorScheme={enrollmentStatus === 'completed' ? "purple" : "green"}
                        size="lg"
                        w="full"
                        h="16"
                        fontSize="lg"
                        leftIcon={<Icon as={enrollmentStatus === 'completed' ? FiAward : FiCheck} boxSize={5} />}
                        boxShadow="lg"
                        _hover={{
                            transform: 'translateY(-2px)',
                            boxShadow: 'xl',
                        }}
                        transition="all 0.2s"
                        onClick={() => firstLessonId ? navigate(`/learn/${firstLessonId}`) : null}
                        isDisabled={!firstLessonId && enrollmentStatus === 'active'}
                    >
                        {enrollmentStatus === 'completed' ? 'Review Course' : 'Continue Learning'}
                    </Button>
                );
            default:
                return (
                    <Button
                        colorScheme="blue"
                        size="lg"
                        w="full"
                        h="16"
                        fontSize="lg"
                        leftIcon={<Icon as={FiAward} boxSize={5} />}
                        boxShadow="lg"
                        _hover={{
                            transform: 'translateY(-2px)',
                            boxShadow: 'xl',
                        }}
                        transition="all 0.2s"
                        onClick={handleEnroll}
                        isLoading={isEnrolling}
                    >
                        {isEnrolling ? 'Enrolling...' : (course?.price === 0 ? 'Enroll for Free' : `Enroll Now - $${course?.price || ''}`)}
                    </Button>
                );
        }
    };

    const FlashcardItem = ({ flashcard }) => (
        <Box 
            bg="white" 
            p={4} 
            rounded="lg" 
            boxShadow="base" 
            borderWidth="1px" 
            borderColor="gray.200"
            transition="all 0.2s"
            _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
        >
            <VStack align="stretch" spacing={3}>
                {flashcard.imageUrl && (
                    <Image 
                        src={flashcard.imageUrl} 
                        alt={flashcard.term} 
                        h="100px" 
                        objectFit="contain" 
                        rounded="md" 
                        mb={2}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                )}
                <Text fontWeight="bold" fontSize="lg" color="blue.600" textAlign="center">{flashcard.term}</Text>
                <Text fontSize="sm" color="gray.600" textAlign="center" noOfLines={2}>{flashcard.definition}</Text>
                {flashcard.lesson?.title && (
                    <Tooltip label={`Lesson: ${flashcard.lesson.title}`} placement="top">
                        <HStack justify="center" spacing={1}>
                            <Icon as={FiBookOpen} color="gray.500" boxSize={3} />
                            <Text fontSize="xs" color="gray.500" isTruncated maxWidth="150px">
                                {flashcard.lesson.title}
                            </Text>
                        </HStack>
                    </Tooltip>
                )}
                {flashcard.difficulty && (
                    <Badge 
                        alignSelf="center"
                        colorScheme={flashcard.difficulty === 'easy' ? 'green' : flashcard.difficulty === 'medium' ? 'orange' : 'red'}
                    >
                        {flashcard.difficulty}
                    </Badge>
                )}
            </VStack>
        </Box>
    );

    const handleOpenFlashcardLearnModal = () => {
        setCurrentFlashcardIndex(0);
        setIsCardFlipped(false);
        onFlashcardLearnModalOpen();
    };

    const handleCloseFlashcardLearnModal = () => {
        onFlashcardLearnModalClose();
    };

    const handleNextFlashcard = () => {
        setIsCardFlipped(false);
        setCurrentFlashcardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
    };

    const handlePrevFlashcard = () => {
        setIsCardFlipped(false);
        setCurrentFlashcardIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
    };

    const handleFlipCard = () => {
        setIsCardFlipped(!isCardFlipped);
    };

    if (loading) {
        return (
            <Box minH="80vh" display="flex" alignItems="center" justifyContent="center">
                <Spinner size="xl" color="blue.500" thickness="4px" />
            </Box>
        );
    }

    if (!course) {
        return (
            <Box minH="80vh" display="flex" alignItems="center" justifyContent="center">
                <Text>Course not found</Text>
            </Box>
        );
    }

    return (
        <Box py={12} bg="gray.50" minH="80vh">
            <Container maxW="7xl">
                {/* Course Header */}
                <Box 
                    bg="white" 
                    rounded="2xl" 
                    overflow="hidden"
                    mb={8}
                    boxShadow="xl"
                >
                    <Box 
                        bg="blue.600" 
                        p={8}
                        position="relative"
                        overflow="hidden"
                    >
                        <Box
                            position="absolute"
                            top="0"
                            left="0"
                            right="0"
                            bottom="0"
                            bg="blue.500"
                            opacity="0.1"
                            transform="rotate(-5deg) scale(1.2)"
                            zIndex={0}
                        />
                        <Container maxW="7xl" position="relative" zIndex={1}>
                            <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} alignItems="center">
                                <VStack align="start" spacing={4} color="white">
                                    <Badge 
                                        colorScheme={getLevelColor(course.level)}
                                        px={3}
                                        py={1}
                                        rounded="full"
                                        fontSize="sm"
                                        textTransform="capitalize"
                                    >
                                        {course.level} Level
                                    </Badge>
                                    <Heading size="2xl" color="white">
                                        {course.title}
                                    </Heading>
                                    <HStack spacing={6}>
                                        <HStack>
                                            <Icon as={FiClock} />
                                            <Text>{course.duration} minutes</Text>
                                        </HStack>
                                        <Tooltip label={isAuthor ? "You are the author" : "Course instructor"}>
                                            <HStack>
                                                <Icon as={FiUser} />
                                                <Text>{course.creator?.fullName || 'Unknown Author'}</Text>
                                                {isAuthor && (
                                                    <Badge colorScheme="purple" ml={2}>
                                                        Author
                                                    </Badge>
                                                )}
                                            </HStack>
                                        </Tooltip>
                                    </HStack>
                                </VStack>
                                <Circle 
                                    size="300px" 
                                    bg="white" 
                                    display={{ base: 'none', md: 'flex' }}
                                    alignItems="center"
                                    justifyContent="center"
                                    p={8}
                                >
                                    <Image
                                        src={course.thumbnail}
                                        alt={course.title}
                                        w="200px"
                                        h="200px"
                                        objectFit="contain"
                                    />
                                </Circle>
                            </SimpleGrid>
                        </Container>
                    </Box>
                </Box>

                <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
                    {/* Main Content */}
                    <Box gridColumn={{ lg: 'span 2' }}>
                        <VStack align="stretch" spacing={8}>
                            {/* Course Progress */}
                            {enrollmentStatus === 'active' || enrollmentStatus === 'completed' ? (
                                <Box bg="white" p={6} rounded="xl" boxShadow="md">
                                    <VStack align="stretch" spacing={4}>
                                        <Heading size="md">Course Progress</Heading>
                                        <Progress 
                                            value={courseProgress}
                                            size="lg" 
                                            rounded="full" 
                                            colorScheme="blue"
                                            hasStripe={courseProgress < 100}
                                            isAnimated={courseProgress < 100}
                                        />
                                        <Text color="gray.600" fontSize="sm">
                                            {courseProgress}% Complete
                                        </Text>
                                    </VStack>
                                </Box>
                            ) : null}

                            {/* Course Description */}
                            <Box bg="white" p={6} rounded="xl" boxShadow="md">
                                <VStack align="stretch" spacing={4}>
                                    <Heading size="md">About This Course</Heading>
                                    <Box
                                        color="gray.600"
                                        dangerouslySetInnerHTML={{ __html: course.description || '' }}
                                        sx={{
                                            p: { marginBottom: '1rem' },
                                            ul: { marginLeft: '1.5rem', marginBottom: '1rem' },
                                            ol: { marginLeft: '1.5rem', marginBottom: '1rem' },
                                            li: { marginBottom: '0.5rem' },
                                            a: { color: 'blue.500', textDecoration: 'underline' },
                                            strong: { fontWeight: 'semibold' },
                                            em: { fontStyle: 'italic' },
                                        }}
                                    />
                                </VStack>
                            </Box>

                            {/* Course Content */}
                            <Box bg="white" p={6} rounded="xl" boxShadow="md">
                                <VStack align="stretch" spacing={4}>
                                    <Heading size="md">Course Content</Heading>
                                    {course?.lessons?.length > 0 ? (
                                        <VStack align="stretch">
                                            {course.lessons.map((lesson, index) => (
                                                <Box 
                                                    key={lesson.id}
                                                    p={4}
                                                    bg="gray.50"
                                                    rounded="lg"
                                                    _hover={{ bg: 'gray.100' }}
                                                    cursor={(enrollmentStatus === 'active' || enrollmentStatus === 'completed') ? 'pointer' : 'default'}
                                                    onClick={() => (enrollmentStatus === 'active' || enrollmentStatus === 'completed') && navigate(`/learn/${lesson.id}`)}
                                                >
                                                    <HStack justify="space-between">
                                                        <HStack>
                                                            <Icon as={FiBook} color="blue.500" />
                                                            <Text fontWeight="medium">
                                                                {index + 1}. {lesson.title}
                                                            </Text>
                                                        </HStack>
                                                        <Badge colorScheme="blue">
                                                            {lesson.duration} mins
                                                        </Badge>
                                                    </HStack>
                                                </Box>
                                            ))}
                                        </VStack>
                                    ) : (
                                        <Text color="gray.500" textAlign="center" py={4}>
                                            No lessons available yet
                                        </Text>
                                    )}
                                </VStack>
                            </Box>

                            {/* --- Flashcards Section --- */}
                            {(enrollmentStatus === 'active' || enrollmentStatus === 'completed') && (
                                <Box bg="white" p={6} rounded="xl" boxShadow="md">
                                    <VStack align="stretch" spacing={4}>
                                        <Flex justify="space-between" align="center">
                                            <Heading size="md">Flashcards for this Course</Heading>
                                            {flashcards.length > 0 && (
                                                <Button 
                                                    leftIcon={<FiPlay />} 
                                                    colorScheme="teal"
                                                    variant="solid"
                                                    size="sm"
                                                    onClick={handleOpenFlashcardLearnModal}
                                                    isDisabled={flashcardsLoading}
                                                >
                                                    Start Learning
                                                </Button>
                                            )}
                                        </Flex>
                                    </VStack>
                                </Box>
                            )}
                        </VStack>
                    </Box>

                    {/* Sidebar */}
                    <VStack spacing={6}>
                        {/* Course Stats */}
                        <Box bg="white" p={6} rounded="xl" boxShadow="md" w="full">
                            <VStack align="stretch" spacing={4}>
                                <Heading size="md">Course Features</Heading>
                                <Divider />
                                <SimpleGrid columns={2} spacing={4}>
                                    <VStack align="start">
                                        <Text color="gray.500" fontSize="sm">Skills</Text>
                                        <HStack flexWrap="wrap" spacing={2}>
                                            {course.skills?.map((skill, index) => (
                                                <Badge 
                                                    key={index}
                                                    colorScheme="blue"
                                                    variant="subtle"
                                                >
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </HStack>
                                    </VStack>
                                    <VStack align="start">
                                        <Text color="gray.500" fontSize="sm">Topics</Text>
                                        <HStack flexWrap="wrap" spacing={2}>
                                            {course.topics?.map((topic, index) => (
                                                <Badge 
                                                    key={index}
                                                    colorScheme="purple"
                                                    variant="subtle"
                                                >
                                                    {topic}
                                                </Badge>
                                            ))}
                                        </HStack>
                                    </VStack>
                                </SimpleGrid>
                            </VStack>
                        </Box>

                        {/* Enrollment Button */}
                        {getEnrollmentButton()}

                        {/* Course Info Cards */}
                        <SimpleGrid columns={2} spacing={4} w="full">
                            <Box bg="white" p={4} rounded="xl" boxShadow="md">
                                <VStack>
                                    <Circle size="40px" bg="blue.50">
                                        <Icon as={FiClock} color="blue.500" boxSize={5} />
                                    </Circle>
                                    <Text fontWeight="medium">{course.duration} mins</Text>
                                    <Text fontSize="sm" color="gray.500">Duration</Text>
                                </VStack>
                            </Box>
                            <Box bg="white" p={4} rounded="xl" boxShadow="md">
                                <VStack>
                                    <Circle size="40px" bg="purple.50">
                                        <Icon as={FiBook} color="purple.500" boxSize={5} />
                                    </Circle>
                                    <Text fontWeight="medium">{course?.lessons?.length || 0}</Text>
                                    <Text fontSize="sm" color="gray.500">Lessons</Text>
                                </VStack>
                            </Box>
                        </SimpleGrid>
                    </VStack>
                </SimpleGrid>
            </Container>

            {/* Login Modal */}
            <Modal isOpen={isLoginModalOpen} onClose={onLoginModalClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Login Required</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <Text>Please login to enroll in this course.</Text>
                        <Button
                            colorScheme="blue"
                            mt={4}
                            w="full"
                            onClick={() => navigate('/login')}
                        >
                            Login
                        </Button>
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Enrollment Confirmation Modal */}
            <Modal isOpen={isEnrollModalOpen} onClose={onEnrollModalClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Confirm Course Enrollment</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <VStack align="stretch" spacing={6}>
                            {/* Course Title and Level */}
                            <Box>
                                <Heading size="md" mb={2}>{course.title}</Heading>
                                <Badge colorScheme={getLevelColor(course.level)} mb={2}>
                                    {course.level} Level
                                </Badge>
                            </Box>

                            {/* Course Image */}
                            <Box>
                                <Image
                                    src={course.thumbnail}
                                    alt={course.title}
                                    w="full"
                                    h="200px"
                                    objectFit="cover"
                                    rounded="lg"
                                />
                            </Box>

                            {/* Course Details */}
                            <SimpleGrid columns={2} spacing={4}>
                                <Box>
                                    <Text color="gray.600" fontSize="sm">Duration</Text>
                                    <HStack>
                                        <Icon as={FiClock} />
                                        <Text fontWeight="medium">{course.duration} minutes</Text>
                                    </HStack>
                                </Box>
                                <Box>
                                    <Text color="gray.600" fontSize="sm">Price</Text>
                                    <HStack>
                                        <Icon as={FiDollarSign} />
                                        <Text fontWeight="medium">{course.price === 0 ? 'Free' : `$${course.price}`}</Text>
                                    </HStack>
                                </Box>
                            </SimpleGrid>

                            {/* Instructor */}
                            <Box>
                                <Text color="gray.600" fontSize="sm" mb={2}>Instructor</Text>
                                <HStack>
                                    <Icon as={FiUser} />
                                    <Text fontWeight="medium">{course.creator?.fullName}</Text>
                                </HStack>
                            </Box>

                            {/* Course Features */}
                            <Box>
                                <Text color="gray.600" fontSize="sm" mb={2}>Course Features</Text>
                                <List spacing={2}>
                                    <ListItem>
                                        <HStack>
                                            <ListIcon as={FiCheckCircle} color="green.500" />
                                            <Text>{course?.lessons?.length || 0} Lessons</Text>
                                        </HStack>
                                    </ListItem>
                                    <ListItem>
                                        <HStack>
                                            <ListIcon as={FiCheckCircle} color="green.500" />
                                            <Text>Lifetime Access</Text>
                                        </HStack>
                                    </ListItem>
                                    <ListItem>
                                        <HStack>
                                            <ListIcon as={FiCheckCircle} color="green.500" />
                                            <Text>Certificate of Completion</Text>
                                        </HStack>
                                    </ListItem>
                                </List>
                            </Box>

                            {/* Skills and Topics */}
                            <Box>
                                <Text color="gray.600" fontSize="sm" mb={2}>What You'll Learn</Text>
                                <HStack flexWrap="wrap" spacing={2}>
                                    {course.skills?.map((skill, index) => (
                                        <Badge key={index} colorScheme="blue" variant="subtle">
                                            {skill}
                                        </Badge>
                                    ))}
                                </HStack>
                            </Box>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onEnrollModalClose}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={confirmEnrollment}
                            isLoading={isEnrolling}
                        >
                            {isEnrolling ? 'Enrolling...' : 'Confirm Enrollment'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* --- Flashcard Learning Modal --- */}
            <Modal isOpen={isFlashcardLearnModalOpen} onClose={handleCloseFlashcardLearnModal} size="xl" isCentered>
                 <ModalOverlay bg="blackAlpha.600" />
                 <ModalContent mx={4}>
                     <ModalHeader>Learn Flashcards ({flashcards.length > 0 ? currentFlashcardIndex + 1 : 0} / {flashcards.length})</ModalHeader>
                     <ModalCloseButton />
                     <ModalBody pb={6}>
                         {flashcards.length > 0 ? (
                             <Box
                                 // perspective="1000px"
                             >
                                 <Box
                                     h={{ base: "350px", md: "400px" }}
                                     w="full"
                                     position="relative"
                                     cursor="pointer"
                                     onClick={handleFlipCard}
                                     transition="transform 0.6s"
                                     transformStyle="preserve-3d"
                                     transform={isCardFlipped ? 'rotateY(180deg)' : ''}
                                 >
                                     {/* === Front Side === */}
                                     <VStack
                                         position="absolute"
                                         w="full" h="full"
                                         bg="purple.100"
                                         p={5}
                                         rounded="lg"
                                         border="1px solid"
                                         borderColor="purple.200"
                                         alignItems="center"
                                         justifyContent="center"
                                         textAlign="center"
                                         backfaceVisibility="hidden"
                                         overflow="hidden"
                                     >
                                         <VStack spacing={4} w="full">
                                             {/* Display Definition on Front */}
                                             <Text fontSize="xl" fontWeight="medium">
                                                 {flashcards[currentFlashcardIndex]?.definition}
                                             </Text>
                                             {/* Display Image on Front */}
                                             {flashcards[currentFlashcardIndex]?.imageUrl && (
                                                 <Image
                                                     src={flashcards[currentFlashcardIndex]?.imageUrl}
                                                     alt="Flashcard image"
                                                     maxH="200px"
                                                     objectFit="contain"
                                                     rounded="md"
                                                     mt={4}
                                                     onError={(e) => { e.target.style.display = 'none'; }}
                                                 />
                                             )}
                                         </VStack>
                                     </VStack>

                                     {/* === Back Side === */}
                                     <VStack
                                         position="absolute"
                                         w="full" h="full"
                                         bg="teal.100"
                                         p={4}
                                         rounded="lg"
                                         border="1px solid"
                                         borderColor="teal.200"
                                         justifyContent="flex-start"
                                         alignItems="center"
                                         spacing={2}
                                         backfaceVisibility="hidden"
                                         transform="rotateY(180deg)"
                                         overflowY="auto"
                                     >
                                         {/* Term on back */}
                                         <Heading size="lg" color="teal.700" textAlign="center" w="full">
                                             {flashcards[currentFlashcardIndex]?.term}
                                         </Heading>

                                         {/* Definition on back */}
                                         <Text fontSize="md" fontWeight="medium" color="teal.800" textAlign="center" w="full">
                                             {flashcards[currentFlashcardIndex]?.definition}
                                         </Text>

                                         {/* Lesson on back */}
                                         {flashcards[currentFlashcardIndex]?.lesson?.title && (
                                             <HStack spacing={1} mt={1} bg="whiteAlpha.600" px={2} py={0.5} rounded="md">
                                                <Icon as={FiBookOpen} color="teal.600" boxSize={3} />
                                                <Text fontSize="xs" color="teal.700" fontWeight="medium">
                                                     {`Lesson: ${flashcards[currentFlashcardIndex]?.lesson.title}`}
                                                 </Text>
                                            </HStack>
                                         )}

                                         {/* Example on back */}
                                         {flashcards[currentFlashcardIndex]?.example && (
                                             <Text fontSize="sm" fontStyle="italic" color="gray.600" textAlign="center" w="full" mt={1}>
                                                 " {flashcards[currentFlashcardIndex]?.example} "
                                             </Text>
                                         )}

                                         {/* Image on back */}
                                         {flashcards[currentFlashcardIndex]?.imageUrl && (
                                             <Box w="full" display="flex" justifyContent="center" mt={2} flexShrink={0}> {/* Prevent image from shrinking */} 
                                                 <Image
                                                     src={flashcards[currentFlashcardIndex]?.imageUrl}
                                                     alt="Flashcard visualization"
                                                     maxH="150px"
                                                     objectFit="contain"
                                                     rounded="md"
                                                     border="1px solid"
                                                     borderColor="gray.200"
                                                     shadow="sm"
                                                     onError={(e) => { e.target.style.display = 'none'; }}
                                                 />
                                             </Box>
                                         )}

                                         {/* Audio on back */}
                                         {flashcards[currentFlashcardIndex]?.audioUrl && (
                                             <Box mt={2} w="full" maxW="300px" flexShrink={0}> {/* Prevent audio player from shrinking */} 
                                                 <audio
                                                     controls
                                                     src={flashcards[currentFlashcardIndex]?.audioUrl}
                                                     style={{ width: '100%' }}
                                                 >
                                                     Your browser does not support the audio element.
                                                 </audio>
                                             </Box>
                                         )}
                                     </VStack>
                                 </Box>
                             </Box>
                         ) : (
                             <Text textAlign="center">No flashcard data available for this course.</Text>
                         )}
                     </ModalBody>
                     <ModalFooter justifyContent="space-between">
                         <Button onClick={handlePrevFlashcard} disabled={flashcards.length <= 1}>
                             Previous
                         </Button>
                         <Text color="gray.500">Click card to flip</Text>
                         <Button onClick={handleNextFlashcard} disabled={flashcards.length <= 1}>
                             Next
                         </Button>
                     </ModalFooter>
                 </ModalContent>
            </Modal>
        </Box>
    );
};

export default CourseDetail; 