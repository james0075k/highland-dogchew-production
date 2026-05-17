import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import AdminModel from "../models/adminModel.js";
import Config from "../config/Config.js";
import sendEmail from "../utils/sendEmail.js";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resetTokenSchema,
  changePasswordSchema,
} from "../validations/authValidationSchema.js";

// ─── Lockout policy ───────────────────────────────────────────────────────────
// After MAX_LOGIN_ATTEMPTS wrong passwords in a row, the account is locked
// for LOCK_DURATION_MS. Successful login resets the counter. Combined with
// the IP-level authLimiter this makes online brute force effectively futile.
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS   = 15 * 60 * 1000; // 15 minutes

// Single canonical "bad credentials" string used for every failed-login branch
// (unknown email, wrong password, locked account). Prevents user enumeration.
const INVALID_LOGIN_MSG = "Invalid email or password";

// 🔐 Admin Login
export const loginAdmin = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      // Single message — never echo back details that help an attacker
      // distinguish "bad email format" from "user not found".
      return res.status(400).json({ success: false, message: INVALID_LOGIN_MSG });
    }
    const { email, password } = value;

    const admin = await AdminModel
      .findOne({ email })
      .select("+password +failedLoginAttempts +lockedUntil");

    // Constant-ish path: always run bcrypt.compare so the response time
    // doesn't reveal whether the email exists. Compare against a fixed dummy
    // hash when no admin is found.
    const DUMMY_HASH = "$2a$12$CwTycUXWue0Thq9StjUM0uJ8c/jK9ohh.X2tQyJ5Ftq3Y8r1qLg6e";
    const hashToCompare = admin?.password || DUMMY_HASH;

    // Locked? Block before we even bother checking the password.
    if (admin?.lockedUntil && admin.lockedUntil.getTime() > Date.now()) {
      return res.status(429).json({ success: false, message: INVALID_LOGIN_MSG });
    }

    const ok = await bcrypt.compare(password, hashToCompare);

    if (!admin || !ok) {
      if (admin) {
        admin.failedLoginAttempts = (admin.failedLoginAttempts || 0) + 1;
        if (admin.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
          admin.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
          admin.failedLoginAttempts = 0; // reset counter once locked
        }
        await admin.save({ validateBeforeSave: false });
      }
      return res.status(400).json({ success: false, message: INVALID_LOGIN_MSG });
    }

    // ── Success ─────────────────────────────────────────────────────────────
    admin.failedLoginAttempts = 0;
    admin.lockedUntil = null;
    admin.lastLogin = Date.now();
    await admin.save({ validateBeforeSave: false });

    const { accessToken, refreshToken } = generateTokens(admin);

    const accessTokenExpiresMs  = parseInt(Config.jwtAccessTokenExpiresIn)  * 1000;
    const refreshTokenExpiresMs = parseInt(Config.jwtRefreshTokenExpiresIn) * 1000;

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   accessTokenExpiresMs,
      path:     '/',
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   refreshTokenExpiresMs,
      path:     '/',
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id:       admin._id,
        fullName: admin.fullName,
        email:    admin.email,
        role:     admin.role,
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    // Generic — never tell the client we crashed (could be a probe).
    return res.status(400).json({ success: false, message: INVALID_LOGIN_MSG });
  }
};

// 📝 Admin Register (only available when no admin exists)
export const registerAdmin = async (req, res) => {
  try {
    const adminCount = await AdminModel.countDocuments();
    if (adminCount > 0) {
      return res.status(403).json({ success: false, message: "Registration is disabled" });
    }

    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    // `role` is never trusted from req.body. First admin is always superadmin.
    const admin = await AdminModel.create({
      fullName:    value.fullName,
      email:       value.email,
      phoneNumber: value.phoneNumber,
      password:    value.password,
      role:        "superadmin",
    });

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: {
        id:          admin._id,
        fullName:    admin.fullName,
        email:       admin.email,
        phoneNumber: admin.phoneNumber,
        role:        admin.role,
      },
    });
  } catch (err) {
    console.error("Register error:", err.message);
    return res.status(500).json({ success: false, message: "Unable to register admin" });
  }
};

