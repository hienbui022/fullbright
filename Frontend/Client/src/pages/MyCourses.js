import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Heading,
    Text,
    SimpleGrid,
    VStack,
    HStack,
    Badge,
    Progress,
    Icon,
    Button,
    Spinner,
    useToast,
    Image,
    Flex,
    Tooltip
} from '@chakra-ui/react';
import { FiBook, FiClock, FiCheck, FiPlay, FiAward } from 'react-icons/fi';
import EnrollmentService from '../apis/enrollments.service';

const MyCourses = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
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
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        const fetchEnrollments = async () => {
            if (!user) {
                return;
            }

            try {
                console.log('Fetching enrollments for user:', user.id);
                const response = await EnrollmentService.getMyEnrollments({
                    page: pagination.page,
                    limit: pagination.limit
                });
                console.log('API Response:', response);

                if (response.success && response.data) {
                    setEnrollments(response.data.enrollments);
                    setPagination(prev => ({
                        ...prev,
                        total: response.data.pagination.total,
                        totalPages: response.data.pagination.totalPages
                    }));
                } else {
                    console.error('Invalid response format:', response);
                    toast({
                        title: 'Error',
                        description: response.message || 'Invalid response format from server',
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                    });
                }
            } catch (error) {
                console.error('Error fetching enrollments:', error);
                toast({
                    title: 'Error',
                    description: error.response?.data?.message || 'Failed to load your courses',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchEnrollments();
    }, [user, toast, pagination.page, pagination.limit]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'green';
            case 'completed':
                return 'purple';
            case 'cancelled':
                return 'red';
            default:
                return 'gray';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'active':
                return 'In Progress';
            case 'completed':
                return 'Completed';
            case 'cancelled':
                return 'Cancelled';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <Box minH="80vh" display="flex" alignItems="center" justifyContent="center">
                <Spinner size="xl" color="blue.500" thickness="4px" />
            </Box>
        );
    }

    return (
        <Box py={12} bg="gray.50" minH="80vh">
            <Container maxW="7xl">
                <VStack align="stretch" spacing={8}>
                    <Box>
                        <Heading size="2xl" mb={2}>My Courses</Heading>
                        <Text color="gray.600">
                            Continue your learning journey
                        </Text>
                    </Box>

                    {enrollments.length === 0 ? (
                        <Box 
                            bg="white" 
                            p={8} 
                            rounded="xl" 
                            textAlign="center"
                            boxShadow="md"
                        >
                            <VStack spacing={4}>
                                <Icon as={FiBook} boxSize={12} color="gray.400" />
                                <Heading size="md" color="gray.600">
                                    No Courses Yet
                                </Heading>
                                <Text color="gray.500">
                                    You haven't enrolled in any courses yet.
                                </Text>
                                <Button
                                    colorScheme="blue"
                                    onClick={() => navigate('/courses')}
                                >
                                    Browse Courses
                                </Button>
                            </VStack>
                        </Box>
                    ) : (
                        <VStack align="stretch" spacing={6}>
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                                {enrollments.map((enrollment) => (
                                    <Box
                                        key={enrollment.id}
                                        bg="white"
                                        rounded="xl"
                                        overflow="hidden"
                                        boxShadow="md"
                                        transition="all 0.2s"
                                        _hover={{
                                            transform: 'translateY(-4px)',
                                            boxShadow: 'lg',
                                        }}
                                    >
                                        <Box position="relative">
                                            <Image
                                                src={enrollment.course.thumbnail}
                                                alt={enrollment.course.title}
                                                w="full"
                                                h="200px"
                                                objectFit="cover"
                                            />
                                            <Badge
                                                position="absolute"
                                                top={4}
                                                right={4}
                                                colorScheme={getStatusColor(enrollment.status)}
                                                px={3}
                                                py={1}
                                                rounded="full"
                                            >
                                                {getStatusText(enrollment.status)}
                                            </Badge>
                                        </Box>

                                        <VStack align="stretch" p={6} spacing={4}>
                                            <Heading size="md" noOfLines={2}>
                                                {enrollment.course.title}
                                            </Heading>

                                            <HStack justify="space-between">
                                                <HStack>
                                                    <Icon as={FiClock} />
                                                    <Text fontSize="sm" color="gray.600">
                                                        {enrollment.course.duration} mins
                                                    </Text>
                                                </HStack>
                                                <HStack>
                                                    <Icon as={FiBook} />
                                                    <Text fontSize="sm" color="gray.600">
                                                        {enrollment.course.lessons?.length || 0} lessons
                                                    </Text>
                                                </HStack>
                                            </HStack>

                                            <Box>
                                                <HStack justify="space-between" mb={1}>
                                                    <Text fontSize="sm" color="gray.600">
                                                        Progress
                                                    </Text>
                                                    <Text fontSize="sm" fontWeight="medium">
                                                        {Math.round(enrollment.calculatedProgress || 0)}%
                                                    </Text>
                                                </HStack>
                                                <Progress 
                                                    value={enrollment.calculatedProgress || 0}
                                                    size="sm" 
                                                    colorScheme="blue"
                                                    rounded="full"
                                                />
                                            </Box>

                                            <Button
                                                colorScheme="blue"
                                                leftIcon={
                                                    enrollment.status === 'completed' 
                                                        ? <Icon as={FiAward} /> 
                                                        : <Icon as={FiPlay} />
                                                }
                                                onClick={() => navigate(`/learn/${enrollment.course.id}`)}
                                            >
                                                {enrollment.status === 'completed' 
                                                    ? 'Review Course' 
                                                    : 'Continue Learning'}
                                            </Button>
                                        </VStack>
                                    </Box>
                                ))}
                            </SimpleGrid>

                            {/* Pagination */}
                            {pagination.total > pagination.limit && (
                                <HStack justify="center" spacing={2} mt={4}>
                                    <Button
                                        isDisabled={pagination.page === 1}
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    >
                                        Previous
                                    </Button>
                                    <Text>
                                        Page {pagination.page} of {pagination.totalPages}
                                    </Text>
                                    <Button
                                        isDisabled={pagination.page >= pagination.totalPages}
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    >
                                        Next
                                    </Button>
                                </HStack>
                            )}
                        </VStack>
                    )}
                </VStack>
            </Container>
        </Box>
    );
};

export default MyCourses; 