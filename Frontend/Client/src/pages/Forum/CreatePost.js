import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Heading,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Button,
    Select,
    VStack,
    useToast,
    Tag,
    TagLabel,
    TagCloseButton,
    HStack,
    Text,
    Icon,
    useColorModeValue,
    Flex,
    Tooltip,
    InputGroup,
    InputLeftElement,
    InputRightElement
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiEdit3, FiHash, FiX, FiArrowLeft, FiSend, FiAlertCircle } from 'react-icons/fi';
import ForumService from '../../apis/forum.service';

const MotionBox = motion(Box);

const CATEGORIES = [
    { value: 'question', label: 'Question', description: 'Ask for help or clarification' },
    { value: 'discussion', label: 'Discussion', description: 'Start a conversation about a topic' },
    { value: 'sharing', label: 'Experience', description: 'Share your knowledge or experience' },
    { value: 'announcement', label: 'Announcement', description: 'Make an important announcement' }
];

const CreatePost = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: '',
        tags: []
    });
    const [tagInput, setTagInput] = useState('');

    // Color mode values
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const textColor = useColorModeValue('gray.600', 'gray.300');
    const headingColor = useColorModeValue('gray.800', 'white');
    const gradientBg = useColorModeValue(
        'linear(to-r, blue.100, purple.100)',
        'linear(to-r, blue.900, purple.900)'
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (formData.tags.includes(tagInput.trim())) {
                toast({
                    title: 'Tag already exists',
                    status: 'warning',
                    duration: 2000,
                    isClosable: true,
                });
                return;
            }
            if (formData.tags.length >= 5) {
                toast({
                    title: 'Maximum 5 tags allowed',
                    status: 'warning',
                    duration: 2000,
                    isClosable: true,
                });
                return;
            }
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.content.trim() || !formData.category) {
            toast({
                title: 'Required Fields Missing',
                description: 'Please fill in all required fields',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            setLoading(true);
            const response = await ForumService.createPost(formData);
            toast({
                title: 'Success!',
                description: 'Your post has been created successfully',
                status: 'success',
                duration: 2000,
                isClosable: true,
            });
            navigate(`/forum/${response.data.id}`);
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message || 'Could not create post',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box bg={useColorModeValue('gray.50', 'gray.900')} minH="100vh">
            {/* Hero Section */}
            <Box
                bgGradient={gradientBg}
                pt={20}
                pb={32}
                px={8}
                position="relative"
                overflow="hidden"
            >
                <Container maxW="container.xl">
                    <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <HStack spacing={4} mb={4}>
                            <Button
                                leftIcon={<FiArrowLeft />}
                                variant="ghost"
                                onClick={() => navigate('/forum')}
                                color={headingColor}
                                _hover={{ bg: 'whiteAlpha.200' }}
                            >
                                Back to Forum
                            </Button>
                        </HStack>
                        <Heading
                            size="2xl"
                            bgGradient="linear(to-r, blue.400, purple.500)"
                            bgClip="text"
                            letterSpacing="tight"
                        >
                            Create New Post
                        </Heading>
                        <Text fontSize="xl" color={textColor} mt={4} maxW="2xl">
                            Share your thoughts, ask questions, or start a discussion with the community
                        </Text>
                    </MotionBox>
                </Container>

                {/* Decorative elements */}
                <Box
                    position="absolute"
                    top="50%"
                    right="0"
                    transform="translateY(-50%)"
                    opacity={0.1}
                    fontSize="20rem"
                    color="purple.500"
                    zIndex={0}
                >
                    ✎
                </Box>
            </Box>

            {/* Main Content */}
            <Box
                transform="translateY(-100px)"
                position="relative"
                zIndex={1}
            >
                <Container maxW="container.xl">
                    <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Box
                            as="form"
                            onSubmit={handleSubmit}
                            bg={bgColor}
                            p={8}
                            borderRadius="xl"
                            boxShadow="xl"
                            borderWidth="1px"
                            borderColor={borderColor}
                        >
                            <VStack spacing={6} align="stretch">
                                <FormControl isRequired>
                                    <FormLabel fontSize="lg">Title</FormLabel>
                                    <InputGroup size="lg">
                                        <InputLeftElement pointerEvents="none">
                                            <Icon as={FiEdit3} color="gray.400" />
                                        </InputLeftElement>
                                        <Input
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            placeholder="Enter a descriptive title for your post"
                                            _focus={{
                                                borderColor: 'blue.400',
                                                boxShadow: '0 0 0 1px blue.400',
                                            }}
                                        />
                                    </InputGroup>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="lg">Content</FormLabel>
                                    <Textarea
                                        name="content"
                                        value={formData.content}
                                        onChange={handleInputChange}
                                        placeholder="Share your thoughts, questions, or ideas in detail..."
                                        minH="200px"
                                        size="lg"
                                        _focus={{
                                            borderColor: 'blue.400',
                                            boxShadow: '0 0 0 1px blue.400',
                                        }}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="lg">Category</FormLabel>
                                    <Select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        placeholder="Select a category"
                                        size="lg"
                                        _focus={{
                                            borderColor: 'blue.400',
                                            boxShadow: '0 0 0 1px blue.400',
                                        }}
                                    >
                                        {CATEGORIES.map(category => (
                                            <option key={category.value} value={category.value}>
                                                {category.label} - {category.description}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="lg">Tags</FormLabel>
                                    <InputGroup size="lg">
                                        <InputLeftElement pointerEvents="none">
                                            <Icon as={FiHash} color="gray.400" />
                                        </InputLeftElement>
                                        <Input
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={handleAddTag}
                                            placeholder="Add tags to help others find your post (press Enter to add)"
                                            _focus={{
                                                borderColor: 'blue.400',
                                                boxShadow: '0 0 0 1px blue.400',
                                            }}
                                        />
                                        {tagInput && (
                                            <InputRightElement width="4.5rem">
                                                <Button
                                                    h="1.75rem"
                                                    size="sm"
                                                    onClick={() => setTagInput('')}
                                                >
                                                    <Icon as={FiX} />
                                                </Button>
                                            </InputRightElement>
                                        )}
                                    </InputGroup>
                                    <Flex align="center" mt={2}>
                                        <Icon as={FiAlertCircle} color="gray.500" mr={2} />
                                        <Text fontSize="sm" color="gray.500">
                                            Maximum 5 tags allowed
                                        </Text>
                                    </Flex>
                                    {formData.tags.length > 0 && (
                                        <HStack spacing={2} mt={4} flexWrap="wrap">
                                            {formData.tags.map(tag => (
                                                <Tag
                                                    key={tag}
                                                    size="lg"
                                                    borderRadius="full"
                                                    variant="subtle"
                                                    colorScheme="blue"
                                                    my={1}
                                                >
                                                    <TagLabel>#{tag}</TagLabel>
                                                    <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                                                </Tag>
                                            ))}
                                        </HStack>
                                    )}
                                </FormControl>

                                <Flex justify="flex-end" mt={6} gap={4}>
                                    <Button
                                        variant="ghost"
                                        onClick={() => navigate('/forum')}
                                        size="lg"
                                        leftIcon={<FiX />}
                                    >
                                        Cancel
                                    </Button>
                                    <Tooltip label="Create your post" placement="top">
                                        <Button
                                            type="submit"
                                            colorScheme="blue"
                                            isLoading={loading}
                                            loadingText="Creating..."
                                            size="lg"
                                            leftIcon={<FiSend />}
                                        >
                                            Create Post
                                        </Button>
                                    </Tooltip>
                                </Flex>
                            </VStack>
                        </Box>
                    </MotionBox>
                </Container>
            </Box>
        </Box>
    );
};

export default CreatePost; 