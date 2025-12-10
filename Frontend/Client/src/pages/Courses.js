import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Heading,
    SimpleGrid,
    VStack,
    Text,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    HStack,
    Spinner,
    useToast
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import CourseService from '../apis/course.service';
import { ServiceCard } from '../components/home-3/ServiceSection';

const Courses = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [selectedSkill, setSelectedSkill] = useState('');
    const toast = useToast();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await CourseService.getAllCourses({
                page: 1,
                limit: 100,
                search: searchTerm
            });
            setCourses(response.data.courses);
        } catch (error) {
            console.error('Error fetching courses:', error);
            toast({
                title: 'Error',
                description: 'Failed to load courses',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCourseClick = (courseId) => {
        navigate(`/courses/${courseId}`);
    };

    const filteredCourses = courses.filter(course => {
        const matchesLevel = !selectedLevel || course.level === selectedLevel;
        const matchesSkill = !selectedSkill || course.skills?.includes(selectedSkill);
        return matchesLevel && matchesSkill;
    });

    return (
        <Box py={12} bg="gray.50" minH="100vh">
            <Container maxW="7xl">
                <VStack spacing={8} align="stretch">
                    <VStack align="start" spacing={2}>
                        <Heading
                            size="xl"
                            bgGradient="linear(to-r, blue.400, blue.600)"
                            bgClip="text"
                        >
                            All Courses
                        </Heading>
                        <Text color="gray.600" fontSize="lg">
                            Browse our comprehensive collection of English learning courses
                        </Text>
                    </VStack>

                    {/* Filters */}
                    <HStack spacing={4} wrap="wrap">
                        <InputGroup maxW="320px">
                            <InputLeftElement pointerEvents="none">
                                <FiSearch color="gray.300" />
                            </InputLeftElement>
                            <Input
                                placeholder="Search courses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        fetchCourses();
                                    }
                                }}
                            />
                        </InputGroup>

                        <Select
                            placeholder="Select Level"
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                            maxW="200px"
                        >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </Select>

                        <Select
                            placeholder="Select Skill"
                            value={selectedSkill}
                            onChange={(e) => setSelectedSkill(e.target.value)}
                            maxW="200px"
                        >
                            <option value="speaking">Speaking</option>
                            <option value="writing">Writing</option>
                            <option value="reading">Reading</option>
                            <option value="listening">Listening</option>
                            <option value="grammar">Grammar</option>
                            <option value="vocabulary">Vocabulary</option>
                        </Select>
                    </HStack>

                    {loading ? (
                        <Box display="flex" justifyContent="center" py={10}>
                            <Spinner size="xl" color="blue.500" thickness="4px" />
                        </Box>
                    ) : (
                        <SimpleGrid
                            columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
                            spacing={8}
                            pt={4}
                        >
                            {filteredCourses.map((course) => (
                                <Box
                                    key={course.id}
                                    onClick={() => handleCourseClick(course.id)}
                                    cursor="pointer"
                                    transition="all 0.2s"
                                    _hover={{ transform: 'translateY(-4px)' }}
                                >
                                    <ServiceCard
                                        title={course.title}
                                        imageUrl={course.thumbnail}
                                        level={course.level}
                                        duration={course.duration}
                                        creator={course.creator}
                                        skills={course.skills}
                                        topics={course.topics}
                                    />
                                </Box>
                            ))}
                        </SimpleGrid>
                    )}

                    {!loading && filteredCourses.length === 0 && (
                        <Box textAlign="center" py={10}>
                            <Text color="gray.500">No courses found matching your criteria</Text>
                        </Box>
                    )}
                </VStack>
            </Container>
        </Box>
    );
};

export default Courses; 