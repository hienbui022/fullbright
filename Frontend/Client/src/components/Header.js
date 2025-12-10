import React, { useEffect, useState } from 'react';
import { 
    Box, 
    Flex, 
    Button, 
    Avatar, 
    Menu, 
    MenuButton, 
    MenuList, 
    MenuItem, 
    IconButton, 
    Link as ChakraLink,
    Badge,
    Container,
    Text,
    useColorModeValue,
    useBreakpointValue,
    Stack
} from '@chakra-ui/react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HamburgerIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';

const MotionFlex = motion(Flex);

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isAuthenticated = !!localStorage.getItem("token");
    const [user, setUser] = React.useState(JSON.parse(localStorage.getItem("user")) || {});
    const [isScrolled, setIsScrolled] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // User effect remains the same
    useEffect(() => {
        const handleUserChange = () => {
            const newUser = JSON.parse(localStorage.getItem("user")) || {};
            if (JSON.stringify(newUser) !== JSON.stringify(user)) {
                setUser(newUser);
                window.location.reload();
            }
        };
        const interval = setInterval(handleUserChange, 1000);
        return () => clearInterval(interval);
    }, [user]);

    const bgColor = useColorModeValue(
        isScrolled ? 'white' : 'rgba(255, 255, 255, 0.8)',
        isScrolled ? 'gray.800' : 'rgba(26, 32, 44, 0.8)'
    );

    const textColor = useColorModeValue(
        isScrolled ? 'gray.800' : 'gray.700',
        'white'
    );

    const NavLink = ({ to, children }) => {
        const isActive = location.pathname === to;
        return (
            <Link to={to}>
                <Button
                    variant="ghost"
                    color={textColor}
                    position="relative"
                    _hover={{
                        bg: 'transparent',
                        color: 'blue.400',
                        _after: {
                            width: '100%'
                        }
                    }}
                >
                    {children}
                </Button>
            </Link>
        );
    };

    return (
        <>
            <Box
                position="fixed"
                top="0"
                left="0"
                right="0"
                zIndex="1000"
                bg={bgColor}
                boxShadow={isScrolled ? 'sm' : 'none'}
                transition="all 0.3s ease"
                backdropFilter="blur(10px)"
            >
                <Container maxW="1400px">
                    <Flex h="70px" alignItems="center" justifyContent="space-between">
                        <MotionFlex 
                            alignItems="center"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Link to="/">
                                <Flex alignItems="center">
                                    {/* <img src="/logo-english.png" alt="English Learning Logo" style={{ height: '45px', marginRight: '12px' }} /> */}
                                    <Text
                                        fontSize="xl"
                                        fontWeight="bold"
                                        bgGradient="linear(to-r, blue.400, blue.600)"
                                        bgClip="text"
                                        display={{ base: 'none', md: 'block' }}
                                    >
                                        EnglishFullbright
                                    </Text>
                                </Flex>
                            </Link>

                            <Flex display={{ base: 'none', md: 'flex' }} ml={8} gap={2}>
                                <NavLink to="/">Home</NavLink>
                                <NavLink to="/courses">Courses</NavLink>
                                <NavLink to="/forum">Forum</NavLink>
                                <NavLink to="/news">News</NavLink>
                                <NavLink to="/dictionary">Dictionary</NavLink>
                                <NavLink to="/introduction">Introduction</NavLink>
                                <NavLink to="/contact">Contact</NavLink>

                            </Flex>
                        </MotionFlex>

                        <Flex alignItems="center" gap={4}>

                            {isAuthenticated ? (
                                <Menu>
                                    <MenuButton
                                        as={Button}
                                        variant="ghost"
                                        color={textColor}
                                        display="flex"
                                        alignItems="center"
                                        _hover={{ bg: 'transparent' }}
                                    >
                                        <Avatar 
                                            size="sm" 
                                            name={user.name} 
                                            src={user.imageUrl} 
                                            mr={2}
                                            border="2px solid"
                                            borderColor="blue.400"
                                        />
                                        <Text>{user.username}</Text>
                                    </MenuButton>
                                    <MenuList 
                                        shadow="lg" 
                                        border="1px" 
                                        borderColor="gray.100"
                                        zIndex={9999}
                                    >
                                        <MenuItem icon={<i className="fas fa-user" />} onClick={() => navigate('/profile')}>My Profile</MenuItem>
                                        <MenuItem icon={<i className="fas fa-book" />} onClick={() => navigate('/my-courses')}>My Courses</MenuItem>
                                        <MenuItem icon={<i className="fas fa-trophy" />} onClick={() => navigate('/achievements')}>Achievements</MenuItem>
                                        <MenuItem icon={<i className="fas fa-key" />} onClick={() => navigate('/change-password')}>Change Password</MenuItem>
                                        <MenuItem 
                                            icon={<i className="fas fa-sign-out-alt" />}
                                            color="red.500"
                                            onClick={() => {
                                                localStorage.removeItem("token");
                                                localStorage.removeItem("user");
                                                navigate('/');
                                                window.location.reload();
                                            }}
                                        >
                                            Logout
                                        </MenuItem>
                                    </MenuList>
                                </Menu>
                            ) : (
                                <Button
                                    as={Link}
                                    to="/login"
                                    colorScheme="blue"
                                    variant="solid"
                                    size="md"
                                    _hover={{
                                        transform: 'translateY(-2px)',
                                        boxShadow: 'lg',
                                    }}
                                    transition="all 0.3s ease"
                                >
                                    Login
                                </Button>
                            )}

                            <IconButton
                                aria-label="Open Menu"
                                icon={<HamburgerIcon />}
                                display={{ md: 'none' }}
                                variant="ghost"
                                color={textColor}
                            />
                        </Flex>
                    </Flex>
                </Container>
            </Box>
            <Box height="70px" />
        </>
    );
};

export default Header;