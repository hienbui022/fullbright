'use client'

import {
    Avatar,
    Box,
    Container,
    Flex,
    Heading,
    Stack,
    Text,
    useColorModeValue
} from '@chakra-ui/react';
import React from 'react';
import HomeSection1 from '../components/home-1/homeSection1';
import IntroductionSection from '../components/home-2/IntroductionSection';
import ServiceSection from '../components/home-3/ServiceSection';
import ReadingNewsSection from '../components/home-4/ReadingNewsSection';

const Testimonial = ({ children }) => {
    return <Box>{children}</Box>;
};

const TestimonialContent = ({ children }) => {
    return (
        <Stack
            bg={useColorModeValue('white', 'gray.800')}
            boxShadow={'lg'}
            p={8}
            rounded={'xl'}
            align={'center'}
            pos={'relative'}
            _after={{
                content: `""`,
                w: 0,
                h: 0,
                borderLeft: 'solid transparent',
                borderLeftWidth: 16,
                borderRight: 'solid transparent',
                borderRightWidth: 16,
                borderTop: 'solid',
                borderTopWidth: 16,
                borderTopColor: useColorModeValue('white', 'gray.800'),
                pos: 'absolute',
                bottom: '-16px',
                left: '50%',
                transform: 'translateX(-50%)',
            }}>
            {children}
        </Stack>
    );
};

const TestimonialHeading = ({ children }) => {
    return (
        <Heading as={'h3'} fontSize={'xl'}>
            {children}
        </Heading>
    );
};

const TestimonialText = ({ children }) => {
    return (
        <Text
            textAlign={'center'}
            color={useColorModeValue('gray.600', 'gray.400')}
            fontSize={'sm'}>
            {children}
        </Text>
    );
};

const TestimonialAvatar = ({ src, name, title }) => {
    return (
        <Flex align={'center'} mt={8} direction={'column'}>
            <Avatar src={src} mb={2} />
            <Stack spacing={-1} align={'center'}>
                <Text fontWeight={600}>{name}</Text>
                <Text fontSize={'sm'} color={useColorModeValue('gray.600', 'gray.400')}>
                    {title}
                </Text>
            </Stack>
        </Flex>
    );
};

const Home = () => {
    return (
        <Box bg={useColorModeValue('gray.100', 'gray.700')}>
            <HomeSection1 />
            <IntroductionSection />
            <ServiceSection />
            <ReadingNewsSection />

            <Container maxW={'7xl'} py={16} as={Stack} spacing={12}>
                <Stack spacing={0} align={'center'}>
                    <Heading>What Our Students Say</Heading>
                    <Text>Feedback from students who completed our courses</Text>
                </Stack>
                <Stack
                    direction={{ base: 'column', md: 'row' }}
                    spacing={{ base: 10, md: 4, lg: 10 }}>
                    <Testimonial>
                        <TestimonialContent>
                            <TestimonialHeading>Effective Learning Method</TestimonialHeading>
                            <TestimonialText>
                                I significantly improved my English speaking skills after 3 months. 
                                The teachers are dedicated and their teaching methods are very easy to understand.
                            </TestimonialText>
                        </TestimonialContent>
                        <TestimonialAvatar
                            src={
                                'https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
                            }
                            name={'John Smith'}
                            title={'IELTS 7.0 Student'}
                        />
                    </Testimonial>
                    <Testimonial>
                        <TestimonialContent>
                            <TestimonialHeading>Clear Learning Path</TestimonialHeading>
                            <TestimonialText>
                                The course is designed with a clear progression, from basic to advanced levels. 
                                I can study and practice anytime, anywhere.
                            </TestimonialText>
                        </TestimonialContent>
                        <TestimonialAvatar
                            src={
                                'https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
                            }
                            name={'Sarah Johnson'}
                            title={'TOEIC 850 Student'}
                        />
                    </Testimonial>
                    <Testimonial>
                        <TestimonialContent>
                            <TestimonialHeading>Excellent Learning Environment</TestimonialHeading>
                            <TestimonialText>
                                Dynamic classes with lots of practical activities. I get to communicate 
                                with native teachers and make friends with other students.
                            </TestimonialText>
                        </TestimonialContent>
                        <TestimonialAvatar
                            src={
                                'https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
                            }
                            name={'Michael Brown'}
                            title={'Business English Student'}
                        />
                    </Testimonial>
                </Stack>
            </Container>
        </Box>
    );
};

export default Home;