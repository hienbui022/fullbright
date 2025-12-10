import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Box,
    Container,
    Heading,
    Text,
    Image,
    Stack,
    Button,
    Spinner,
    useToast,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Divider,
    HStack,
    Tag,
    Badge,
    Flex,
    Icon
} from '@chakra-ui/react';
import { ChevronRightIcon, ViewIcon } from '@chakra-ui/icons';
import { FaUser, FaCalendarAlt } from 'react-icons/fa';
import NewsService from '../apis/news.service';

const NewsDetail = () => {
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const toast = useToast();

    useEffect(() => {
        const fetchNewsDetail = async () => {
            try {
                const response = await NewsService.getNewsById(id);
                setNews(response.data);
            } catch (error) {
                toast({
                    title: 'Lỗi',
                    description: 'Không thể tải thông tin bài viết',
                    status: 'error',
                    duration: 3000,
                    isClosable: true
                });
            } finally {
                setLoading(false);
            }
        };

        fetchNewsDetail();
    }, [id, toast]);

    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minH="60vh">
                <Spinner size="xl" color="blue.500" />
            </Box>
        );
    }

    if (!news) {
        return (
            <Container maxW="container.md" py={10}>
                <Text textAlign="center" fontSize="xl">
                    Không tìm thấy bài viết
                </Text>
                <Button as={Link} to="/news" colorScheme="blue" mt={4}>
                    Quay lại trang tin tức
                </Button>
            </Container>
        );
    }

    return (
        <Container maxW="container.md" py={8}>
            <Stack spacing={6}>
                <Breadcrumb
                    spacing="8px"
                    separator={<ChevronRightIcon color="gray.500" />}
                >
                    <BreadcrumbItem>
                        <BreadcrumbLink as={Link} to="/">Trang chủ</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbLink as={Link} to="/news">Tin tức</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem isCurrentPage>
                        <BreadcrumbLink>Bài viết</BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>

                <Heading size="xl" color="blue.600">
                    {news.title}
                </Heading>

                <HStack spacing={4} wrap="wrap">
                    {news.tags && news.tags.map((tag, index) => (
                        <Tag
                            key={index}
                            size="md"
                            variant="subtle"
                            colorScheme="blue"
                        >
                            {tag}
                        </Tag>
                    ))}
                </HStack>

                <Flex direction={{ base: "column", md: "row" }} gap={4} color="gray.600" fontSize="sm">
                    <HStack>
                        <Icon as={FaCalendarAlt} />
                        <Text>Đăng ngày {formatDate(news.publishedAt)}</Text>
                    </HStack>
                    <HStack>
                        <Icon as={FaUser} />
                        <Text>{news.creator?.fullName || "Admin"}</Text>
                    </HStack>
                    <HStack>
                        <ViewIcon />
                        <Text>{news.viewCount} lượt xem</Text>
                    </HStack>
                    <Badge colorScheme="green">{news.category}</Badge>
                </Flex>

                {news.imageUrl && (
                    <Image
                        src={news.imageUrl}
                        alt={news.title}
                        borderRadius="lg"
                        objectFit="cover"
                        width="100%"
                        maxHeight="400px"
                    />
                )}

                <Text fontSize="lg" color="gray.600" fontStyle="italic">
                    {news.summary}
                </Text>

                <Divider />

                <Box
                    className="news-content"
                    fontSize="lg"
                    lineHeight="tall"
                    sx={{
                        'p': {
                            marginBottom: '1rem'
                        },
                        'img': {
                            maxWidth: '100%',
                            height: 'auto',
                            borderRadius: 'md',
                            marginY: '1rem'
                        },
                        'h1': { fontSize: '2xl', fontWeight: 'bold', marginY: '1.5rem' },
                        'h2': { fontSize: 'xl', fontWeight: 'semibold', marginY: '1.25rem' },
                        'h3': { fontSize: 'lg', fontWeight: 'semibold', marginY: '1rem' },
                        'ul': { marginLeft: '1.5rem', marginBottom: '1rem' },
                        'ol': { marginLeft: '1.5rem', marginBottom: '1rem' },
                        'li': { marginBottom: '0.5rem' },
                        'blockquote': { 
                            borderLeft: '4px solid', 
                            borderColor: 'gray.300', 
                            paddingLeft: '1rem', 
                            marginY: '1rem', 
                            fontStyle: 'italic' 
                        },
                        'a': { color: 'blue.500', textDecoration: 'underline' }
                    }}
                    dangerouslySetInnerHTML={{ __html: news.content }}
                >
                </Box>

                <Button
                    as={Link}
                    to="/news"
                    colorScheme="blue"
                    variant="outline"
                    size="lg"
                    mt={8}
                >
                    Quay lại danh sách tin tức
                </Button>
            </Stack>
        </Container>
    );
};

export default NewsDetail; 