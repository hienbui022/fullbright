import React from 'react';
import {
    Box,
    Container,
    Heading,
    Text,
    Image,
    SimpleGrid,
    VStack,
    Button,
    useColorModeValue,
    Flex
} from '@chakra-ui/react';

const Introduction = () => {
    return (
        <Box bg={useColorModeValue('gray.50', 'gray.900')}>
            {/* Hero Section */}
            <Box bg="blue.600" color="white" py={20}>
                <Container maxW="7xl">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
                        <VStack align="flex-start" spacing={5}>
                            <Heading size="2xl">FULLBRIGHT ENGLISH</Heading>
                            <Text fontSize="xl" opacity={0.9}>
                                A hub of excellence dedicated to fostering education, innovation, and community engagement
                            </Text>
                            <Button 
                                size="lg" 
                                colorScheme="whiteAlpha"
                                _hover={{ bg: 'whiteAlpha.300' }}
                            >
                                Explore Our Programs
                            </Button>
                        </VStack>
                        <Box>
                            <Image 
                                src="https://your-domain.com/path-to-logo.png" // Replace with your logo
                                alt="Fullbright English Logo"
                                mx="auto"
                                w="300px"
                            />
                        </Box>
                    </SimpleGrid>
                </Container>
            </Box>

            {/* Main Content */}
            <Container maxW="7xl" py={20}>
                <VStack spacing={16}>
                    {/* About Section */}
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                        <Box>
                            <Image
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
                                alt="Students studying"
                                borderRadius="lg"
                                w="100%"
                                h="400px"
                                objectFit="cover"
                            />
                        </Box>
                        <VStack align="flex-start" spacing={5} justifyContent="center">
                            <Heading size="xl">About Fullbright</Heading>
                            <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.400')}>
                                Welcome to the Fullbright Center – a hub of excellence dedicated to fostering education, 
                                innovation, and community engagement. At Fullbright, we are committed to empowering 
                                individuals and organizations through a wide range of programs and resources designed to 
                                inspire growth, collaboration, and positive change.
                            </Text>
                            <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.400')}>
                                Our center offers educational workshops, professional development sessions, research support, 
                                and state-of-the-art facilities tailored to meet the diverse needs of our community.
                            </Text>
                        </VStack>
                    </SimpleGrid>

                    {/* Academic Programs */}
                    <VStack spacing={10} w="100%">
                        <Heading size="xl">Academic Programs</Heading>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} w="100%">
                            <Box 
                                bg="white" 
                                p={8} 
                                borderRadius="lg" 
                                boxShadow="md"
                                _hover={{ transform: 'translateY(-5px)', transition: '0.3s' }}
                            >
                                <VStack align="flex-start" spacing={4}>
                                    <Image
                                        src="https://images.unsplash.com/photo-1522881193457-37ae97c905bf"
                                        alt="Academic English"
                                        borderRadius="md"
                                        w="100%"
                                        h="200px"
                                        objectFit="cover"
                                    />
                                    <Heading size="md">Academic English</Heading>
                                    <Text color={useColorModeValue('gray.600', 'gray.400')}>
                                        Comprehensive programs designed to enhance your academic English skills, 
                                        perfect for university preparation and professional development.
                                    </Text>
                                </VStack>
                            </Box>

                            <Box 
                                bg="white" 
                                p={8} 
                                borderRadius="lg" 
                                boxShadow="md"
                                _hover={{ transform: 'translateY(-5px)', transition: '0.3s' }}
                            >
                                <VStack align="flex-start" spacing={4}>
                                    <Image
                                        src="https://images.unsplash.com/photo-1523240795612-9a054b0db644"
                                        alt="Casual English"
                                        borderRadius="md"
                                        w="100%"
                                        h="200px"
                                        objectFit="cover"
                                    />
                                    <Heading size="md">Casual English</Heading>
                                    <Text color={useColorModeValue('gray.600', 'gray.400')}>
                                        Practical English courses focused on daily communication, travel, 
                                        and social interactions in English-speaking environments.
                                    </Text>
                                </VStack>
                            </Box>
                        </SimpleGrid>
                    </VStack>

                    {/* Call to Action */}
                    <Box 
                        bg="blue.600" 
                        color="white" 
                        p={10} 
                        borderRadius="xl" 
                        w="100%"
                    >
                        <VStack spacing={5}>
                            <Heading size="lg" textAlign="center">
                                Ready to Start Your Journey?
                            </Heading>
                            <Text fontSize="lg" textAlign="center" maxW="2xl" mx="auto">
                                Join us at Fullbright, where we believe in creating brighter futures together. 
                                Explore our programs and learn more about how we can work together to reach your goals.
                            </Text>
                            <Button 
                                size="lg" 
                                colorScheme="whiteAlpha"
                                _hover={{ bg: 'whiteAlpha.300' }}
                            >
                                Get Started Today
                            </Button>
                        </VStack>
                    </Box>
                </VStack>
            </Container>
        </Box>
    );
};

export default Introduction; 