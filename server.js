/********************************************************************************
* WEB322 – Assignment 06
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Aksharajsinh K. Parmar  Student ID: 1402024223 Date: 24.11.24
*
* Published URL: https://lego-website-seven.vercel.app/
********************************************************************************/

const express = require("express");
const path = require("path");
const clientSessions = require("client-sessions");
const legoData = require("./modules/legoSets");
const authData = require("./modules/auth-service");

const app = express();
const PORT = process.env.PORT || 1000;
app.use(express.static(path.join(__dirname, "public")));
// Middleware for client sessions
app.use(
  clientSessions({
    cookieName: "session",
    secret: "web322_assignment_secret", // Replace with a strong secret
    duration: 2 * 60 * 1000, // Session duration in milliseconds (2 minutes)
    activeDuration: 1000 * 60, // Extend duration if active
  })
);

// Middleware to parse form data and serve static files
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Middleware to attach session data to templates
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Middleware to ensure a user is logged in
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

// Set view engine and views directory
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Initialize database connections
Promise.all([legoData.initialize(), authData.initialize()])
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize databases:", err);
  });

// Routes for LEGO sets
app.get("/", async (req, res) => {
  try {
    const featuredSets = await legoData.getFeaturedSets(6);
    res.render("home", { featuredSets });
  } catch (err) {
    res.render("500", { message: `Error fetching featured sets: ${err.message}` });
  }
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/lego/sets", async (req, res) => {
  try {
    const themeFilter = req.query.theme || "";
    const themes = await legoData.getAllThemes();
    const sets = themeFilter
      ? await legoData.getSetsByTheme(themeFilter)
      : await legoData.getAllSets();
    res.render("sets", { sets, themes, selectedTheme: themeFilter });
  } catch (err) {
    res.status(500).render("500", { message: `Unable to load sets: ${err.message}` });
  }
});

app.get("/lego/sets/:num", async (req, res) => {
  try {
    const set = await legoData.getSetByNum(req.params.num);
    res.render("set", { set });
  } catch (err) {
    res.status(404).render("404", { message: err });
  }
});

// Routes protected by ensureLogin middleware
app.get("/lego/addSet", ensureLogin, async (req, res) => {
  const themes = await legoData.getAllThemes();
  res.render("addSet", { themes });
});

app.post("/lego/addSet", ensureLogin, async (req, res) => {
  try {
    await legoData.addSet(req.body);
    res.redirect("/lego/sets");
  } catch (err) {
    res.render("500", { message: `Unable to add set: ${err.message}` });
  }
});

// Ensure only logged-in users can edit a set
app.get('/lego/editSet/:num', ensureLogin, async (req, res) => {
  try {
    const set = await legoData.getSetByNum(req.params.num);
    const themes = await legoData.getAllThemes();
    res.render('editSet', { set, themes, session: req.session });
  } catch (err) {
    res.status(404).render('404', { message: err });
  }
});

// Ensure only logged-in users can delete a set
app.get('/lego/deleteSet/:num', ensureLogin, async (req, res) => {
  try {
    await legoData.deleteSet(req.params.num);
    res.redirect('/lego/sets');
  } catch (err) {
    res.status(500).render('500', { message: `Unable to delete set: ${err.message}` });
  }
});


// Routes for user authentication
// GET /register route
app.get("/register", (req, res) => {
  res.render("register", { successMessage: null, errorMessage: null });
});

// POST /register route
app.post("/register", async (req, res) => {
  try {
    await authData.registerUser(req.body);
    res.render("register", { successMessage: "User created successfully!", errorMessage: null });
  } catch (err) {
    res.render("register", { successMessage: null, errorMessage: err });
  }
});


app.get("/login", (req, res) => {
  res.render("login", {
    userName: req.session.user ? req.session.user.userName : "", // Provide a default value if not logged in
    errorMessage: null, // Make sure errorMessage is defined as well
  });
});


app.post("/login", async (req, res) => {
  req.body.userAgent = req.get("User-Agent");
  try {
    const user = await authData.checkUser(req.body);
    req.session.user = {
      userName: user.userName,
      email: user.email,
      loginHistory: user.loginHistory,
    };
    res.redirect("/lego/sets");
  } catch (err) {
    res.render("login", { errorMessage: err, userName: req.body.userName });
  }
});

app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory", { user: req.session.user });
});

// 404 Error handling
app.use((req, res) => {
  res.status(404).render("404", { message: "Page not found." });
});
