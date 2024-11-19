/********************************************************************************
* WEB322 – Assignment 04
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Aksharajsinh K. Parmar Student ID: _140204223_ Date: _31st Oct, 2024__
*
* Published URL: https://legowebsite-95k5.onrender.com
*
********************************************************************************/

const express = require('express');
const path = require('path');
const legoSets = require('./modules/legoSets');

const app = express();

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

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
            legoSets.getAllSets(themeFilter)
                .then(sets => legoSets.getAllThemes()
                    .then(themes => res.render('sets', {
                        sets,
                        themes,
                        selectedTheme: themeFilter,
                    })))
                .catch(err => res.render('505', { message: `Unable to load sets: ${err.message}` }));
        });

        // Route to display a specific set by set number
        app.get('/lego/sets/:set_num', (req, res) => {
            legoSets.getSetByNum(req.params.set_num)
                .then(set => res.render('set', { set }))
                .catch(err => res.status(404).render('404', { message: err.message }));
        });

        // Route to render "Add Set" form
        app.get('/lego/addSet', (req, res) => {
            legoSets.getAllThemes()
                .then(themes => res.render('addSet', { themes }))
                .catch(err => res.render('505', { message: `Unable to load themes: ${err.message}` }));
        });

        // Route to handle "Add Set" form submission
        app.post('/lego/addSet', (req, res) => {
            legoSets.addSet(req.body)
                .then(() => res.redirect('/lego/sets'))
                .catch(err => res.render('505', { message: `Unable to add set: ${err.message}` }));
        });

        // Route to render "Edit Set" form
        app.get('/lego/editSet/:num', (req, res) => {
            const setNum = req.params.num;
            Promise.all([legoSets.getSetByNum(setNum), legoSets.getAllThemes()])
                .then(([setData, themeData]) => {
                    res.render('editSet', { themes: themeData, set: setData });
                })
                .catch(err => res.status(404).render('404', { message: err.message }));
        });

        // Route to handle "Edit Set" form submission
        app.post('/lego/editSet', (req, res) => {
            const setNum = req.body.set_num;
            legoSets.updateSet(setNum, req.body)
                .then(() => res.redirect('/lego/sets'))
                .catch(err => res.render('505', { message: `Unable to update set: ${err.message}` }));
        });

        // Route to delete a set
        app.get('/lego/deleteSet/:set_num', (req, res) => {
            legoSets.deleteSet(req.params.set_num)
                .then(() => res.redirect('/lego/sets'))
                .catch(err => res.render('505', { message: `I'm sorry, but we have encountered the following error: ${err.message}` }));
        });

        // Home route with featured sets
        app.get('/', (req, res) => {
            legoSets.getFeaturedSets()
                .then(featuredSets => res.render('home', { featuredSets }))
                .catch(err => res.render('505', { message: `Unable to load featured sets: ${err.message}` }));
        });

        // About route
        app.get('/about', (req, res) => {
            res.render('about');
        });

        // 404 Error: Undefined Routes
        app.use((req, res) => {
            res.status(404).render('404', { message: "Page not found." });
        });

        // 500 Error: Middleware for Internal Server Errors
        app.use((err, req, res, next) => {
            console.error("Internal Server Error:", err.message);
            res.status(500).render('505', { message: `Internal Server Error: ${err.message}` });
        });
    })
    .catch(err => {
        console.error("Initialization failed:", err);
        app.get('*', (req, res) => {
            res.status(500).send("Initialization failed. Please try again later.");
        });
    });

// Start the server with dynamic port handling
const PORT = process.env.PORT || 1000;

function startServer(port) {
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.warn(`Port ${port} is already in use. Trying a different port...`);
            startServer(port + 1); // Increment the port number and try again
        } else {
            console.error("Failed to start server:", err.message);
        }
    });
}

startServer(PORT);

module.exports = app;
