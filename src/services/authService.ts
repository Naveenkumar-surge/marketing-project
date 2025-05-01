import axios from "axios";

// Base URL (use .env for production)
const BASE_URL = "http://localhost:5000/api";

// User Login
export const userLogin = async (email: string, password: string) => {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, { email, password });

        const { token, user } = response.data;

        if (!token || !user) {
            throw new Error("Invalid response from server.");
        }

        localStorage.setItem("userToken", token);
        localStorage.setItem("userInfo", JSON.stringify(user));

        console.log("Login successful:", user,token);
        window.dispatchEvent(new Event("storage")); // React state sync

        return user;
    } catch (error: any) {
        console.error("Login error:", error.response?.data?.message || error.message);
        throw new Error(error.response?.data?.message || "Login failed. Please try again.");
    }
};

// Check if user is authenticated
export const isUserAuthenticated = (): boolean => {
    return !!localStorage.getItem("userToken");
};

// User & Admin Logout
export const userLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("isAdmin");

    window.dispatchEvent(new Event("storage")); // Sync logout
};

// Admin Login
export const adminLogin = async (email: string, password: string) => {
    if (email === "admin@example.com" && password === "Admin@123") {
        localStorage.setItem("isAdmin", "true");
        window.dispatchEvent(new Event("storage")); // Sync login
        return true;
    }
    throw new Error("Invalid admin credentials");
};

// Check if Admin is authenticated
export const isAdminAuthenticated = (): boolean => {
    return !!localStorage.getItem("isAdmin");
};
