const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./config/db");
const colors = require("colors");
const errorHandler = require("./middleware/error");
const fileUpload = require("express-fileupload");
const path = require("path");
const cookieParser = require("cookie-parser");

const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Connect to database
connectDB();

// Load route files
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");
const users = require("./routes/users");
const reviews = require("./routes/reviews");

const app = express();

// Body parser
app.use(express.json());
// Cookie Parser
app.use(cookieParser());
// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// File uploads
app.use(fileUpload());
// Sanitize request
app.use(mongoSanitize());
// Set security headers
app.use(helmet());
// Prevent xss attacks
app.use(xss());
// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minuates
  max: 100, // 100 requests
});
app.use(limiter);
// Prevent http param polution
app.use(hpp());
// Enable cors for public api ***
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Mount routers
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);

// Error handler
app.use(errorHandler); // must be  after routers to catch error

const PORT = process.env.PORT || 5000;
const server = app.listen(5000, () =>
  console.log(
    `Server up in ${process.env.NODE_ENV} mode on port ${PORT}.`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});
