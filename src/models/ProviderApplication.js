const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 100 },
  phone: { type: String, required: true, trim: true, maxlength: 25 },
  email: { type: String, trim: true, lowercase: true, maxlength: 254, default: "" },
  city: { type: String, required: true, enum: ["Bagalkot", "Belagavi", "Hubballi", "Dharwad", "Vijayapura", "Gadag", "Koppal"] },
  category: { type: String, required: true, trim: true, maxlength: 80 },
  experience: { type: String, trim: true, maxlength: 80, default: "" },
  price: { type: String, trim: true, maxlength: 100, default: "" },
  description: { type: String, required: true, trim: true, maxlength: 3000 },
  consent: { type: Boolean, required: true, default: false },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true }
}, { timestamps: true });
module.exports = mongoose.model("ProviderApplication", schema);
