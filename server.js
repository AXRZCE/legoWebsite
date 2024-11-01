/********************************************************************************
* WEB322 – Assignment 04
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Aksharajsinh K. Parmar Student ID: _140204223_ Date: _ 31st Oct,2024__
*
* Published URL: https://legowebsite-95k5.onrender.com
*
********************************************************************************/

const express = require('express');
const path = require('path');
const app = express();
const legoSets = require('./modules/legoSets');

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Route setup will only function correctly if initialization is successful
legoSets.initialize()
    .then(() => {
        console.log("legoSets initialized successfully.");

        // Route to display all sets with optional theme filtering
        app.get('/lego/sets', (req, res) => {
            const themeFilter = req.query.theme || '';
            const allSets = legoSets.getAllSets(themeFilter);
            const allThemes = legoSets.getAllThemes();

            res.render('sets', {
                sets: allSets,
                themes: allThemes,
                selectedTheme: themeFilter
            });
        });

        // Route to display a specific set by set number
        app.get('/lego/sets/:set_num', (req, res) => {
            const set = legoSets.getSetByNum(req.params.set_num);
            if (set) {
                res.render('set', { set });
            } else {
                res.status(404).render('404');
            }
        });

        // Home route with featured sets
        app.get('/', (req, res) => {
            const featuredSets = legoSets.getFeaturedSets();
            res.render('home', { featuredSets });
        });

        // About route
        app.get('/about', (req, res) => {
            res.render('about');
        });

    })
    .catch(err => {
        console.error("Initialization failed:", err);
        
        // If initialization fails, you can add a route to handle errors
        app.get('*', (req, res) => {
            res.status(500).send("Initialization failed. Please try again later.");
        });
    });

// Start the server outside of initialize to ensure it runs regardless
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
