const User = require("../models/User");
const ServiceListing = require("../models/ServiceListing");
const Property = require("../models/Property");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  const [users, total] = await Promise.all([
    User.find(filter).select("name email phone role location isActive createdAt").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter)
  ]);
  res.json(new ApiResponse(200, { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }));
});

const setUserStatus = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) throw new ApiError(400, "You cannot deactivate your own account.");
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: Boolean(req.body.isActive) }, { new: true, runValidators: true })
    .select("name email role isActive");
  if (!user) throw new ApiError(404, "User not found.");
  res.json(new ApiResponse(200, user, "User status updated."));
});

const dashboardStats = asyncHandler(async (req, res) => {
  const [users, services, properties] = await Promise.all([
    User.countDocuments(), ServiceListing.countDocuments(), Property.countDocuments()
  ]);
  res.json(new ApiResponse(200, { users, services, properties }));
});

module.exports = { listUsers, setUserStatus, dashboardStats };
