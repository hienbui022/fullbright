import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Flex,
    Box,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    HStack,
    InputRightElement,
    Stack,
    Button,
    Heading,
    Text,
    useColorModeValue,
    useToast,
    Icon,
    VStack
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { FaGraduationCap, FaBook, FaGlobe } from 'react-icons/fa';
import AuthService from '../apis/auth.service';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: ''
    });
    const navigate = useNavigate();
    const toast = useToast();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Validate required fields
            if (!formData.username || !formData.email || !formData.password || !formData.fullName) {
                throw new Error('Please fill in all required fields');
            }

            // Validate email format
            if (!/\S+@\S+\.\S+/.test(formData.email)) {
                throw new Error('Invalid email format');
            }

            // Call register API
            await AuthService.register(formData);

            toast({
                title: 'Registration Successful',
                description: 'Please login to continue',
                status: 'success',
                duration: 3000,
                isClosable: true
            });

            navigate('/login');
        } catch (error) {
            toast({
                title: 'Registration Failed',
                description: error.response?.data?.message || error.message,
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Flex
            minH={'100vh'}
            align={'center'}
            justify={'center'}
            bg={useColorModeValue('gray.50', 'gray.800')}
            backgroundImage="url('https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')"
            backgroundSize="cover"
            backgroundPosition="center"
            position="relative"
        >
            <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg="blackAlpha.600"
                zIndex={0}
            />

            <Stack
                spacing={8}
                mx={'auto'}
                maxW={'lg'}
                py={12}
                px={6}
                position="relative"
                zIndex={1}
            >
                <Stack align={'center'} spacing={6}>
                    <Icon as={FaGraduationCap} w={20} h={20} color="white" />
                    <Heading
                        fontSize={'4xl'}
                        textAlign={'center'}
                        color="white"
                        textShadow="2px 2px 4px rgba(0,0,0,0.4)"
                    >
                        Join Our English Learning Community
                    </Heading>
                    <Text fontSize={'lg'} color={'gray.200'} textAlign="center">
                        Start your journey to English mastery today!
                        Access premium lessons, native speakers, and interactive exercises
                    </Text>
                </Stack>

                <Box
                    rounded={'xl'}
                    bg={useColorModeValue('white', 'gray.700')}
                    boxShadow={'2xl'}
                    backdropFilter="blur(10px)"
                    p={8}
                    borderWidth={1}
                    borderColor="blue.400"
                >
                    <Stack spacing={4} as="form" onSubmit={handleRegister}>
                        <HStack>
                            <Box>
                                <FormControl id="username" isRequired>
                                    <FormLabel>Username</FormLabel>
                                    <Input
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        type="text"
                                        bg="white"
                                        borderColor="blue.200"
                                        _hover={{ borderColor: 'blue.300' }}
                                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #4299E1' }}
                                    />
                                </FormControl>
                            </Box>
                            <Box>
                                <FormControl id="fullName" isRequired>
                                    <FormLabel>Full Name</FormLabel>
                                    <Input
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        type="text"
                                        bg="white"
                                        borderColor="blue.200"
                                        _hover={{ borderColor: 'blue.300' }}
                                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #4299E1' }}
                                    />
                                </FormControl>
                            </Box>
                        </HStack>

                        <FormControl id="email" isRequired>
                            <FormLabel>Email Address</FormLabel>
                            <Input
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                type="email"
                                bg="white"
                                borderColor="blue.200"
                                _hover={{ borderColor: 'blue.300' }}
                                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #4299E1' }}
                            />
                        </FormControl>

                        <FormControl id="password" isRequired>
                            <FormLabel>Password</FormLabel>
                            <InputGroup>
                                <Input
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    type={showPassword ? 'text' : 'password'}
                                    bg="white"
                                    borderColor="blue.200"
                                    _hover={{ borderColor: 'blue.300' }}
                                    _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #4299E1' }}
                                />
                                <InputRightElement h={'full'}>
                                    <Button
                                        variant={'ghost'}
                                        onClick={() => setShowPassword((showPassword) => !showPassword)}
                                    >
                                        {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                                    </Button>
                                </InputRightElement>
                            </InputGroup>
                        </FormControl>

                        <Stack spacing={10} pt={2}>
                            <Button
                                type="submit"
                                loadingText="Registering..."
                                size="lg"
                                bg={'blue.400'}
                                color={'white'}
                                _hover={{
                                    bg: 'blue.500',
                                    transform: 'translateY(-2px)',
                                    boxShadow: 'lg',
                                }}
                                _active={{
                                    bg: 'blue.600',
                                }}
                                transition="all 0.2s"
                                isLoading={loading}
                            >
                                Register
                            </Button>
                        </Stack>

                        <Stack pt={6} direction="row" spacing={1} justify="center">
                            <Text color={'gray.600'}>Already have an account?</Text>
                            <Link to="/login">
                                <Text color={'blue.400'} _hover={{ color: 'blue.500', textDecoration: 'underline' }}>
                                    Log in
                                </Text>
                            </Link>
                        </Stack>

                        <Stack direction="row" justify="center" spacing={6} mt={4}>
                            <VStack>
                                <Icon as={FaBook} w={6} h={6} color="blue.400" />
                                <Text fontSize="sm" color="gray.600" textAlign="center">
                                    Premium Content
                                </Text>
                            </VStack>
                            <VStack>
                                <Icon as={FaGlobe} w={6} h={6} color="blue.400" />
                                <Text fontSize="sm" color="gray.600" textAlign="center">
                                    Live Classes
                                </Text>
                            </VStack>
                            <VStack>
                                <Icon as={FaGraduationCap} w={6} h={6} color="blue.400" />
                                <Text fontSize="sm" color="gray.600" textAlign="center">
                                    Certificates
                                </Text>
                            </VStack>
                        </Stack>
                    </Stack>
                </Box>
            </Stack>
        </Flex>
    );
};

export default Register; 