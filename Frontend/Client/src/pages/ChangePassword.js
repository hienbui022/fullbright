import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Container,
    Input,
    Text,
    Divider,
    useToast,
    InputGroup,
    InputRightElement,
    VStack
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import AuthService from '../apis/auth.service';

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [loading, setLoading] = useState(false);
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
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
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
                description: "Mật khẩu mới không khớp",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return false;
        }

        if (formData.newPassword.length < 6) {
            toast({
                title: "Lỗi",
                description: "Mật khẩu mới phải có ít nhất 6 ký tự",
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

        setLoading(true);
        try {
            await AuthService.changePassword(
                formData.currentPassword,
                formData.newPassword
            );
            
            toast({
                title: "Thành công",
                description: "Thay đổi mật khẩu thành công",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            
            navigate("/login");
        } catch (error) {
            toast({
                title: "Lỗi",
                description: error.response?.data?.message || "Đã xảy ra lỗi khi thay đổi mật khẩu",
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
                    <Text fontSize="2xl" fontWeight="bold">Thay đổi mật khẩu</Text>
                    <Divider />
                    
                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Mật khẩu hiện tại</FormLabel>
                                <InputGroup>
                                    <Input
                                        name="currentPassword"
                                        type={showPassword.current ? 'text' : 'password'}
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        placeholder="Nhập mật khẩu hiện tại"
                                    />
                                    <InputRightElement>
                                        <Button
                                            variant="ghost"
                                            onClick={() => togglePasswordVisibility('current')}
                                        >
                                            {showPassword.current ? <ViewIcon /> : <ViewOffIcon />}
                                        </Button>
                                    </InputRightElement>
                                </InputGroup>
                            </FormControl>

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
                                <FormLabel>Xác nhận mật khẩu mới</FormLabel>
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
                                Xác nhận thay đổi
                            </Button>
                        </VStack>
                    </form>
                </VStack>
            </Box>
        </Container>
    );
};

export default ChangePassword; 