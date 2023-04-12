const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");
const bodyParser = require("body-parser");
const indexRoute = require("./routes/indexRoute");
const cors = require("cors");
require("dotenv").config();

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use("/", express.static(path.join(__dirname, "/upload")));

app.use("/", indexRoute);

app.listen(process.env.PORT || 5000, () => {
  console.log(`server is running on port ${process.env.PORT}!`);
});
