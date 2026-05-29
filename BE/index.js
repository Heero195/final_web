const express = require("express");
const session = require("express-session");
const app = express();
const path = require("path");
const cors = require("cors");
const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const AuthRouter = require("./routes/AuthRouter");

const requireLogin = require("./middleware/auth");

dbConnect();

// Trust the first proxy to read x-forwarded-proto properly in CodeSandbox
app.set("trust proxy", 1);

// Configure CORS to dynamically accept origins and support credentials
app.use(cors({
  origin: function (origin, callback) {
    // Reflect the request origin back to allow credentials
    callback(null, origin || true);
  },
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: "secretKey",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));


app.use((req, res, next) => {
  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    req.session.cookie.sameSite = "none";
    req.session.cookie.secure = true;
  }
  next();
});

app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/user", UserRouter);
app.use("/", PhotoRouter);
app.use("/admin", AuthRouter);

app.get("/", (request, response) => {
  response.send({ message: "Hello from photo-sharing app API!" });
});

app.listen(8081, () => {
  console.log("server listening on port 8081");
});
