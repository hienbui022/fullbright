import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box,
    Button,
    Checkbox,
    Flex,
    Text,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Stack,
    useToast,
    Image,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    InputGroup,
    InputRightElement
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import AuthService from '../apis/auth.service';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [forgotEmail, setForgotEmail] = useState('');
    const navigate = useNavigate();
    const toast = useToast();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Validate required fields
            if (!formData.email || !formData.password) {
                throw new Error('Please fill in all required fields');
            }

            // Call login API
            const response = await AuthService.login(formData.email, formData.password);
            
            toast({
                title: 'Login Successful',
                status: 'success',
                duration: 3000,
                isClosable: true
            });

            // Redirect based on user role
            if (response.user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/');
            }
        } catch (error) {
            toast({
                title: 'Login Failed',
                description: error.response?.data?.message || error.message,
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        try {
            if (!forgotEmail) {
                throw new Error('Please enter your email');
            }

            await AuthService.forgotPassword(forgotEmail);
            
            toast({
                title: 'Password Reset Request Sent',
                description: 'Please check your email',
                status: 'success',
                duration: 3000,
                isClosable: true
            });
            
            setIsModalOpen(false);
        } catch (error) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || error.message,
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        }
    };

    return (
        <Stack minH={'100vh'} direction={{ base: 'column', md: 'row' }}>
            <Flex flex={1}>
                <Image
                    alt={'Learning English'}
                    objectFit={'cover'}
                    src={'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                />
            </Flex>
            <Flex p={8} flex={1} align={'center'} justify={'center'} bg="gray.50">
                <Stack spacing={8} w={'full'} maxW={'md'} bg="white" rounded={'xl'} boxShadow={'lg'} p={6}>
                    <Stack align={'center'}>
                        <Heading fontSize={'4xl'} color={'blue.600'}>Welcome to EnglishPro</Heading>
                        <Text fontSize={'lg'} color={'gray.600'}>
                            Your journey to English mastery starts here ✌️
                        </Text>
                    </Stack>
                    <form onSubmit={handleLogin}>
                        <Stack spacing={4}>
                            <FormControl id="email" isRequired>
                                <FormLabel>Email Address</FormLabel>
                                <Input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    bg={'gray.100'}
                                    border={0}
                                    color={'gray.500'}
                                    _placeholder={{
                                        color: 'gray.500',
                                    }}
                                />
                            </FormControl>
                            <FormControl id="password" isRequired>
                                <FormLabel>Password</FormLabel>
                                <InputGroup>
                                    <Input
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        bg={'gray.100'}
                                        border={0}
                                        color={'gray.500'}
                                        _placeholder={{
                                            color: 'gray.500',
                                        }}
                                    />
                                    <InputRightElement h={'full'}>
                                        <Button
                                            variant={'ghost'}
                                            onClick={() => setShowPassword((show) => !show)}
                                        >
                                            {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                                        </Button>
                                    </InputRightElement>
                                </InputGroup>
                            </FormControl>
                            <Stack spacing={6}>
                                <Stack
                                    direction={{ base: 'column', sm: 'row' }}
                                    align={'start'}
                                    justify={'space-between'}>
                                    <Checkbox colorScheme="blue">Remember me</Checkbox>
                                    <Text 
                                        color={'blue.500'} 
                                        onClick={() => setIsModalOpen(true)}
                                        cursor="pointer"
                                        _hover={{ color: 'blue.600' }}
                                    >
                                        Forgot Password?
                                    </Text>
                                </Stack>
                                <Button
                                    type="submit"
                                    bg={'blue.400'}
                                    color={'white'}
                                    _hover={{
                                        bg: 'blue.500',
                                    }}
                                    isLoading={loading}
                                >
                                    Sign In
                                </Button>
                            </Stack>
                        </Stack>
                    </form>
                    <Stack pt={6}>
                        <Text align={'center'}>
                            Don't have an account?{' '}
                            <Link 
                                to="/register" 
                                style={{ color: '#4299E1' }}
                                onMouseEnter={(e) => e.target.style.color = '#3182CE'}
                                onMouseLeave={(e) => e.target.style.color = '#4299E1'}
                            >
                                Register Now
                            </Link>
                        </Text>
                    </Stack>
                </Stack>
            </Flex>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Forgot Password</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl id="forgot-email" isRequired>
                            <FormLabel>Email Address</FormLabel>
                            <Input 
                                type="email" 
                                value={forgotEmail} 
                                onChange={(e) => setForgotEmail(e.target.value)} 
                                placeholder="Enter your email"
                                bg={'gray.100'}
                                border={0}
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button 
                            colorScheme="blue" 
                            mr={3} 
                            onClick={handleForgotPassword}
                        >
                            Send Request
                        </Button>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Stack>
    );
};

export default Login; 