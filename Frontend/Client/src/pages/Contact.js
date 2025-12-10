'use client'

import {
  Container,
  Flex,
  Box,
  Heading,
  Text,
  IconButton,
  Button,
  VStack,
  HStack,
  Wrap,
  WrapItem,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Textarea,
  useToast
} from '@chakra-ui/react';
import {
  MdPhone,
  MdEmail,
  MdLocationOn,
  MdFacebook,
  MdOutlineEmail,
} from 'react-icons/md';
import { BsGithub, BsDiscord, BsPerson, BsLinkedin } from 'react-icons/bs';
import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    toast({
      title: 'Message Sent',
      description: "We'll get back to you as soon as possible!",
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    setFormData({ name: '', email: '', message: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Container bg="gray.50" maxW="full" mt={0} centerContent overflow="hidden">
      <Flex py={20}>
        <Box
          bg="white"
          borderRadius="xl"
          boxShadow="xl"
          m={{ sm: 4, md: 16, lg: 10 }}
          p={{ sm: 5, md: 5, lg: 16 }}>
          <Box p={4}>
            <Wrap spacing={{ base: 20, sm: 3, md: 5, lg: 20 }}>
              <WrapItem>
                <Box>
                  <VStack spacing={4} align="flex-start">
                    <Box>
                      <Heading 
                        fontSize="4xl" 
                        bgGradient="linear(to-r, blue.400, blue.600)"
                        bgClip="text"
                      >
                        Get in Touch
                      </Heading>
                      <Text mt={4} color="gray.600" fontSize="lg">
                        Have questions? We'd love to hear from you.
                        <br />
                        Send us a message and we'll respond as soon as possible.
                      </Text>
                    </Box>

                    <Box py={8}>
                      <VStack pl={0} spacing={4} alignItems="flex-start">
                        <Button
                          size="lg"
                          variant="ghost"
                          color="gray.600"
                          _hover={{ 
                            color: 'blue.500',
                            transform: 'translateX(4px)',
                            transition: 'all 0.3s ease'
                          }}
                          leftIcon={<MdPhone size="20px" />}>
                          +84-123456789
                        </Button>
                        <Button
                          size="lg"
                          variant="ghost"
                          color="gray.600"
                          _hover={{ 
                            color: 'blue.500',
                            transform: 'translateX(4px)',
                            transition: 'all 0.3s ease'
                          }}
                          leftIcon={<MdEmail size="20px" />}>
                          contact@englishfullbright.com
                        </Button>
                        <Button
                          size="lg"
                          variant="ghost"
                          color="gray.600"
                          _hover={{ 
                            color: 'blue.500',
                            transform: 'translateX(4px)',
                            transition: 'all 0.3s ease'
                          }}
                          leftIcon={<MdLocationOn size="20px" />}>
                          Hanoi, Vietnam
                        </Button>
                      </VStack>
                    </Box>

                    <Box>
                      <Text color="gray.600" fontSize="lg" fontWeight="semibold" mb={4}>
                        Follow Us On
                      </Text>
                      <HStack spacing={5}>
                        <IconButton
                          aria-label="facebook"
                          variant="ghost"
                          size="lg"
                          isRound={true}
                          _hover={{ 
                            color: 'white',
                            bg: 'blue.500',
                            transform: 'translateY(-2px)',
                            boxShadow: 'lg'
                          }}
                          icon={<MdFacebook size="28px" />}
                        />
                        <IconButton
                          aria-label="github"
                          variant="ghost"
                          size="lg"
                          isRound={true}
                          _hover={{ 
                            color: 'white',
                            bg: 'gray.700',
                            transform: 'translateY(-2px)',
                            boxShadow: 'lg'
                          }}
                          icon={<BsGithub size="28px" />}
                        />
                        <IconButton
                          aria-label="discord"
                          variant="ghost"
                          size="lg"
                          isRound={true}
                          _hover={{ 
                            color: 'white',
                            bg: 'purple.500',
                            transform: 'translateY(-2px)',
                            boxShadow: 'lg'
                          }}
                          icon={<BsDiscord size="28px" />}
                        />
                        <IconButton
                          aria-label="linkedin"
                          variant="ghost"
                          size="lg"
                          isRound={true}
                          _hover={{ 
                            color: 'white',
                            bg: 'blue.600',
                            transform: 'translateY(-2px)',
                            boxShadow: 'lg'
                          }}
                          icon={<BsLinkedin size="28px" />}
                        />
                      </HStack>
                    </Box>
                  </VStack>
                </Box>
              </WrapItem>

              <WrapItem>
                <Box bg="white" borderRadius="lg">
                  <Box m={8} color="#0B0E3F">
                    <VStack spacing={5} as="form" onSubmit={handleSubmit}>
                      <FormControl id="name" isRequired>
                        <FormLabel>Your Name</FormLabel>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <BsPerson color="gray.500" />
                          </InputLeftElement>
                          <Input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            _focus={{
                              borderColor: "blue.500",
                              boxShadow: "0 0 0 1px #3182ce"
                            }}
                          />
                        </InputGroup>
                      </FormControl>

                      <FormControl id="email" isRequired>
                        <FormLabel>Email</FormLabel>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <MdOutlineEmail color="gray.500" />
                          </InputLeftElement>
                          <Input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your.email@example.com"
                            _focus={{
                              borderColor: "blue.500",
                              boxShadow: "0 0 0 1px #3182ce"
                            }}
                          />
                        </InputGroup>
                      </FormControl>

                      <FormControl id="message" isRequired>
                        <FormLabel>Message</FormLabel>
                        <Textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Your message..."
                          rows={6}
                          _focus={{
                            borderColor: "blue.500",
                            boxShadow: "0 0 0 1px #3182ce"
                          }}
                        />
                      </FormControl>

                      <Button
                        type="submit"
                        colorScheme="blue"
                        bg="blue.500"
                        color="white"
                        _hover={{
                          bg: 'blue.600',
                          transform: 'translateY(-2px)',
                          boxShadow: 'lg',
                        }}
                        width="full"
                        transition="all 0.3s ease"
                      >
                        Send Message
                      </Button>
                    </VStack>
                  </Box>
                </Box>
              </WrapItem>
            </Wrap>
          </Box>
        </Box>
      </Flex>
    </Container>
  );
} 