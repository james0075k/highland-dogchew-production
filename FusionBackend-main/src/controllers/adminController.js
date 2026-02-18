import jwt from "jsonwebtoken";
import crypto from "crypto";
import AdminModel from "../models/adminModel.js";
import Config from "../config/Config.js";
import handleError from "../utils/errorHandler.js";
import sendEmail from "../utils/sendEmail.js";

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




// 🔒 Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      // Don't reveal if email exists
      return res.status(200).json({ success: true, message: "If an account with that email exists, a reset link has been sent." });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    admin.resetPasswordToken = hashedToken;
    admin.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await admin.save({ validateBeforeSave: false });

    // Build reset URL
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetUrl = `${frontendUrl}/admin/reset-password/${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #f8fafc; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0c1e35; margin: 0;">Highland Dog Chew</h1>
          <p style="color: #64748b; font-size: 14px;">Password Reset Request</p>
        </div>
        <div style="background: white; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <p style="color: #334155;">Hello <strong>${admin.fullName}</strong>,</p>
          <p style="color: #334155;">You requested a password reset. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}" style="background: #f59e0b; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #94a3b8; font-size: 12px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>
      </div>
    `;

    await sendEmail({
      to: admin.email,
      subject: "Password Reset - Highland Dog Chew Admin",
      html,
    });

    return res.status(200).json({
      success: true,
      message: "If an account with that email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ success: false, message: "Failed to send reset email. Please try again." });
  }
};

// 🔓 Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const admin = await AdminModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+password");

    if (!admin) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    admin.password = password;
    admin.resetPasswordToken = null;
    admin.resetPasswordExpires = null;
    await admin.save();

    return res.status(200).json({ success: true, message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ success: false, message: "Failed to reset password" });
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
