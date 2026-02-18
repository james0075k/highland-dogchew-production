import dotenv from "dotenv";

dotenv.config();

export default {
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "1d",
  jwtRefreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
};  