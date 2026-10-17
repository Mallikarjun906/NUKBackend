const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const ServiceProvider = require("../models/ServiceProvider");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

function createAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m"
  });
}
function createRefreshToken(user) {
  return jwt.sign({ sub: user.id, type: "refresh" }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d"
  });
}
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role } = req.body;
  const location = req.body.location || req.body.city || "Bagalkot";
  if (!name || !email || !phone || !password) throw new ApiError(400, "name, email, phone, password and location are required.");
  if (typeof password !== "string" || password.length < 8 || password.length > 72) throw new ApiError(400, "Password must contain 8–72 characters.");
  const normalizedEmail = String(email).trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) throw new ApiError(409, "Email is already registered.");
  const safeRole = (role === "provider" || role === "propertyOwner" || role === "owner") ? "provider" : "customer";
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email: normalizedEmail, phone, password: hashedPassword, role: safeRole, location });
  if (safeRole === "provider") {
    await ServiceProvider.create({ userId: user._id, displayName: name });
  }
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();
  res.status(201).json(new ApiResponse(201, {
    user: { id: user.id, name: user.name, email: user.email, role: user.role, location: user.location },
    accessToken,
    refreshToken
  }, "Registration successful."));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Email and password are required.");
  const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select("+password +refreshTokenHash");
  if (!user || !(await bcrypt.compare(password, user.password))) throw new ApiError(401, "Invalid email or password.");
  if (!user.isActive) throw new ApiError(403, "Account is inactive.");
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();
  res.json(new ApiResponse(200, {
    user: { id: user.id, name: user.name, email: user.email, role: user.role, location: user.location },
    accessToken,
    refreshToken
  }, "Login successful."));
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new ApiError(400, "refreshToken is required.");
  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token.");
  }
  if (payload.type !== "refresh") throw new ApiError(401, "Invalid refresh token.");
  const user = await User.findById(payload.sub).select("+refreshTokenHash");
  if (!user || !user.isActive || !user.refreshTokenHash || user.refreshTokenHash !== hashToken(refreshToken)) {
    throw new ApiError(401, "Refresh token has been revoked.");
  }
  const nextAccessToken = createAccessToken(user);
  const nextRefreshToken = createRefreshToken(user);
  user.refreshTokenHash = hashToken(nextRefreshToken);
  await user.save();
  res.json(new ApiResponse(200, { accessToken: nextAccessToken, refreshToken: nextRefreshToken }));
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { $unset: { refreshTokenHash: 1 } });
  res.json(new ApiResponse(200, null, "Logged out."));
});

module.exports = { register, login, refresh, logout };
