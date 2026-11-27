const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const mongoose = require("./config/mongoose-connection.js");
const expressSession = require("express-session");
const flash = require("connect-flash");
const cors = require("cors");

const ownersRouter = require("./routes/ownersRouter.js");
const productsRouter = require("./routes/productsRouter.js");
const usersRouter = require("./routes/usersRouter.js");
const indexRouter = require("./routes/index.js");

// CORS FIRST
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://944a-153-117-47-65.ngrok-free.app",
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(
    expressSession({
        resave: false,
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET
    })
);

app.use(flash());

app.use("/", indexRouter);
app.use("/owners", ownersRouter);
app.use("/products", productsRouter);
app.use("/users", usersRouter);

if (process.env.NODE_ENV !== "production") {
    app.listen(3000, () => console.log("Server running"));
}
module.exports = app;

