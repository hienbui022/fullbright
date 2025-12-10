import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Heading,
    Text,
    Image,
    SimpleGrid,
    Input,
    InputGroup,
    InputLeftElement,
    Spinner,
    Card,
    CardBody,
    Stack,
    Button,
    Flex,
    useToast,
    VStack,
    HStack
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';
import NewsService from '../apis/news.service';
import NewsCard from '../components/news/NewsCard';

const ReadingNews = () => {
    const [allNews, setAllNews] = useState([]); // Store all news
    const [displayedNews, setDisplayedNews] = useState([]); // Store filtered/paginated news
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const toast = useToast();
    const limit = 9; // Number of news items per page

    const fetchNews = async () => {
        try {
            setLoading(true);
            // Fetch all news with a large limit to get everything at once
            const response = await NewsService.getAllNews({
                page: 1,
                limit: 1000, // Large number to get all news
                search: ''
            });
            
            if (response?.data?.news) {
                setAllNews(response.data.news);
                setDisplayedNews(response.data.news.slice(0, limit));
            }
        } catch (error) {
            console.error('Error fetching news:', error);
            toast({
                title: 'Error',
                description: 'Unable to load news articles',
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    // Filter news based on search term
    const filterNews = (searchTerm) => {
        if (!searchTerm.trim()) {
            return allNews;
        }

        const searchLower = searchTerm.toLowerCase();
        return allNews.filter(item => {
            const titleMatch = item.title?.toLowerCase().includes(searchLower);
            const summaryMatch = item.summary?.toLowerCase().includes(searchLower);
            const categoryMatch = item.category?.toLowerCase().includes(searchLower);
            const tagsMatch = item.tags?.some(tag => 
                tag.toLowerCase().includes(searchLower)
            );

            return titleMatch || summaryMatch || categoryMatch || tagsMatch;
        });
    };

    // Handle search input change
    const handleSearch = (e) => {
        const newSearchTerm = e.target.value;
        setSearchTerm(newSearchTerm);
        setPage(1);
        
        const filteredNews = filterNews(newSearchTerm);
        setDisplayedNews(filteredNews.slice(0, limit));
    };

    // Handle load more
    const handleLoadMore = () => {
        const filteredNews = filterNews(searchTerm);
        const nextPage = page + 1;
        const start = 0;
        const end = nextPage * limit;
        
        setDisplayedNews(filteredNews.slice(start, end));
        setPage(nextPage);
    };

    // Check if there are more items to load
    const hasMore = displayedNews.length < filterNews(searchTerm).length;

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    return (
        <Box py={16} bg="gray.50" minH="100vh">
            <Container maxW="7xl">
                <VStack spacing={8} align="stretch">
                    <VStack spacing={2} align="center">
                        <Heading 
                            size="xl" 
                            color="blue.600"
                            bgGradient="linear(to-r, blue.400, blue.600)"
                            bgClip="text"
                        >
                            Latest News
                        </Heading>
                        <Text color="gray.600" textAlign="center" fontSize="lg">
                            Stay updated with our latest articles and learning resources
                        </Text>
                    </VStack>

                    <InputGroup maxW="600px" mx="auto">
                        <InputLeftElement pointerEvents="none">
                            <SearchIcon color="gray.400" />
                        </InputLeftElement>
                        <Input
                            placeholder="Search news articles..."
                            value={searchTerm}
                            onChange={handleSearch}
                            bg="white"
                            borderRadius="lg"
                            size="lg"
                            _focus={{
                                borderColor: "blue.500",
                                boxShadow: "0 0 0 1px #3182ce"
                            }}
                        />
                    </InputGroup>

                    {loading ? (
                        <Flex justify="center" align="center" minH="400px">
                            <Spinner size="xl" color="blue.500" />
                        </Flex>
                    ) : (
                        <>
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                                {displayedNews.map((item) => (
                                    <NewsCard key={item.id} news={item} />
                                ))}
                            </SimpleGrid>

                            {displayedNews.length === 0 && (
                                <Text textAlign="center" fontSize="lg" color="gray.600">
                                    No news articles found
                                </Text>
                            )}

                            {hasMore && (
                                <HStack justify="center" pt={8}>
                                    <Button
                                        onClick={handleLoadMore}
                                        colorScheme="blue"
                                        size="lg"
                                        _hover={{
                                            transform: 'translateY(-2px)',
                                            boxShadow: 'lg',
                                        }}
                                        transition="all 0.3s ease"
                                    >
                                        Load More
                                    </Button>
                                </HStack>
                            )}
                        </>
                    )}
                </VStack>
            </Container>
        </Box>
    );
};

export default ReadingNews; 