import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Heading,
    Text,
    Button,
    VStack,
    HStack,
    Badge,
    Avatar,
    Divider,
    Icon,
    useToast,
    Textarea,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Flex,
    useColorModeValue,
    Tooltip,
    AvatarBadge
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { 
    FiMessageCircle, 
    FiEye, 
    FiThumbsUp, 
    FiCheckCircle, 
    FiMoreVertical, 
    FiEdit2, 
    FiTrash2,
    FiArrowLeft,
    FiSend,
    FiClock,
    FiTag
} from 'react-icons/fi';
import ForumService from '../../apis/forum.service';
import CommentService from '../../apis/comment.service';

const MotionBox = motion(Box);

const ForumDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [commentContent, setCommentContent] = useState('');
    const user = JSON.parse(localStorage.getItem('user'));

    // Color mode values
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const textColor = useColorModeValue('gray.600', 'gray.300');
    const headingColor = useColorModeValue('gray.800', 'white');
    const gradientBg = useColorModeValue(
        'linear(to-r, blue.100, purple.100)',
        'linear(to-r, blue.900, purple.900)'
    );
    const pageBgColor = useColorModeValue('gray.50', 'gray.900');
    const loadingBgColor = useColorModeValue('white', 'gray.800');
    const errorBgColor = useColorModeValue('white', 'gray.800');
    const mainBgColor = useColorModeValue('gray.50', 'gray.900');

    useEffect(() => {
        if (id === 'new') {
            navigate('/forum/create');
            return;
        }
        fetchPostAndComments();
    }, [id, navigate]);

    const fetchPostAndComments = async () => {
        try {
            setLoading(true);
            setError(null);
            const postResponse = await ForumService.getPostById(id);
            if (!postResponse.data) {
                throw new Error('Post not found');
            }
            setPost(postResponse.data);

            const commentsResponse = await CommentService.getComments({ forumPostId: id });
            setComments(commentsResponse.data.comments || []);
        } catch (error) {
            setError(error.message || 'Could not load post');
            toast({
                title: 'Error',
                description: error.message || 'Could not load post',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            if (error.response?.status === 404) {
                navigate('/forum');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleComment = async () => {
        try {
            const response = await CommentService.createComment({
                content: commentContent,
                forumPostId: id
            });

            setComments(prev => [response.data, ...prev]);
            setCommentContent('');

            toast({
                title: 'Success',
                description: 'Comment posted successfully',
                status: 'success',
                duration: 2000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message || 'Could not post comment',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleLikePost = async () => {
        try {
            await ForumService.toggleLike(id);
            setPost(prev => ({
                ...prev,
                likeCount: prev.likeCount + 1
            }));
            toast({
                title: 'Success',
                description: 'Post liked successfully',
                status: 'success',
                duration: 2000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message || 'Could not like post',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleDeletePost = async () => {
        try {
            await ForumService.deletePost(id);
            toast({
                title: 'Success',
                description: 'Post deleted successfully',
                status: 'success',
                duration: 2000,
                isClosable: true,
            });
            navigate('/forum');
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message || 'Could not delete post',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleMarkAsResolved = async () => {
        try {
            await ForumService.markAsResolved(id);
            setPost(prev => ({
                ...prev,
                isResolved: true
            }));
            toast({
                title: 'Success',
                description: 'Post marked as resolved',
                status: 'success',
                duration: 2000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message || 'Could not mark post as resolved',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const renderLoading = () => (
        <Box bg={pageBgColor} minH="100vh">
            <Container maxW="container.xl" py={8}>
                <MotionBox
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Box p={8} borderWidth="1px" borderRadius="xl" bg={loadingBgColor}>
                        <Text fontSize="lg">Loading post...</Text>
                    </Box>
                </MotionBox>
            </Container>
        </Box>
    );

    const renderError = () => (
        <Box bg={pageBgColor} minH="100vh">
            <Container maxW="container.xl" py={8}>
                <MotionBox
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Box p={8} borderWidth="1px" borderRadius="xl" bg={errorBgColor}>
                        <Text color="red.500" fontSize="lg" mb={4}>{error || 'Post not found'}</Text>
                        <Button
                            leftIcon={<FiArrowLeft />}
                            onClick={() => navigate('/forum')}
                            colorScheme="blue"
                        >
                            Back to Forum
                        </Button>
                    </Box>
                </MotionBox>
            </Container>
        </Box>
    );

    if (loading) return renderLoading();
    if (error || !post) return renderError();

    return (
        <Box bg={mainBgColor} minH="100vh">
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
                        <Button
                            leftIcon={<FiArrowLeft />}
                            variant="ghost"
                            onClick={() => navigate('/forum')}
                            color={headingColor}
                            mb={4}
                        >
                            Back to Forum
                        </Button>

                        <HStack spacing={4} mb={6}>
                            <Badge
                                px={3}
                                py={1}
                                borderRadius="full"
                                colorScheme={post.category === 'question' ? 'red' : 'blue'}
                                fontSize="md"
                            >
                                {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                            </Badge>
                            {post.isResolved && (
                                <Badge
                                    px={3}
                                    py={1}
                                    borderRadius="full"
                                    colorScheme="green"
                                    fontSize="md"
                                >
                                    <Icon as={FiCheckCircle} mr={2} />
                                    Resolved
                                </Badge>
                            )}
                        </HStack>

                        <Heading
                            size="2xl"
                            bgGradient="linear(to-r, blue.400, purple.500)"
                            bgClip="text"
                            letterSpacing="tight"
                            mb={6}
                        >
                            {post.title}
                        </Heading>

                        <HStack spacing={4}>
                            <Avatar
                                size="md"
                                src={post.author?.profileImage}
                                name={post.author?.fullName}
                            >
                                {post.author?.role === 'admin' && (
                                    <AvatarBadge boxSize='1.25em' bg='green.500' />
                                )}
                            </Avatar>
                            <VStack align="start" spacing={0}>
                                <Text fontWeight="bold" color={headingColor}>
                                    {post.author?.fullName}
                                </Text>
                                <HStack color={textColor} fontSize="sm">
                                    <Icon as={FiClock} />
                                    <Text>
                                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </Text>
                                </HStack>
                            </VStack>
                        </HStack>
                    </MotionBox>
                </Container>
            </Box>

            {/* Main Content */}
            <Box transform="translateY(-100px)" position="relative" zIndex={1}>
                <Container maxW="container.xl">
                    <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Box
                            bg={bgColor}
                            p={8}
                            borderRadius="xl"
                            boxShadow="xl"
                            borderWidth="1px"
                            borderColor={borderColor}
                            mb={8}
                        >
                            {/* Post Content */}
                            <Text
                                fontSize="lg"
                                whiteSpace="pre-wrap"
                                mb={6}
                                color={headingColor}
                            >
                                {post.content}
                            </Text>

                            {/* Tags */}
                            {post.tags && post.tags.length > 0 && (
                                <HStack spacing={2} mb={6} wrap="wrap">
                                    <Icon as={FiTag} color="gray.500" />
                                    {post.tags.map(tag => (
                                        <Badge
                                            key={tag}
                                            colorScheme="purple"
                                            variant="subtle"
                                            borderRadius="full"
                                        >
                                            #{tag}
                                        </Badge>
                                    ))}
                                </HStack>
                            )}

                            {/* Post Stats */}
                            <HStack spacing={6} justify="space-between">
                                <HStack spacing={6}>
                                    <Tooltip label="Like this post">
                                        <Button
                                            leftIcon={<Icon as={FiThumbsUp} />}
                                            variant="ghost"
                                            onClick={handleLikePost}
                                            color={textColor}
                                        >
                                            {post.likeCount} Likes
                                        </Button>
                                    </Tooltip>
                                    <HStack color={textColor}>
                                        <Icon as={FiEye} />
                                        <Text>{post.viewCount} Views</Text>
                                    </HStack>
                                    <HStack color={textColor}>
                                        <Icon as={FiMessageCircle} />
                                        <Text>{post.commentCount} Comments</Text>
                                    </HStack>
                                </HStack>

                                {(user?.id === post.authorId || user?.role === 'admin') && (
                                    <Menu>
                                        <MenuButton
                                            as={IconButton}
                                            icon={<FiMoreVertical />}
                                            variant="ghost"
                                            aria-label="Post options"
                                        />
                                        <MenuList>
                                            <MenuItem
                                                icon={<FiEdit2 />}
                                                onClick={() => navigate(`/forum/edit/${id}`)}
                                            >
                                                Edit Post
                                            </MenuItem>
                                            <MenuItem
                                                icon={<FiTrash2 />}
                                                onClick={onOpen}
                                                color="red.500"
                                            >
                                                Delete Post
                                            </MenuItem>
                                            {!post.isResolved && user?.id === post.authorId && (
                                                <MenuItem
                                                    icon={<FiCheckCircle />}
                                                    onClick={handleMarkAsResolved}
                                                >
                                                    Mark as Resolved
                                                </MenuItem>
                                            )}
                                        </MenuList>
                                    </Menu>
                                )}
                            </HStack>
                        </Box>

                        {/* Comments Section */}
                        <Box
                            bg={bgColor}
                            p={8}
                            borderRadius="xl"
                            boxShadow="xl"
                            borderWidth="1px"
                            borderColor={borderColor}
                        >
                            <Heading size="lg" mb={6} color={headingColor}>
                                Comments ({comments.length})
                            </Heading>

                            {/* Add Comment */}
                            <Box mb={8}>
                                <Textarea
                                    value={commentContent}
                                    onChange={(e) => setCommentContent(e.target.value)}
                                    placeholder="Share your thoughts..."
                                    size="lg"
                                    mb={4}
                                    minH="100px"
                                    _focus={{
                                        borderColor: 'blue.400',
                                        boxShadow: '0 0 0 1px blue.400',
                                    }}
                                />
                                <Flex justify="flex-end">
                                    <Button
                                        colorScheme="blue"
                                        size="lg"
                                        leftIcon={<FiSend />}
                                        onClick={handleComment}
                                        isDisabled={!commentContent.trim()}
                                    >
                                        Post Comment
                                    </Button>
                                </Flex>
                            </Box>

                            {/* Comments List */}
                            <VStack spacing={4} align="stretch">
                                {comments.map(comment => (
                                    <CommentItem
                                        key={comment.id}
                                        comment={comment}
                                        currentUser={user}
                                        onDelete={async () => {
                                            await CommentService.deleteComment(comment.id);
                                            setComments(prev => prev.filter(c => c.id !== comment.id));
                                        }}
                                    />
                                ))}
                            </VStack>
                        </Box>
                    </MotionBox>
                </Container>
            </Box>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Confirm Delete</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        Are you sure you want to delete this post? This action cannot be undone.
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="red" onClick={handleDeletePost}>
                            Delete
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

const CommentItem = ({ comment, currentUser, onDelete }) => {
    const commentBgColor = useColorModeValue('gray.50', 'gray.700');
    const commentBorderColor = useColorModeValue('gray.200', 'gray.600');

    return (
        <Box
            p={6}
            borderWidth="1px"
            borderColor={commentBorderColor}
            borderRadius="lg"
            bg={commentBgColor}
            transition="all 0.2s"
            _hover={{ shadow: 'md' }}
        >
            <HStack justify="space-between" mb={4}>
                <HStack spacing={4}>
                    <Avatar
                        size="sm"
                        src={comment.user?.profileImage}
                        name={comment.user?.fullName}
                    >
                        {comment.user?.role === 'admin' && (
                            <AvatarBadge boxSize='1em' bg='green.500' />
                        )}
                    </Avatar>
                    <VStack align="start" spacing={0}>
                        <Text fontWeight="bold">
                            {comment.user?.fullName}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                            {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </Text>
                    </VStack>
                </HStack>

                {(currentUser?.id === comment.userId || currentUser?.role === 'admin') && (
                    <IconButton
                        icon={<FiTrash2 />}
                        variant="ghost"
                        colorScheme="red"
                        size="sm"
                        onClick={onDelete}
                        aria-label="Delete comment"
                    />
                )}
            </HStack>

            <Text>{comment.content}</Text>
        </Box>
    );
};

export default ForumDetail; 