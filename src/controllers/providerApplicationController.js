const ProviderApplication = require("../models/ProviderApplication");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const SUPPORTED_CITIES = ["Bagalkot", "Belagavi", "Hubballi", "Dharwad", "Vijayapura", "Gadag", "Koppal"];
const submit = asyncHandler(async (req, res) => {
  const { fullName, dob, phone, email, city, category, experience, price, description, consent } = req.body;
  if (!fullName || !dob || !phone || !city || !category || !description) throw new ApiError(400, "Please complete all required provider application fields.");
  const birth = new Date(dob);
  if (!Number.isFinite(birth.getTime()) || birth > new Date()) throw new ApiError(400, "Please provide a valid date of birth.");
  let age = new Date().getFullYear() - birth.getFullYear();
  const month = new Date().getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && new Date().getDate() < birth.getDate())) age--;
  if (age < 18) throw new ApiError(400, "Service providers must be at least 18 years old.");
  if (!SUPPORTED_CITIES.includes(city)) throw new ApiError(400, "Please choose one of the supported cities.");
  if (!(consent === true || consent === "on" || consent === "true")) throw new ApiError(400, "Privacy and verification consent is required.");
  // DOB is validated but deliberately not retained. This form does not collect Aadhaar/PAN numbers.
  const application = await ProviderApplication.create({ fullName, phone, email: email || "", city, category, experience: experience || "", price: price || "", description, consent: true });
  res.status(201).json(new ApiResponse(201, { id: application.id, status: application.status }, "Provider application submitted for review."));
});
module.exports = { submit };
