export const validateSignup = (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || typeof username !== "string" || username.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: "Username is required and must be at least 3 characters long.",
    });
  }

  if (!email || typeof email !== "string") {
    return res.status(400).json({
      success: false,
      message: "Valid email is required.",
    });
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address.",
    });
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password is required and must be at least 6 characters long.",
    });
  }

  next();
};

export const validateSignin = (req, res, next) => {
  const { email, username, identifier, password } = req.body;

  if (!email && !username && !identifier) {
    return res.status(400).json({
      success: false,
      message: "Either email, username, or identifier is required.",
    });
  }

  if (!password || typeof password !== "string") {
    return res.status(400).json({
      success: false,
      message: "Password is required.",
    });
  }

  next();
};
