import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                if (userData && userData._id) { 
                    setUser(userData);
                } else {
                    localStorage.removeItem("user");
                }
            } catch (e) {
                localStorage.removeItem("user");
            }
        }
        setIsLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        toast.success(`Chào mừng trở lại, ${userData.username}!`);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        toast.info("Đã đăng xuất.");
        navigate("/login");
    };
    
    const isLoggedIn = !!user;
    const isAdmin = user?.role === 'admin'; 

    const value = {
        user,
        isLoading,
        login,
        logout,
        isLoggedIn, // Cung cấp trạng thái đăng nhập
        isAdmin,    // Cung cấp trạng thái quản trị viên
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">Đang kiểm tra phiên...</div>;
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};