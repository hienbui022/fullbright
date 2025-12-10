import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Heading,
    SimpleGrid,
    Text,
    Image,
    VStack,
    Link as ChakraLink,
    Flex,
    Spinner,
    Circle,
    Badge,
    HStack,
    Icon
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { FiClock, FiUser } from 'react-icons/fi';
import CourseService from '../../apis/course.service';

export const ServiceCard = ({ title, imageUrl, level, duration, creator, skills = [], topics = [] }) => {
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

    const capitalizeFirstLetter = (string) => {
        return string?.charAt(0).toUpperCase() + string?.slice(1).toLowerCase();
    };

    return (
        <VStack spacing={4}>
            <Circle 
                size="180px"
                bg="white"
                boxShadow="lg"
                position="relative"
                transition="all 0.3s ease"
                _hover={{ 
                    transform: 'translateY(-8px)',
                    boxShadow: '2xl',
                    '& > .course-image': {
                        transform: 'scale(1.1)'
                    }
                }}
                overflow="hidden"
            >
                <Box
                    position="absolute"
                    top={3}
                    right={3}
                    zIndex={2}
                >
                    <Badge 
                        colorScheme={getLevelColor(level)}
                        px={2}
                        py={1}
                        borderRadius="full"
                        fontSize="xs"
                        boxShadow="sm"
                        textTransform="capitalize"
                    >
                        {capitalizeFirstLetter(level)}
                    </Badge>
                </Box>

                <Image 
                    className="course-image"
                    src={imageUrl || 'https://cdn-icons-png.flaticon.com/512/2919/2919592.png'} 
                    alt={title}
                    width="90px"
                    height="90px"
                    objectFit="contain"
                    transition="transform 0.3s ease"
                />
            </Circle>
            
            <VStack spacing={2} textAlign="center" maxW="180px">
                <Text 
                    fontSize="md" 
                    fontWeight="bold"
                    color="gray.700"
                    noOfLines={2}
                    lineHeight="tight"
                >
                    {title}
                </Text>
                
                <HStack spacing={4} fontSize="xs" color="gray.500">
                    <Flex align="center">
                        <Icon as={FiClock} mr={1} />
                        <Text>{duration} mins</Text>
                    </Flex>
                    <Flex align="center">
                        <Icon as={FiUser} mr={1} />
                        <Text>{creator?.fullName || 'Instructor'}</Text>
                    </Flex>
                </HStack>

                {(skills?.length > 0 || topics?.length > 0) && (
                    <HStack spacing={2} flexWrap="wrap" justify="center">
                        {skills?.map((skill, index) => (
                            <Badge 
                                key={`skill-${index}`}
                                colorScheme="blue"
                                variant="subtle"
                                fontSize="xs"
                                textTransform="capitalize"
                            >
                                {skill}
                            </Badge>
                        ))}
                        {topics?.map((topic, index) => (
                            <Badge 
                                key={`topic-${index}`}
                                colorScheme="purple"
                                variant="subtle"
                                fontSize="xs"
                                textTransform="capitalize"
                            >
                                {topic}
                            </Badge>
                        ))}
                    </HStack>
                )}
            </VStack>
        </VStack>
    );
};

const ServiceSection = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await CourseService.getAllCourses({ 
                    page: 1, 
                    limit: 8,
                    search: ''
                });
                setCourses(response.data.courses);
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    return (
        <Box py={16} bg="gray.50">
            <Container maxW="7xl">
                <Flex 
                    direction={{ base: 'column', md: 'row' }}
                    justify="space-between" 
                    align={{ base: 'center', md: 'end' }} 
                    mb={12}
                >
                    <VStack align={{ base: 'center', md: 'start' }} spacing={2} mb={{ base: 4, md: 0 }}>
                        <Heading 
                            size="lg"
                            bgGradient="linear(to-r, blue.400, blue.600)"
                            bgClip="text"
                            textAlign={{ base: 'center', md: 'left' }}
                        >
                            Our Courses
                        </Heading>
                        <Text 
                            color="gray.600" 
                            fontSize="lg"
                            textAlign={{ base: 'center', md: 'left' }}
                        >
                            Explore our comprehensive English learning courses
                        </Text>
                    </VStack>
                    <ChakraLink 
                        as={Link} 
                        to="/courses" 
                        color="blue.500" 
                        fontSize="md"
                        fontWeight="medium"
                        _hover={{
                            textDecoration: 'none',
                            color: 'blue.600',
                            transform: 'translateX(4px)'
                        }}
                        display="flex"
                        alignItems="center"
                        transition="all 0.3s ease"
                    >
                        View All Courses →
                    </ChakraLink>
                </Flex>

                {loading ? (
                    <Flex justify="center" align="center" minH="300px">
                        <Spinner 
                            size="xl" 
                            color="blue.500" 
                            thickness="4px"
                            speed="0.65s"
                        />
                    </Flex>
                ) : (
                    <SimpleGrid 
                        columns={{ base: 2, md: 3, lg: 4 }} 
                        spacing={{ base: 6, md: 8 }}
                        justifyItems="center"
                    >
                        {courses.map((course) => (
                            <Link key={course.id} to={`/courses/${course.id}`}>
                                <ServiceCard 
                                    title={course.title}
                                    imageUrl={course.thumbnail}
                                    level={course.level}
                                    duration={course.duration}
                                    creator={course.creator}
                                    skills={course.skills}
                                    topics={course.topics}
                                />
                            </Link>
                        ))}
                    </SimpleGrid>
                )}
            </Container>
        </Box>
    );
};

export default ServiceSection; 