import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Heading,
    Text,
    Button,
    Input,
    Select,
    HStack,
    VStack,
    Badge,
    useToast,
    Flex,
    Icon,
    Divider,
    Avatar,
    Link as ChakraLink,
    InputGroup,
    InputLeftElement,
    Tag,
    TagLabel,
    useColorModeValue,
    Skeleton,
    Stack,
    Image,
    Tooltip,
    IconButton
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { 
    FiPlus, 
    FiMessageCircle, 
    FiEye, 
    FiThumbsUp, 
    FiCheckCircle, 
    FiSearch, 
    FiFilter,
    FiTrendingUp,
    FiClock,
    FiMessageSquare
} from 'react-icons/fi';
import ForumService from '../../apis/forum.service';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const ForumStatCard = ({ icon, label, value, color }) => (
    <Box
        p={4}
        bg={useColorModeValue('white', 'gray.800')}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
        transition="all 0.2s"
    >
        <VStack spacing={2}>
            <Icon as={icon} fontSize="2xl" color={color} />
            <Text fontSize="lg" fontWeight="bold">{value}</Text>
            <Text fontSize="sm" color="gray.500">{label}</Text>
        </VStack>
    </Box>
);

const ForumList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useState({
        page: 1,
        limit: 10,
        search: '',
        category: '',
        sort: 'newest'
    });
    const toast = useToast();

    // Color mode values
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');
    const textColor = useColorModeValue('gray.600', 'gray.300');
    const headingColor = useColorModeValue('gray.800', 'white');
    const gradientBg = useColorModeValue(
        'linear(to-r, blue.100, purple.100)',
        'linear(to-r, blue.900, purple.900)'
    );

    useEffect(() => {
        fetchPosts();
    }, [searchParams]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await ForumService.getAllPosts(searchParams);
            setPosts(response.data.posts);
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message || 'Could not load posts',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchParams(prev => ({
            ...prev,
            search: e.target.value,
            page: 1
        }));
    };

    const handleCategoryChange = (e) => {
        setSearchParams(prev => ({
            ...prev,
            category: e.target.value,
            page: 1
        }));
    };

    const handleSortChange = (e) => {
        setSearchParams(prev => ({
            ...prev,
            sort: e.target.value,
            page: 1
        }));
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'question':
                return 'red';
            case 'discussion':
                return 'blue';
            case 'sharing':
                return 'green';
            default:
                return 'gray';
        }
    };

    const getCategoryLabel = (category) => {
        switch (category) {
            case 'question':
                return 'Question';
            case 'discussion':
                return 'Discussion';
            case 'sharing':
                return 'Experience';
            default:
                return category;
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
                    <MotionFlex
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        direction="column"
                        align="center"
                        textAlign="center"
                        gap={4}
                    >
                        <Heading
                            size="2xl"
                            bgGradient="linear(to-r, blue.400, purple.500)"
                            bgClip="text"
                            letterSpacing="tight"
                        >
                            Community Forum
                        </Heading>
                        <Text fontSize="xl" color={textColor} maxW="2xl">
                            Join our vibrant community to share knowledge, ask questions, and connect with fellow learners.
                            Explore discussions on various topics and grow together.
                        </Text>
                        <HStack spacing={8} mt={8}>
                            <ForumStatCard
                                icon={FiMessageSquare}
                                label="Active Discussions"
                                value="1.2K+"
                                color="blue.400"
                            />
                            <ForumStatCard
                                icon={FiTrendingUp}
                                label="Growing Members"
                                value="5K+"
                                color="purple.400"
                            />
                            <ForumStatCard
                                icon={FiClock}
                                label="Daily Active Users"
                                value="500+"
                                color="green.400"
                            />
                        </HStack>
                    </MotionFlex>
                </Container>
                
                {/* Decorative elements */}
                <Box
                    position="absolute"
                    top="50%"
                    left="0"
                    transform="translateY(-50%)"
                    opacity={0.1}
                    fontSize="20rem"
                    color="blue.500"
                    zIndex={0}
                >
                    ⟨⟨
                </Box>
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
                    ⟩⟩
                </Box>
            </Box>

            {/* Main Content */}
            <Box
                transform="translateY(-100px)"
                position="relative"
                zIndex={1}
            >
                <Container maxW="container.xl">
                    <MotionFlex
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        direction="column"
                        gap={8}
                    >
                        {/* Control Panel */}
                        <Box
                            bg={bgColor}
                            p={6}
                            borderRadius="xl"
                            boxShadow="xl"
                            borderWidth="1px"
                            borderColor={borderColor}
                        >
                            <Flex justify="space-between" align="center" mb={6}>
                                <VStack align="start" spacing={1}>
                                    <HStack>
                                        <Icon as={FiMessageCircle} fontSize="2xl" color="blue.400" />
                                        <Heading size="lg" color={headingColor}>
                                            Latest Discussions
                                        </Heading>
                                    </HStack>
                                    <Text color={textColor}>
                                        Explore the latest topics and join the conversation
                                    </Text>
                                </VStack>
                                <Tooltip label="Start a new discussion" placement="left">
                                    <Button
                                        as={Link}
                                        to="/forum/new"
                                        colorScheme="blue"
                                        leftIcon={<Icon as={FiPlus} />}
                                        size="lg"
                                        _hover={{
                                            transform: 'translateY(-2px)',
                                            boxShadow: 'lg',
                                        }}
                                        transition="all 0.2s"
                                    >
                                        New Post
                                    </Button>
                                </Tooltip>
                            </Flex>

                            <Stack
                                direction={{ base: 'column', md: 'row' }}
                                spacing={4}
                                w="full"
                            >
                                <InputGroup size="lg" flex={2}>
                                    <InputLeftElement pointerEvents="none">
                                        <Icon as={FiSearch} color="gray.400" />
                                    </InputLeftElement>
                                    <Input
                                        placeholder="Search discussions..."
                                        value={searchParams.search}
                                        onChange={handleSearch}
                                        bg={bgColor}
                                        _focus={{
                                            borderColor: 'blue.400',
                                            boxShadow: '0 0 0 1px blue.400',
                                        }}
                                    />
                                </InputGroup>
                                <Select
                                    size="lg"
                                    value={searchParams.category}
                                    onChange={handleCategoryChange}
                                    bg={bgColor}
                                    flex={1}
                                    icon={<FiFilter />}
                                >
                                    <option value="">All Categories</option>
                                    <option value="question">Questions</option>
                                    <option value="discussion">Discussions</option>
                                    <option value="sharing">Experience Sharing</option>
                                </Select>
                                <Select
                                    size="lg"
                                    value={searchParams.sort}
                                    onChange={handleSortChange}
                                    bg={bgColor}
                                    flex={1}
                                >
                                    <option value="newest">Most Recent</option>
                                    <option value="popular">Most Popular</option>
                                    <option value="mostCommented">Most Discussed</option>
                                </Select>
                            </Stack>
                        </Box>

                        {/* Posts List */}
                        <VStack spacing={4} align="stretch">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <Skeleton key={i} height="200px" borderRadius="lg" />
                                ))
                            ) : posts.length === 0 ? (
                                <Box
                                    p={8}
                                    textAlign="center"
                                    bg={bgColor}
                                    borderRadius="lg"
                                    borderWidth="1px"
                                    borderColor={borderColor}
                                >
                                    <Icon as={FiMessageCircle} fontSize="5xl" color="gray.400" mb={4} />
                                    <Heading size="md" mb={2}>No Discussions Found</Heading>
                                    <Text color={textColor}>
                                        Be the first to start a discussion in this category!
                                    </Text>
                                    <Button
                                        as={Link}
                                        to="/forum/new"
                                        colorScheme="blue"
                                        mt={4}
                                        leftIcon={<Icon as={FiPlus} />}
                                    >
                                        Create New Post
                                    </Button>
                                </Box>
                            ) : (
                                posts.map(post => (
                                    <MotionBox
                                        key={post.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Box
                                            p={6}
                                            bg={bgColor}
                                            borderRadius="lg"
                                            borderWidth="1px"
                                            borderColor={borderColor}
                                            _hover={{
                                                transform: 'translateY(-2px)',
                                                shadow: 'lg',
                                                borderColor: 'blue.400',
                                            }}
                                            transition="all 0.2s"
                                        >
                                            <Flex justify="space-between" align="start">
                                                <VStack align="start" flex={1} spacing={3}>
                                                    <HStack spacing={2} flexWrap="wrap">
                                                        <Badge
                                                            colorScheme={getCategoryColor(post.category)}
                                                            px={3}
                                                            py={1}
                                                            borderRadius="full"
                                                            textTransform="none"
                                                            fontWeight="medium"
                                                        >
                                                            {getCategoryLabel(post.category)}
                                                        </Badge>
                                                        {post.isResolved && (
                                                            <Badge
                                                                colorScheme="green"
                                                                px={3}
                                                                py={1}
                                                                borderRadius="full"
                                                                display="flex"
                                                                alignItems="center"
                                                                gap={1}
                                                            >
                                                                <Icon as={FiCheckCircle} />
                                                                Resolved
                                                            </Badge>
                                                        )}
                                                        {post.tags?.map(tag => (
                                                            <Tag
                                                                key={tag}
                                                                size="md"
                                                                borderRadius="full"
                                                                variant="subtle"
                                                                colorScheme="blue"
                                                                cursor="pointer"
                                                                _hover={{
                                                                    bg: 'blue.100',
                                                                    color: 'blue.700'
                                                                }}
                                                            >
                                                                <TagLabel>#{tag}</TagLabel>
                                                            </Tag>
                                                        ))}
                                                    </HStack>

                                                    <ChakraLink
                                                        as={Link}
                                                        to={`/forum/${post.id}`}
                                                        fontSize="xl"
                                                        fontWeight="bold"
                                                        color={headingColor}
                                                        _hover={{
                                                            color: 'blue.500',
                                                            textDecoration: 'none'
                                                        }}
                                                    >
                                                        {post.title}
                                                    </ChakraLink>

                                                    <Text
                                                        noOfLines={2}
                                                        color={textColor}
                                                        fontSize="md"
                                                    >
                                                        {post.content}
                                                    </Text>
                                                </VStack>
                                            </Flex>

                                            <Divider my={4} />

                                            <Flex
                                                justify="space-between"
                                                align="center"
                                                wrap={{ base: 'wrap', md: 'nowrap' }}
                                                gap={4}
                                            >
                                                <HStack spacing={4}>
                                                    <Avatar
                                                        size="md"
                                                        src={post.author?.profileImage}
                                                        name={post.author?.fullName}
                                                    />
                                                    <VStack align="start" spacing={0}>
                                                        <Text fontWeight="medium" color={headingColor}>
                                                            {post.author?.fullName}
                                                        </Text>
                                                        <Text fontSize="sm" color={textColor}>
                                                            {new Date(post.createdAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </Text>
                                                    </VStack>
                                                </HStack>

                                                <HStack
                                                    spacing={6}
                                                    color={textColor}
                                                    fontSize="sm"
                                                    fontWeight="medium"
                                                >
                                                    <Tooltip label="Views">
                                                        <HStack spacing={2}>
                                                            <Icon as={FiEye} />
                                                            <Text>{post.viewCount} views</Text>
                                                        </HStack>
                                                    </Tooltip>
                                                    <Tooltip label="Comments">
                                                        <HStack spacing={2}>
                                                            <Icon as={FiMessageCircle} />
                                                            <Text>{post.commentCount} comments</Text>
                                                        </HStack>
                                                    </Tooltip>
                                                    <Tooltip label="Likes">
                                                        <HStack spacing={2}>
                                                            <Icon as={FiThumbsUp} />
                                                            <Text>{post.likeCount} likes</Text>
                                                        </HStack>
                                                    </Tooltip>
                                                </HStack>
                                            </Flex>
                                        </Box>
                                    </MotionBox>
                                ))
                            )}
                        </VStack>
                    </MotionFlex>
                </Container>
            </Box>
        </Box>
    );
};

export default ForumList; 