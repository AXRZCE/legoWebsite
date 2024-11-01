const express = require('express');
const path = require('path');
const app = express();

// Set up view engine and static file directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));  // This should be the path to your EJS templates
app.use(express.static(path.join(__dirname, 'public')));  // Static files

// Root route rendering an EJS view
app.get('/', (req, res) => {
    res.render('home', { title: "Home Page" });  // Render `home.ejs` in `views`
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
