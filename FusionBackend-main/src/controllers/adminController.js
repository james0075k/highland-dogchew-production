import jwt from "jsonwebtoken";
import AdminModel from "../models/adminModel.js";
import Config from "../config/Config.js";
import handleError from "../utils/errorHandler.js";

// 🔐 Admin Login
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const admin = await AdminModel.findOne({ email }).select("+password");
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const { accessToken, refreshToken } = generateTokens(admin);
    admin.lastLogin = Date.now();
    await admin.save();

    const accessTokenExpiresMs = parseInt(Config.jwtAccessTokenExpiresIn) * 1000;
    const refreshTokenExpiresMs = parseInt(Config.jwtRefreshTokenExpiresIn) * 1000;

    // Set tokens as httpOnly cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: accessTokenExpiresMs,
      path: '/',
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: refreshTokenExpiresMs,
      path: '/',
    });

    // Return tokens also in JSON response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        accessToken,    // <-- added here
        refreshToken,   // <-- added here
      }
    });
  } catch (error) {
    handleError(res, error, "Unable to login admin");
  }
};


// 📝 Admin Register
export const registerAdmin = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, role } = req.body;

    // Simple field validation
    if (!fullName || !email || !phoneNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const existingEmail = await AdminModel.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const existingPhone = await AdminModel.findOne({ phoneNumber });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number already exists",
      });
    }

    const admin = await AdminModel.create({
      fullName,
      email,
      phoneNumber,
      password,
      role,
    });

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        phoneNumber: admin.phoneNumber,
        role: admin.role,
      },
    });
  } catch (error) {
    handleError(res, error, "Unable to register admin");
  }
};



// 🔄 Change Password
export const changeAdminPassword = async (req, res) => {
  try {
    console.log("req.user:", req.user); // ✅ changed from req.admin
    const adminId = req.user?.id; // ✅ changed from req.admin?.id
    console.log("Admin ID from token:", adminId);

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old and new password must be provided",
      });
    }

    const admin = await AdminModel.findById(adminId).select("+password");
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const isMatch = await admin.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    admin.password = newPassword;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error in change password:", error);
    handleError(res, error, "Unable to change password"); 
  }
};



export const getCurrentAdmin = async (req, res) => {
  try {
    const adminId = req.user?.id; // Assuming `authenticate` middleware sets req.user
    const admin = await AdminModel.findById(adminId).select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Admin retrieved successfully",
      data: admin,
    });
  } catch (error) {
    handleError(res, error, "Unable to fetch admin");
  }
};




// 🔑 Generate Tokens
const generateTokens = (admin) => {
  const accessToken = jwt.sign(
    {
      id: admin._id,
      email: admin.email,
      role: admin.role,
    },
    Config.jwtSecret,
    { expiresIn: Config.jwtAccessTokenExpiresIn }
  );

  const refreshToken = jwt.sign(
    {
      id: admin._id,
    },
    Config.jwtRefreshSecret,
    { expiresIn: Config.jwtRefreshTokenExpiresIn }
  );

  return { accessToken, refreshToken };
};
