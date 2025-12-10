import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Heading,
    SimpleGrid,
    Text,
    Flex,
    Spinner,
    Button,
    VStack
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import NewsService from '../../apis/news.service';
import NewsCard from '../news/NewsCard';

const ReadingNewsSection = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNews = async () => {
        try {
            const response = await NewsService.getAllNews({ page: 1, limit: 3 });
            setNews(response.data.news);
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    return (
        <Box py={16} bg="gray.50">
            <Container maxW="7xl">
                <Flex justify="space-between" align="center" mb={10}>
                    <VStack align="start" spacing={2}>
                        <Heading 
                            size="lg" 
                            color="blue.600"
                            bgGradient="linear(to-r, blue.400, blue.600)"
                            bgClip="text"
                        >
                            Latest News
                        </Heading>
                        <Text color="gray.600" fontSize="lg">
                            Stay updated with our latest articles and resources
                        </Text>
                    </VStack>
                    <Button
                        as={Link}
                        to="/news"
                        colorScheme="blue"
                        variant="outline"
                        rightIcon={<span>→</span>}
                        _hover={{
                            transform: 'translateX(4px)',
                            boxShadow: 'md',
                        }}
                        transition="all 0.3s ease"
                    >
                        View All
                    </Button>
                </Flex>
                
                {loading ? (
                    <Flex justify="center" align="center" minH="200px">
                        <Spinner size="xl" color="blue.500" />
                    </Flex>
                ) : (
                    <SimpleGrid 
                        columns={{ base: 1, md: 2, lg: 3 }} 
                        spacing={8}
                    >
                        {news.map((item) => (
                            <NewsCard 
                                key={item.id}
                                news={item}
                            />
                        ))}
                    </SimpleGrid>
                )}
            </Container>
        </Box>
    );
};

export default ReadingNewsSection; 