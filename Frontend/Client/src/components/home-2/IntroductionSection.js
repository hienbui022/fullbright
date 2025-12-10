import React from 'react';
import { Box, Flex, Text, Button, Container, Heading, Image } from '@chakra-ui/react';

const IntroductionSection = () => {
  return (
    <Container maxW="7xl" py={10}>
      <Flex 
        direction={{ base: 'column', md: 'row' }}
        align="center"
        justify="space-between"
        gap={8}
        bg="rgba(208, 218, 228, 0.4)"
        borderRadius="xl"
        p={8}
      >
        {/* Left Content */}
        <Box flex="1">
          <Heading 
            as="h2" 
            size="xl" 
            mb={6}
            color="#2D3748"
          >
            Introduction
          </Heading>
          
          <Text 
            color="#4299E1" 
            fontSize="xl" 
            fontWeight="bold" 
            mb={3}
          >
            advance english
            <Text as="span" color="#718096" fontSize="md" ml={2}>
              (means step by step take you better)
            </Text>
          </Text>

          <Text
            color="#4A5568"
            fontSize="lg"
            lineHeight="tall"
            mb={6}
          >
            "Lead You to New Life" – Our meaningful name reflects our mission to
            empower learners with English skills, opening doors to personal
            growth and a new life journey. Our logo symbolizes new
            beginnings and the pursuit of knowledge, inspiring confidence
            and helping you achieve new goals in life.
          </Text>

          <Text
            color="#718096"
            fontSize="md"
            mb={6}
          >
            Welcome to our website! Launched in 2024, we provide advanced English-learning features to
            help you improve your language skills quickly and effectively. With interactive lessons, rich
            resources, and unique learning tools, we offer an optimal experience for learners of all levels. Our
            dedicated team includes experienced teachers and linguists who are committed to delivering high-quality
            content tailored to each learner's needs.
          </Text>

          <Button
            bg="#4299E1"
            color="white"
            _hover={{ bg: '#3182CE' }}
            size="lg"
            rightIcon={<span>→</span>}
          >
            More
          </Button>
        </Box>

        {/* Right Image */}
        <Box 
          flex="1"
          maxW={{ base: "100%", md: "450px" }}
        >
          <Box
            p={6}
            borderRadius="xl"
            transform="rotate(2deg)"
            transition="transform 0.3s ease"
            _hover={{ transform: 'rotate(0deg)' }}
          >
            <Image
              src="https://images.unsplash.com/photo-1546521343-4eb2c01aa44b?q=80&w=2865&auto=format&fit=crop"
              alt="Time to Learn English"
              borderRadius="lg"
              boxShadow="xl"
            />
          </Box>
        </Box>
      </Flex>
    </Container>
  );
};

export default IntroductionSection; 