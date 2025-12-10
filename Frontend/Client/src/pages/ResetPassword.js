import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Input,
    Heading,
    VStack,
    useToast,
    FormControl,
    FormLabel,
    Text,
    InputGroup,
    InputRightElement,
    Container
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import AuthService from '../apis/auth.service';

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState({
        new: false,
        confirm: false
    });
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const toast = useToast();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.newPassword || !formData.confirmPassword) {
            toast({
                title: "Lỗi",
                description: "Vui lòng điền đầy đủ thông tin",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return false;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast({
                title: "Lỗi",
                description: "Mật khẩu không khớp",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return false;
        }

        if (formData.newPassword.length < 6) {
            toast({
                title: "Lỗi",
                description: "Mật khẩu phải có ít nhất 6 ký tự",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        if (!token) {
            toast({
                title: "Lỗi",
                description: "Token không hợp lệ hoặc đã hết hạn",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setLoading(true);
        try {
            await AuthService.resetPassword(token, formData.newPassword);
            
            toast({
                title: "Thành công",
                description: "Đặt lại mật khẩu thành công",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            
            navigate("/login");
        } catch (error) {
            toast({
                title: "Lỗi",
                description: error.response?.data?.message || "Đã xảy ra lỗi khi đặt lại mật khẩu",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    return (
        <Container maxW="container.sm" py={10}>
            <Box bg="white" p={8} borderRadius="xl" boxShadow="lg">
                <VStack spacing={6}>
                    <Heading as="h2" size="lg">Đặt lại mật khẩu</Heading>
                    <Text color="gray.600" textAlign="center">
                        Vui lòng nhập mật khẩu mới của bạn
                    </Text>

                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Mật khẩu mới</FormLabel>
                                <InputGroup>
                                    <Input
                                        name="newPassword"
                                        type={showPassword.new ? 'text' : 'password'}
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        placeholder="Nhập mật khẩu mới"
                                    />
                                    <InputRightElement>
                                        <Button
                                            variant="ghost"
                                            onClick={() => togglePasswordVisibility('new')}
                                        >
                                            {showPassword.new ? <ViewIcon /> : <ViewOffIcon />}
                                        </Button>
                                    </InputRightElement>
                                </InputGroup>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Xác nhận mật khẩu</FormLabel>
                                <InputGroup>
                                    <Input
                                        name="confirmPassword"
                                        type={showPassword.confirm ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Nhập lại mật khẩu mới"
                                    />
                                    <InputRightElement>
                                        <Button
                                            variant="ghost"
                                            onClick={() => togglePasswordVisibility('confirm')}
                                        >
                                            {showPassword.confirm ? <ViewIcon /> : <ViewOffIcon />}
                                        </Button>
                                    </InputRightElement>
                                </InputGroup>
                            </FormControl>

                            <Button
                                type="submit"
                                colorScheme="blue"
                                width="full"
                                mt={4}
                                isLoading={loading}
                            >
                                Xác nhận
                            </Button>
                        </VStack>
                    </form>
                </VStack>
            </Box>
        </Container>
    );
};

export default ResetPassword; 