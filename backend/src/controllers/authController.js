import {
  signupService,
  signinService,
  getUserProfileService,
  getAllUsersService,
} from "../services/authService.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const signupController = async (req, res) => {
  try {
    const { username, email, password, role, avatar } = req.body;
    const { user, token } = await signupService({
      username,
      email,
      password,
      role,
      avatar,
    });

    res.cookie("token", token, COOKIE_OPTIONS);

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to register user.",
    });
  }
};

export const signinController = async (req, res) => {
  try {
    const { email, username, identifier, password } = req.body;
    const { user, token } = await signinService({
      identifier,
      email,
      username,
      password,
    });

    res.cookie("token", token, COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      message: "Signed in successfully.",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to sign in.",
    });
  }
};

export const logoutController = async (req, res) => {
  try {
    res.clearCookie("token", COOKIE_OPTIONS);
    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to log out.",
      error: error.message,
    });
  }
};

export const getProfileController = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Profile retrieved successfully.",
      data: req.user,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to retrieve profile.",
    });
  }
};

export const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsersService();
    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully.",
      count: users.length,
      data: users,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to retrieve users.",
    });
  }
};
