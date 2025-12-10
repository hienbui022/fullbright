import React from 'react';
import { Box, Image, Flex, Container, Text, Button, Heading } from '@chakra-ui/react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const HomeSection1 = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        arrows: false,
        customPaging: function(i) {
            return (
                <Box
                    as="button"
                    height="3px"
                    width="30px"
                    bg="gray.300"
                    _hover={{ bg: "blue.500" }}
                    _active={{ bg: "blue.600" }}
                />
            );
        }
    };

    return (
        <Box 
            position="relative" 
            height="100vh"
            backgroundImage="url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTYyMDF8MHwxfHNlYXJjaHwxfHxsZWFybmluZ3xlbnwwfHx8fDE2NDU1NjQ0MjB8MA&ixlib=rb-4.0.3&q=80&w=1080')"
            backgroundSize="cover"
            backgroundPosition="center"
        >
            <Box 
                position="absolute"
                top="0"
                left="0"
                right="0"
                bottom="0"
                bg="blackAlpha.600"
            />
            <Container maxW="7xl" position="relative" height="100%">
                <Flex 
                    height="100%" 
                    direction="column" 
                    justify="center" 
                    color="white"
                    textAlign="center"
                >
                    <Text 
                        fontSize="sm" 
                        letterSpacing="wide" 
                        mb={2}
                    >
                        LET'S ENJOY IN LEARNING ENGLISH
                    </Text>
                    <Heading 
                        as="h1" 
                        size="2xl" 
                        mb={6}
                        fontWeight="bold"
                    >
                        website learning english
                    </Heading>
                    <Text 
                        fontSize="lg" 
                        maxW="2xl" 
                        mx="auto" 
                        mb={8}
                    >
                        "Welcome to our website, your trusted resource for improving your English skills with engaging lessons, interactive exercises, and practical tips for all proficiency levels!"
                    </Text>
                    <Button
                        as="a"
                        href="#learn-more"
                        size="lg"
                        colorScheme="blue"
                        width="fit-content"
                        mx="auto"
                        _hover={{
                            transform: 'translateY(-2px)',
                            boxShadow: 'lg',
                        }}
                    >
                        More →
                    </Button>

                    <Flex justify="center" mt={12}>
                        {[1, 2, 3, 4, 5].map((num) => (
                            <Box
                                key={num}
                                w="50px"
                                h="4px"
                                bg={num === 1 ? "white" : "whiteAlpha.400"}
                                mx={1}
                                borderRadius="full"
                            />
                        ))}
                    </Flex>
                </Flex>
            </Container>
        </Box>
    );
};

export default HomeSection1;
