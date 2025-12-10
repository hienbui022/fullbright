import React from 'react';
import {
    Box,
    Badge,
    VStack,
    HStack,
    Text,
    Image,
    Heading,
    Flex,
    Icon
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { FiEye, FiCalendar, FiUser } from 'react-icons/fi';

const NewsCard = ({ news }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Box 
            bg="white" 
            borderRadius="lg" 
            overflow="hidden"
            transition="transform 0.3s ease, box-shadow 0.3s ease"
            _hover={{
                transform: 'translateY(-8px)',
                boxShadow: 'xl',
            }}
        >
            <Image
                src={news.imageUrl || 'https://via.placeholder.com/400x200'}
                alt={news.title}
                w="100%"
                h="200px"
                objectFit="cover"
            />
            <VStack align="stretch" p={5} spacing={3}>
                <HStack spacing={4} flexWrap="wrap">
                    <Badge colorScheme="blue" px={2} py={1} borderRadius="full">
                        {news.category}
                    </Badge>
                    {news.tags && news.tags.map((tag, index) => (
                        <Badge 
                            key={index} 
                            colorScheme="gray" 
                            px={2} 
                            py={1} 
                            borderRadius="full"
                        >
                            {tag}
                        </Badge>
                    ))}
                </HStack>
                
                <Link to={`/news/${news.id}`}>
                    <Heading 
                        size="md" 
                        noOfLines={2}
                        _hover={{ color: 'blue.500' }}
                        cursor="pointer"
                    >
                        {news.title}
                    </Heading>
                </Link>

                <Text 
                    color="gray.600" 
                    fontSize="sm" 
                    noOfLines={2}
                >
                    {news.summary}
                </Text>

                <HStack spacing={4} color="gray.500" fontSize="sm">
                    <Flex align="center">
                        <Icon as={FiCalendar} mr={1} />
                        {formatDate(news.publishedAt)}
                    </Flex>
                    <Flex align="center">
                        <Icon as={FiUser} mr={1} />
                        {news.creator?.fullName || "Admin"}
                    </Flex>
                    <Flex align="center">
                        <Icon as={FiEye} mr={1} />
                        {news.viewCount} lượt xem
                    </Flex>
                </HStack>
            </VStack>
        </Box>
    );
};

export default NewsCard; 