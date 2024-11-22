const path = require('path'); // Ensure this is required
const legoData = require("./modules/legoSets");
const express = require('express');
const app = express(); // Initialize 'app' first

const HTTP_PORT = process.env.PORT || 8080;

// Middleware to serve static files and parse URL-encoded data
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Set the view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Move this line after 'app' initialization

app.get('/about', (req, res) => {
  res.render("about");
});

app.get("/lego/addSet", async (req, res) => {
  let themes = await legoData.getAllThemes();
  res.render("addSet", { themes: themes });
});

app.post("/lego/addSet", async (req, res) => {
  try {
    await legoData.addSet(req.body);
    res.redirect("/lego/sets");
  } catch (err) {
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

app.get("/lego/editSet/:num", async (req, res) => {
  try {
    let set = await legoData.getSetByNum(req.params.num);
    let themes = await legoData.getAllThemes();

    res.render("editSet", { set, themes });
  } catch (err) {
    res.status(404).render("404", { message: err });
  }
});

app.post("/lego/editSet", async (req, res) => {
  try {
    await legoData.editSet(req.body.set_num, req.body);
    res.redirect("/lego/sets");
  } catch (err) {
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

app.get("/lego/deleteSet/:num", async (req, res) => {
  try {
    await legoData.deleteSet(req.params.num);
    res.redirect("/lego/sets");
  } catch (err) {
    res.status(500).render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

app.get("/lego/sets", async (req, res) => {
  try {
    const themeFilter = req.query.theme || '';
    const themes = await legoData.getAllThemes();
    const sets = themeFilter
      ? await legoData.getSetsByTheme(themeFilter)
      : await legoData.getAllSets();

    res.render("sets", {
      sets,
      themes,
      selectedTheme: themeFilter, // Pass selected theme for the dropdown
    });
  } catch (err) {
    console.error("Error fetching sets or themes:", err);
    res.status(500).render("500", { message: `Unable to load sets: ${err.message}` });
  }
});

app.get("/lego/sets/:num", async (req, res) => {
  try {
    let set = await legoData.getSetByNum(req.params.num); // Fetch set with theme details
    res.render("set", { set }); // Pass set to the EJS template
  } catch (err) {
    res.status(404).render("404", { message: err });
  }
});

app.get('/', async (req, res) => {
  try {
    // Fetch featured sets
    let featuredSets = await legoData.getFeaturedSets(6); // Fetch 6 featured sets
    console.log(featuredSets); // Debugging to confirm data is fetched
    res.render("home", { featuredSets }); // Pass the data to the template
  } catch (err) {
    console.error("Error fetching featured sets:", err);
    res.render("500", { message: `Error fetching featured sets: ${err.message}` });
  }
});

app.use((req, res, next) => {
  res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for" });
});

// Initialize database and start server
legoData.initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`server listening on: ${HTTP_PORT}`);
    });
  })
  .catch(err => {
    console.log(err);
  });
