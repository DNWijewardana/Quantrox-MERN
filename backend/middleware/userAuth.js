import jwt from "jsonwebtoken";

// Middleware to check if user is authenticated using JWT token
const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.json({ success: false, message: "Not Authorized, Login Again" });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if (tokenDecode.id) {
      req.userId = tokenDecode.id; // <-- attach to req directly
      next();
    } else {
      return res.json({
        success: false,
        message: "Not Authorized, Login Again",
      });
    }
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export default userAuth;
