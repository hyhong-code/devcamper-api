const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");

// Load route files
const bootcamps = require("./routes/bootcamps");

// Load env vars
dotenv.config({ path: "./config/config.env" });

const app = express();

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Mount routers
app.use("/api/v1/bootcamps", bootcamps);

const PORT = process.env.PORT || 5000;
app.listen(5000, () =>
  console.log(`Server up in ${process.env.NODE_ENV} mode on port ${PORT}.`)
);
