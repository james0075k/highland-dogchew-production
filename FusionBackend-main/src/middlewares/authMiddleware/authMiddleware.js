import jwt from "jsonwebtoken";
import Config from "../../config/Config.js";
import AdminModel from "../../models/adminModel.js";

export const authenticate = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } 
  // 2. Check cookies (for browser-based auth)
  else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

if (!token) {
  return res.status(401).json({ 
    success: false, 
    message: "You must be logged in to perform this action. Please provide a valid authentication token." 
  });
}

  try {
    // Verify token and handle different error cases
    const decoded = jwt.verify(token, Config.jwtSecret);
    
    // Additional verification - check token is not blacklisted
    const admin = await AdminModel.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        message: "User account not found" 
      });
    }

    // Check if password was changed after token was issued
    if (admin.passwordChangedAt && decoded.iat < admin.passwordChangedAt.getTime() / 1000) {
      return res.status(401).json({ 
        success: false, 
        message: "Password was changed. Please log in again." 
      });
    }

    // Attach user to request
    req.user = admin;
    
    // Remove sensitive data
    admin.password = undefined;
    admin.__v = undefined;

    // Continue to next middleware
    next();
    
  } catch (err) {
    let errorMessage = "Invalid token";
    
    // Provide more specific error messages
    if (err.name === "TokenExpiredError") {
      errorMessage = "Token expired. Please log in again.";
    } else if (err.name === "JsonWebTokenError") {
      errorMessage = "Invalid token format";
    }

    return res.status(401).json({ 
      success: false, 
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access forbidden. Required roles: ${allowedRoles.join(", ")}` 
      });
    }
    
    next();
  };
};