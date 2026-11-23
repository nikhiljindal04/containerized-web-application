import User from "../models/userModel.js";

/**
 * Service to register a new user
 */
export const signupService = async ({ username, email, password, role, avatar }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedUsername = username.toLowerCase().trim();

  // Check if username or email already exists
  const existingUser = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
  });

  if (existingUser) {
    if (existingUser.email === normalizedEmail) {
      const error = new Error("An account with this email already exists.");
      error.statusCode = 409;
      throw error;
    }
    if (existingUser.username === normalizedUsername) {
      const error = new Error("This username is already taken.");
      error.statusCode = 409;
      throw error;
    }
  }

  // Create new user
  const user = await User.create({
    username: normalizedUsername,
    email: normalizedEmail,
    password,
    role: role || "user",
    avatar: avatar || "",
  });

  const token = user.generateAuthToken();

  return {
    user: user.toJSON(),
    token,
  };
};

/**
 * Service to authenticate existing user
 */
export const signinService = async ({ identifier, email, username, password }) => {
  const loginIdentifier = (identifier || email || username || "").toLowerCase().trim();

  if (!loginIdentifier) {
    const error = new Error("Email or username is required.");
    error.statusCode = 400;
    throw error;
  }

  // Find user by either email or username, explicitly include password
  const user = await User.findOne({
    $or: [{ email: loginIdentifier }, { username: loginIdentifier }],
  }).select("+password");

  if (!user) {
    const error = new Error("Invalid email/username or password.");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    const error = new Error("Invalid email/username or password.");
    error.statusCode = 401;
    throw error;
  }

  const token = user.generateAuthToken();

  return {
    user: user.toJSON(),
    token,
  };
};

/**
 * Service to get user by ID
 */
export const getUserProfileService = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

/**
 * Service to get all users (Admin only)
 */
export const getAllUsersService = async () => {
  return await User.find().select("-password").sort({ createdAt: -1 });
};