// 🔄 Change Password
export const changeAdminPassword = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?._id;
    if (!adminId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const admin = await AdminModel.findById(adminId).select("+password");
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

    const isMatch = await admin.comparePassword(value.oldPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Old password is incorrect" });
    }

    // Reject re-using the same password.
    if (value.oldPassword === value.newPassword) {
      return res.status(400).json({ success: false, message: "New password must differ from the current one" });
    }

    admin.password = value.newPassword;
    await admin.save();

    try {
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px;background:#f8fafc;border-radius:12px;">
          <div style="text-align:center;margin-bottom:24px;">
            <h1 style="color:#0c1e35;margin:0;">Highland Yak Chew</h1>
            <p style="color:#64748b;font-size:14px;">Security Notification</p>
          </div>
          <div style="background:white;padding:24px;border-radius:8px;border:1px solid #e2e8f0;">
            <p style="color:#334155;">Hello <strong>${escapeHtml(admin.fullName)}</strong>,</p>
            <p style="color:#334155;">Your admin account password was changed successfully.</p>
            <p style="color:#334155;"><strong>Time:</strong> ${new Date().toUTCString()}</p>
            <p style="color:#f59e0b;font-weight:bold;">If you did not make this change, contact your system administrator immediately.</p>
          </div>
        </div>
      `;
      await sendEmail({ to: admin.email, subject: "Your Admin Password Was Changed", html });
    } catch (emailErr) {
      console.error("Password-change email failed:", emailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Password changed successfully. A confirmation email has been sent.",
    });
  } catch (err) {
    console.error("Change password error:", err.message);
    return res.status(500).json({ success: false, message: "Unable to change password" });
  }
};

export const getCurrentAdmin = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?._id;
    if (!adminId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const admin = await AdminModel.findById(adminId).select("-password");
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

    return res.status(200).json({ success: true, message: "Admin retrieved successfully", data: admin });
  } catch (err) {
    console.error("Fetch admin error:", err.message);
    return res.status(500).json({ success: false, message: "Unable to fetch admin" });
  }
};

// 🔒 Forgot Password — always returns the same response, regardless of whether
// the email exists. This is the standard defence against account enumeration.
export const forgotPassword = async (req, res) => {
  const GENERIC_RESPONSE = {
    success: true,
    message: "If an account with that email exists, a reset link has been sent.",
  };

  try {
    const { error, value } = forgotPasswordSchema.validate(req.body);
    if (error) return res.status(200).json(GENERIC_RESPONSE); // don't reveal validation failure

    const admin = await AdminModel.findOne({ email: value.email });
    if (!admin) return res.status(200).json(GENERIC_RESPONSE);

    const resetToken  = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    admin.resetPasswordToken   = hashedToken;
    admin.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await admin.save({ validateBeforeSave: false });

    const appUrl   = process.env.APP_URL || process.env.FRONTEND_URL || "https://highlanddogchew.co.uk";
    const resetUrl = `${appUrl}/reset-password/${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #f8fafc; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0c1e35; margin: 0;">Highland Yak Chew</h1>
          <p style="color: #64748b; font-size: 14px;">Admin Password Reset</p>
        </div>
        <div style="background: white; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <p style="color: #334155;">Hello <strong>${escapeHtml(admin.fullName)}</strong>,</p>
          <p style="color: #334155;">You requested a password reset. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}" style="background: #f59e0b; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #94a3b8; font-size: 12px;">This link expires in <strong>15 minutes</strong>. If you didn't request this, you can safely ignore this email.</p>
        </div>
      </div>
    `;

    await sendEmail({ to: admin.email, subject: "Admin Password Reset", html });
    return res.status(200).json(GENERIC_RESPONSE);
  } catch (err) {
    console.error("Forgot password error:", err.message);
    // Still return the generic response so attackers can't probe by triggering errors.
    return res.status(200).json(GENERIC_RESPONSE);
  }
};

// 🔓 Reset Password
export const resetPassword = async (req, res) => {
  try {
    const tokenCheck = resetTokenSchema.validate(req.params);
    if (tokenCheck.error) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const hashedToken = crypto.createHash("sha256").update(tokenCheck.value.token).digest("hex");

    const admin = await AdminModel.findOne({
      resetPasswordToken:   hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+password");

    if (!admin) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    admin.password             = value.password;
    admin.resetPasswordToken   = null;
    admin.resetPasswordExpires = null;
    admin.failedLoginAttempts  = 0;
    admin.lockedUntil          = null;
    await admin.save();

    return res.status(200).json({ success: true, message: "Password has been reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to reset password" });
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Belt-and-braces against accidental HTML injection in the email templates.
// fullName comes from registration and is normally safe, but we don't want
// any future input-path bug to render in admin inboxes.
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const generateTokens = (admin) => {
  const accessToken = jwt.sign(
    { id: admin._id, email: admin.email, role: admin.role },
    Config.jwtSecret,
    { expiresIn: Config.jwtAccessTokenExpiresIn }
  );
  const refreshToken = jwt.sign(
    { id: admin._id },
    Config.jwtRefreshSecret,
    { expiresIn: Config.jwtRefreshTokenExpiresIn }
  );
  return { accessToken, refreshToken };
};
