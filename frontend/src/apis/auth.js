import axiosInstance from "../config/axiosConfig.js";

/**
 * Register a new user
 * @param {Object} userData - { username, email, password }
 */
export const signupApi = async (userData) => {
  try {
    const response = await axiosInstance.post("/api/v1/auth/signup", userData);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || "Failed to sign up.";
    throw new Error(message);
  }
};

/**
 * Log in an existing user
 * @param {Object} credentials - { email or username, password }
 */
export const signinApi = async (credentials) => {
  try {
    const response = await axiosInstance.post("/api/v1/auth/signin", credentials);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || "Failed to sign in.";
    throw new Error(message);
  }
};

/**
 * Fetch authenticated user's profile
 */
export const getMeApi = async () => {
  try {
    const response = await axiosInstance.get("/api/v1/auth/me");
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || "Failed to fetch profile.";
    throw new Error(message);
  }
};

/**
 * Logout the user
 */
export const logoutApi = async () => {
  try {
    const response = await axiosInstance.post("/api/v1/auth/logout");
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || "Failed to log out.";
    throw new Error(message);
  }
};
