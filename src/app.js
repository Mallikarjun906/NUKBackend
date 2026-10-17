const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(",").map((v) => v.trim()) : false,
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: "draft-7", legacyHeaders: false }));

app.get("/health", (req, res) => res.json({ success: true, message: "NUK RentServe API is running." }));
app.get("/api/health", (req, res) => res.json({ success: true, message: "NUK RentServe API is running." }));
app.get("/api/v1/health", (req, res) => res.json({ success: true, message: "NUK RentServe API is running." }));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/v1/users", require("./routes/userRoutes"));
app.use("/api/providers", require("./routes/providerRoutes"));
app.use("/api/v1/providers", require("./routes/providerRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/v1/categories", require("./routes/categoryRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/v1/services", require("./routes/serviceCompatRoutes"));
app.use("/api/v1/services", require("./routes/serviceRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/v1/jobs", require("./routes/jobRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/v1/applications", require("./routes/applicationRoutes"));
app.use("/api/properties", require("./routes/propertyRoutes"));
app.use("/api/v1/properties", require("./routes/propertyCompatRoutes"));
app.use("/api/v1/properties", require("./routes/propertyRoutes"));
app.use("/api/enquiries", require("./routes/enquiryRoutes"));
app.use("/api/v1/enquiries", require("./routes/enquiryRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/v1/reviews", require("./routes/reviewRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
