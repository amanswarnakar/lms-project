require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const { requireAuth } = require("./middleware/authMiddleware");
var favicon = require('serve-favicon');

mongoose.set("strictQuery", true);
const uri = process.env.MONGO_DB_URI;
const connectionParams = { useNewUrlParser: true, useUnifiedTopology: true };
mongoose
  .connect(uri, connectionParams)
  .then(() => {
    console.info("Connected to the DB.");
  })
  .catch((err) => console.log(err));

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(favicon(__dirname + '/public/media/images/Funstudy.png'));

app.get("/", (req, res) => {
  res.render("home");
});

app.use(authRoutes);

app.use(function (req, res, next) {
  let err = new Error("File Not Found");
  err.status = 404;
  next(err);
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
  console.log(`Server started on ${port}`);
});
