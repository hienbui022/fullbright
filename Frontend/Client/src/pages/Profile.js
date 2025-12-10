import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    HStack,
    FormControl,
    FormLabel,
    Input,
    Button,
    Avatar,
    useToast,
    Spinner,
    Divider,
    Icon,
    Badge,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Image,
    SimpleGrid,
    Textarea
} from '@chakra-ui/react';
import { FiUser, FiMail, FiCalendar, FiEdit2, FiSave, FiX, FiLock, FiUpload } from 'react-icons/fi';
import UserService from '../apis/user.service';

const Profile = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        bio: ''
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                navigate('/login');
                return;
            }

            try {
                const userData = JSON.parse(userStr);
                const response = await UserService.getUserById(userData.id);
                
                if (response.success && response.data) {
                    const userData = response.data;
                    setUser(userData);
                    setFormData({
                        fullName: userData.fullName || '',
                        email: userData.email || '',
                        bio: userData.bio || ''
                    });
                    setImagePreview(userData.profileImage);
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load profile data',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [navigate, toast]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            let response;
            if (selectedImage) {
                const formData = new FormData();
                formData.append('image', selectedImage);
                response = await UserService.uploadProfileImage(user.id, formData);
            }

            response = await UserService.updateUser(user.id, formData);
            
            if (response.success) {
                // Update localStorage with new user data
                const updatedUser = { ...user, ...formData, profileImage: response.data.profileImage };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                toast({
                    title: 'Success',
                    description: 'Profile updated successfully',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                onClose();
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update profile',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setSaving(false);
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
            <Container maxW="3xl">
                <VStack align="stretch" spacing={8}>
                    {/* Profile Header */}
                    <Box bg="white" p={8} rounded="xl" boxShadow="md">
                        <VStack spacing={6}>
                            <Box position="relative">
                                <Avatar
                                    size="2xl"
                                    src={imagePreview}
                                    name={user?.fullName}
                                    bg="blue.500"
                                />
                                <Button
                                    size="sm"
                                    position="absolute"
                                    bottom={0}
                                    right={0}
                                    colorScheme="blue"
                                    rounded="full"
                                    onClick={onOpen}
                                >
                                    <Icon as={FiEdit2} />
                                </Button>
                            </Box>
                            <VStack spacing={1}>
                                <Heading size="lg">{user?.fullName}</Heading>
                                <Text color="gray.600">{user?.email}</Text>
                                <Badge colorScheme="blue">{user?.role}</Badge>
                            </VStack>
                        </VStack>
                    </Box>

                    {/* Profile Information */}
                    <Box bg="white" p={8} rounded="xl" boxShadow="md">
                        <VStack align="stretch" spacing={6}>
                            <Heading size="md">Profile Information</Heading>
                            <Divider />
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                <VStack align="start" spacing={4}>
                                    <HStack>
                                        <Icon as={FiUser} color="blue.500" />
                                        <Text fontWeight="medium">Full Name</Text>
                                    </HStack>
                                    <Text color="gray.600">{user?.fullName}</Text>
                                </VStack>
                                <VStack align="start" spacing={4}>
                                    <HStack>
                                        <Icon as={FiMail} color="blue.500" />
                                        <Text fontWeight="medium">Email</Text>
                                    </HStack>
                                    <Text color="gray.600">{user?.email}</Text>
                                </VStack>
                                <VStack align="start" spacing={4}>
                                    <HStack>
                                        <Icon as={FiCalendar} color="blue.500" />
                                        <Text fontWeight="medium">Joined Date</Text>
                                    </HStack>
                                    <Text color="gray.600">
                                        {new Date(user?.createdAt).toLocaleDateString()}
                                    </Text>
                                </VStack>
                                <VStack align="start" spacing={4}>
                                    <HStack>
                                        <Icon as={FiLock} color="blue.500" />
                                        <Text fontWeight="medium">Account Status</Text>
                                    </HStack>
                                    <Badge colorScheme={user?.isActive ? 'green' : 'red'}>
                                        {user?.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </VStack>
                            </SimpleGrid>
                        </VStack>
                    </Box>

                    {/* Edit Profile Modal */}
                    <Modal isOpen={isOpen} onClose={onClose} size="xl">
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader>Edit Profile</ModalHeader>
                            <ModalCloseButton />
                            <ModalBody pb={6}>
                                <VStack spacing={6}>
                                    <Box position="relative" w="full">
                                        <Avatar
                                            size="xl"
                                            src={imagePreview}
                                            name={formData.fullName}
                                            bg="blue.500"
                                        />
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            display="none"
                                            id="image-upload"
                                        />
                                        <label htmlFor="image-upload">
                                            <Button
                                                as="span"
                                                size="sm"
                                                position="absolute"
                                                bottom={0}
                                                right={0}
                                                colorScheme="blue"
                                                rounded="full"
                                                cursor="pointer"
                                            >
                                                <Icon as={FiUpload} />
                                            </Button>
                                        </label>
                                    </Box>

                                    <FormControl>
                                        <FormLabel>Full Name</FormLabel>
                                        <Input
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            placeholder="Enter your full name"
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Email</FormLabel>
                                        <Input
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="Enter your email"
                                            isReadOnly
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Bio</FormLabel>
                                        <Textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            placeholder="Tell us about yourself"
                                            rows={4}
                                        />
                                    </FormControl>
                                </VStack>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="ghost" mr={3} onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    colorScheme="blue"
                                    onClick={handleSubmit}
                                    isLoading={saving}
                                    leftIcon={<Icon as={FiSave} />}
                                >
                                    Save Changes
                                </Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                </VStack>
            </Container>
        </Box>
    );
};

export default Profile; 